import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  fullName: String,
  className: String,
  dob: {
    type: String, 
    required: true,
  },
  address: String,
  aadharNumber: Number,
  motherName: String,
  fatherName: String,
  phone: String,
  secondaryPhone: String,
  email: String,
  password: String,

  subjects: {
    telugu: String,
    hindi: String,
    english: String,
    maths: String,
    Science: String,
    Social: String,
    computer: String,
  },

  profilePicture: {
    imageUrl: {
      type: String,
      required: true,
    },
  },
  gallery: [
    {
      imageUrl: String,
      thumbnail: String,
      publicId: String,
      uploadedAt: Date,
    },
  ],
  performance: {
    formativeAssessment1: { type: mongoose.Schema.Types.Mixed, default: {} },
    formativeAssessment2: { type: mongoose.Schema.Types.Mixed, default: {} },
    formativeAssessment3: { type: mongoose.Schema.Types.Mixed, default: {} },
    formativeAssessment4: { type: mongoose.Schema.Types.Mixed, default: {} },
    summativeAssessment1: { type: mongoose.Schema.Types.Mixed, default: {} },
    summativeAssessment2: { type: mongoose.Schema.Types.Mixed, default: {} },
    average: { type: Number } 
  },

  homework: [
    {
      homeworkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework',
      },
      status: {
        type: String,
        enum: ['Not Submitted', 'Submitted', 'Checked'],
        default: 'Not Submitted',
      },
      driveLink: String,
      submittedAt: Date,
    },
  ],

  feeStructure: {
    total: {
      type: Number,
      required: true,
    },
    tuition: {
      firstTerm: { type: Number, default: 0 },
      secondTerm: { type: Number, default: 0 },
    },
    
    transport: {
      type: Number,
      default: 0,
    },
    kit: {
      type: Number,
      default: 0,
    },
    paid: { type: Number, default: 0 },
    balance: {
      type: Number,
      default: function () {
        return this.total;
      },
    },
    // ✅ Track payment status component-wise
    paidComponents: {
      "tuition.firstTerm": { type: Number, default: 0 },
      "tuition.secondTerm": { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      kit: { type: Number, default: 0 },
    }
  },

  feePayments: [
    {
      amount: Number,
      mode: String,
      transactionId: String,
      paymentMethod: String,
      term: {
        type: String,
        enum: ['First Term', 'Second Term'],
      },
      paidFor: {
        tuition: { type: Boolean, default: false },
        transport: { type: Boolean, default: false },
        kit: { type: Boolean, default: false },
      },
      date: Date
    }
  ],

  attendance: {
    daily: {
      type: Map,
      of: String,
      default: {},
    },
    monthly: {
      type: Map,
      of: new mongoose.Schema({
        workingDays: { type: Number, default: 0 },
        presentDays: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      }, { _id: false })
    },
    yearly: {
      workingDays: { type: Number, default: 0 },
      presentDays: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    }
  },

  history: [
    {
      className: String,
      feeStructure: {
        paid: Number,
        balance: Number
      },
      performance: {
        summativeAssessment2: mongoose.Schema.Types.Mixed,
        average: { type: Number } 
      },
      attendance: {
        yearly: {
          percentage: { type: Number, default: 0 }
        }
      },
      promotedAt: { type: Date, default: Date.now }
    }
  ],

  electionHistory: [
    {
      year: Number,
      month: Number,
      className: String,
      timesElected: Number
    }
  ],

  votedElections: [
    {
      year: Number,
      month: Number,
      className: String,
      votedFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
      },
      candidateName: String,
      votedAt: { type: Date, default: Date.now }
    }
  ],

  votes: { type: Number, default: 0 },
  isCurrentLeader: { type: Boolean, default: false },
  isCandidate: { type: Boolean, default: false },

  extraCurricular: [
    {
      activityName: String,
      outOf: Number,
      scored: Number,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  

  otp: { type: String },
  otpExpires: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
