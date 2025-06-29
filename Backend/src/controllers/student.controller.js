import Student from "../models/student.model.js";
import Notification from "../models/notification.model.js";
import sendEmail from "../utils/sendEmail.js";
import VotingPeriod from "../models/voting.model.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import { razorpayInstance, RAZORPAY_KEY_ID } from "../utils/RazorPay.js";
import { generateFeeReceiptPDF } from "../utils/generateReceipt.js";


export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user._id; // Set by auth middleware

    // Use .lean() to get plain JS object, so we can modify it
    const student = await Student.findById(studentId).select("-password").lean();
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Flatten profilePicture.imageUrl to profilePicture string for frontend convenience
    student.profilePicture = student.profilePicture?.imageUrl || null;

    res.status(200).json(student);
  } catch (error) {
    console.error("Fetch Profile Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//--------------------------Student Details---------------------

// Corrected getStudentAcademicDetails
export const getStudentAcademicDetails = async (req, res) => {
  try {
    const requestedStudentId = req.params.studentId;
    const loggedInUserId = req.user._id;

    if (req.user.role !== "admin" && requestedStudentId !== loggedInUserId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const student = await Student.findById(requestedStudentId).select(
      "fullName className attendance feeStructure performance history feePayments"
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const academicHistory = student.history || [];

    const formattedFeeStructure = {
      firstTerm: student.feeStructure?.tuition?.firstTerm || 0,
      secondTerm: student.feeStructure?.tuition?.secondTerm || 0,
      transport: student.feeStructure?.transport || 0,
      paid: student.feeStructure?.paid || 0,
      balance: student.feeStructure?.balance || 0,
      paidComponents: {},
    };

    // Build paidComponents (for frontend button disabling)
    for (const payment of student.feePayments || []) {
      for (const key in payment.breakdown) {
        formattedFeeStructure.paidComponents[key] =
          (formattedFeeStructure.paidComponents[key] || 0) + payment.breakdown[key];
      }
    }

    const firstClass =
      academicHistory.length > 0
        ? academicHistory[0].className
        : student.className;

    res.status(200).json({
      fullName: student.fullName,
      currentClass: student.className,
      feeStructure: formattedFeeStructure,
      performance: student.performance,
      attendance: student.attendance,
      fromClass: firstClass,
      classHistory: academicHistory,
      feePayments: student.feePayments || [], // include current payments for history UI
    });
  } catch (error) {
    console.error("Get Student Academic Details Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




//----------------------Fee pay----------------------------------
export const payFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { paymentBreakdown, mode, transactionId } = req.body;

    if (!paymentBreakdown || !mode) {
      return res.status(400).json({ error: "Payment breakdown and mode are required." });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });

    let totalPaidNow = 0;

    
    const validPaths = ["tuition.firstTerm", "tuition.secondTerm", "transport"];

    for (const [path, amount] of Object.entries(paymentBreakdown)) {
      if (!validPaths.includes(path)) {
        return res.status(400).json({ error: `Invalid fee component: ${path}` });
      }

      if (typeof amount !== "number" || amount < 0) {
        return res.status(400).json({ error: `Invalid amount for ${path}` });
      }

      let alreadyPaid = 0;
      let maxAllowed = 0;

      if (path === "transport") {
        alreadyPaid = student.feeStructure.paidComponents?.transport || 0;
        maxAllowed = student.feeStructure.transport;
      } else {
        const [section, term] = path.split(".");
        alreadyPaid = student.feeStructure.paidComponents?.[path] || 0;
        maxAllowed = student.feeStructure[section]?.[term];
      }

      if (alreadyPaid + amount > maxAllowed) {
        return res.status(400).json({ error: `Overpayment in ${path}. Trying to pay ${amount} on top of ${alreadyPaid}, limit ${maxAllowed}` });
      }

      student.feeStructure.paidComponents = student.feeStructure.paidComponents || {};
      if (path === "transport") {
        student.feeStructure.paidComponents.transport = alreadyPaid + amount;
      } else {
        student.feeStructure.paidComponents[path] = alreadyPaid + amount;
      }

      totalPaidNow += amount;
    }

    
    student.feeStructure.paid = (student.feeStructure.paid || 0) + totalPaidNow;
    student.feeStructure.balance = student.feeStructure.total - student.feeStructure.paid;

    const paymentDate = new Date();
    student.feePayments = student.feePayments || [];
    student.feePayments.push({
      amount: totalPaidNow,
      mode,
      transactionId: mode === "upi" ? transactionId : null,
      breakdown: paymentBreakdown,
      date: paymentDate
    });

    await student.save();

    const notification = new Notification({
      title: "Fee Payment Received",
      message: `${student.fullName} paid ₹${totalPaidNow} via ${mode}`,
      studentId,
      amount: totalPaidNow,
      mode,
      transactionId,
      date: paymentDate
    });
    await notification.save();

   
    const breakdownHtml = Object.entries(paymentBreakdown)
      .map(([k, v]) => `<li>${k}: ₹${v}</li>`)
      .join("");

    await sendEmail(
      student.email,
      "Vidhyardhi School Fee Payment Confirmation",
      `
        <p>Dear ${student.fullName},</p>
        <p>We have received your payment of <strong>₹${totalPaidNow}</strong> via <strong>${mode}</strong> on <strong>${paymentDate.toLocaleString()}</strong>.</p>
        ${transactionId ? `<p>Transaction ID: <strong>${transactionId}</strong></p>` : ""}
        <p><strong>Breakdown:</strong></p>
        <ul>${breakdownHtml}</ul>
        <p><strong>Remaining Balance:</strong> ₹${student.feeStructure.balance}</p>
        <p>Thank you!</p>
      `
    );

    res.status(200).json({ message: "Payment recorded successfully", student });
  } catch (err) {
    console.error("Pay Fees Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await Student.findById(studentId).select("attendance fullName className history");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { attendance, history } = student;

    // Extract last class's attendance from history
    const lastClassRecord = history?.length > 0 ? history[history.length - 1] : null;

    res.status(200).json({
      fullName: student.fullName,
      className: student.className,
      attendance: {
        current: {
          daily: attendance?.daily || {},
          monthly: attendance?.monthly || {},
          yearly: attendance?.yearly || {
            workingDays: 0,
            presentDays: 0,
            percentage: 0,
          },
        },
        previous: lastClassRecord
          ? {
              className: lastClassRecord.className || "Unknown",
              yearly: lastClassRecord.attendance?.yearly || {
                percentage: 0,
              },
              promotedAt: lastClassRecord.promotedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//-------------------------razorpay---------------------------

export const createRazorpayOrder = async (req, res) => {
  try {
    const { breakdown } = req.body;
    const studentId = req.user._id;

    if (!studentId) {
      return res.status(400).json({ error: "Missing student ID" });
    }

    if (!breakdown || typeof breakdown !== "object") {
      return res.status(400).json({ error: "Missing or invalid payment breakdown" });
    }

    // Allowed breakdown keys
    const allowedKeys = ["tuition.firstTerm", "tuition.secondTerm", "transport"];
    let totalAmount = 0;

    for (const [key, value] of Object.entries(breakdown)) {
      if (!allowedKeys.includes(key)) {
        return res.status(400).json({ error: `Invalid fee component: ${key}` });
      }
      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({ error: `Invalid amount for ${key}` });
      }
      totalAmount += value;
    }

    // Razorpay expects paise
    const amountInPaise = Math.round(totalAmount * 100);

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Short unique receipt ID
    const shortId = studentId.toString().slice(-6);
    const timestamp = Date.now().toString().slice(-5);
    const receiptId = `rcpt_${shortId}_${timestamp}`;

    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        studentName: student.fullName,
        class: student.className,
        email: student.email,
        breakdown: JSON.stringify(breakdown), // Optional: useful for reconciling payments later
      },
    });

    return res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("Razorpay Order Error:", err);
    return res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};



//------------------------verify payment

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentBreakdown,
      paymentMethod,
    } = req.body;

    const studentId = req.user._id;
    if (!studentId) return res.status(400).json({ error: "Missing studentId" });

    if (
      !razorpay_order_id || !razorpay_payment_id || !razorpay_signature ||
      !paymentBreakdown || typeof paymentBreakdown !== "object" || !paymentMethod
    ) {
      return res.status(400).json({ error: "Missing or invalid Razorpay data" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid Razorpay signature" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const fee = student.feeStructure;
    if (!fee) return res.status(400).json({ error: "Fee structure not initialized" });

    let totalPaidNow = 0;
    fee.paidComponents = fee.paidComponents || {};

    const paidFor = {
      tuition: false,
      transport: false,
    };
    let term;

    for (const [component, amountRaw] of Object.entries(paymentBreakdown)) {
      const amount = Number(amountRaw);
      if (!["tuition.firstTerm", "tuition.secondTerm", "transport"].includes(component)) {
        return res.status(400).json({ error: `Invalid component: ${component}` });
      }

      const [main, sub] = component.split(".");
      const maxAllowed = sub ? fee[main]?.[sub] : fee[component];
      const alreadyPaid = fee.paidComponents[component] || 0;

      if ((alreadyPaid + amount) > maxAllowed) {
        return res.status(400).json({ error: `Overpayment in ${component}` });
      }

      // Update paid component tracking
      fee.paidComponents[component] = alreadyPaid + amount;
      totalPaidNow += amount;

      // Track paid component for record
      if (component === "transport") paidFor.transport = true;
      if (component === "tuition.firstTerm") {
        paidFor.tuition = true;
        term = "First Term";
      }
      if (component === "tuition.secondTerm") {
        paidFor.tuition = true;
        term = "Second Term";
      }

      // ✅ Reset component to 0 after full payment
      if (fee.paidComponents[component] >= maxAllowed) {
        if (sub) {
          if (fee[main]) fee[main][sub] = 0;
        } else {
          fee[component] = 0;
        }
      }
    }

    // ✅ Update paid and balance
    fee.paid += totalPaidNow;
    const firstTermLeft = fee.tuition.firstTerm;
    const secondTermLeft = fee.tuition.secondTerm;
    const transportLeft = fee.transport;
    fee.balance = Math.max(0, firstTermLeft + secondTermLeft + transportLeft);

    const paymentDate = new Date();

    student.feePayments = student.feePayments || [];
    student.feePayments.push({
      amount: totalPaidNow,
      mode: "razorpay",
      transactionId: razorpay_payment_id,
      paymentMethod,
      term,
      paidFor,
      breakdown: paymentBreakdown,
      date: paymentDate,
    });

    // Mark fields as modified so Mongoose saves nested updates
    student.markModified("feeStructure.paidComponents");
    student.markModified("feeStructure.tuition");
    student.markModified("feeStructure.transport");

    await student.save();

    // ✅ Generate Receipt
    const breakdownHtml = Object.entries(paymentBreakdown)
      .map(([k, v]) => `<li>${k}: ₹${v}</li>`)
      .join("");

    const pdfBuffer = await generateFeeReceiptPDF({
      name: student.fullName,
      email: student.email,
      contact: student.phone,
      className: student.className,
      date: paymentDate.toLocaleString(),
      transactionId: razorpay_payment_id,
      amount: totalPaidNow,
      balance: fee.balance,
      breakdown: paymentBreakdown,
    });

    // ✅ Send Email with PDF receipt
    await sendEmail(
      student.email,
      "Vidhyardhi School - Fee Payment Confirmation",
      `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial; background: #fff; border-radius: 8px;">
          <h2 style="text-align: center; color: #4CAF50;">Payment Confirmation</h2>
          <p>Dear <strong>${student.fullName}</strong>,</p>
          <p>We received your payment of <strong>₹${totalPaidNow}</strong> via <strong>${paymentMethod}</strong> on <strong>${paymentDate.toLocaleString()}</strong>.</p>
          <p><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
          <p><strong>Breakdown:</strong></p>
          <ul>${breakdownHtml}</ul>
          <p><strong>Remaining Balance:</strong> ₹${fee.balance}</p>
          <p>Thank you for your payment.</p>
        </div>
      `,
      [
        {
          filename: `FeeReceipt-${student.fullName}-${Date.now()}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ]
    );

    return res.status(200).json({
      message: "Payment verified and receipt sent",
      balance: fee.balance,
      paidComponents: fee.paidComponents,
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



//---------------------------------- Student Leader----------------------------------

export const voteForLeader = async (req, res) => {
  try {
    const voterId = req.user._id;
    const { candidateId, className } = req.body;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // 1. Validate voter
    const voter = await Student.findById(voterId);
    if (!voter || voter.className.toLowerCase() !== className.toLowerCase()) {
      return res.status(403).json({ message: "Invalid voter or class mismatch." });
    }

    // 2. Check voting period
    const votingPeriod = await VotingPeriod.findOne({ className });
    if (
      !votingPeriod ||
      now < new Date(votingPeriod.startDate) ||
      now > new Date(votingPeriod.endDate)
    ) {
      return res.status(403).json({ message: "Voting is currently closed for this class." });
    }

    // 3. Check if already voted
    const alreadyVoted = voter.votedElections?.some(
      (e) => e.year === year && e.month === month && e.className === className
    );
    if (alreadyVoted) {
      return res.status(400).json({ message: "You have already voted this month." });
    }

    // 4. Validate candidate
    const candidate = await Student.findOne({
      _id: candidateId,
      className: { $regex: new RegExp(`^${className}$`, 'i') },
      isCandidate: true,
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found or not eligible." });
    }

    // 5. Increment candidate's vote count
    await Student.findByIdAndUpdate(candidate._id, {
      $inc: { votes: 1 }
    });

    // 6. Update voter's record safely
    await Student.findByIdAndUpdate(voterId, {
      $push: {
        votedElections: {
          voterId,
          year,
          month,
          className,
          votedFor: candidate._id,
          candidateName: candidate.fullName,
          votedAt: new Date(),
        }
      }
    });

    return res.status(200).json({ message: "Your vote has been cast successfully!" });
  } catch (error) {
    console.error("Voting error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const getClassLeaderCandidates = async (req, res) => {
  try {
    const { className } = req.query;
    if (!className) {
      return res.status(400).json({ message: "Class name is required" });
    }

    const period = await VotingPeriod.findOne({ className });
    const now = new Date();
    if (!period || now > new Date(period.endDate)) {
      return res.status(403).json({ message: "Voting has been closed for this class." });
    }

    const candidates = await Student.find({
      isCandidate: true,
      className,
    }).sort({ votes: -1 });

    res.status(200).json({ candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
