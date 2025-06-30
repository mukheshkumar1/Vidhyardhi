import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const generateFeeReceiptPDF = async ({
  name,
  email,
  contact,
  className,
  date,
  transactionId,
  amount,
  balance,
  breakdown,
}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let y = height - 50;

  // Header
  page.drawText("Vidhyardhi School", {
    x: 50,
    y,
    size: 22,
    font: boldFont,
    color: rgb(0.55, 0.2, 0.7),
  });

  y -= 25;
  page.drawText("🏫 Near Current Office Railway", { x: 50, y, size: 12, font });
  y -= 15;
  page.drawText("Gayatri Nagar, Nellore, Andhra Pradesh, 524004", { x: 50, y, size: 12, font });
  y -= 15;
  page.drawText("📞 +91-9876543210 | ✉️ vidhyardhie.m.school25@gmail.com", { x: 50, y, size: 12, font });

  // Student Info
  y -= 35;
  page.drawText("👤 Student Details", { x: 50, y, size: 14, font: boldFont });
  y -= 20;
  page.drawText(`Name: ${name}`, { x: 60, y, size: 12, font });
  y -= 15;
  page.drawText(`Class: ${className}`, { x: 60, y, size: 12, font });
  y -= 15;
  page.drawText(`Email: ${email}`, { x: 60, y, size: 12, font });
  y -= 15;
  page.drawText(`Phone: ${contact}`, { x: 60, y, size: 12, font });

  // Transaction Info
  y -= 30;
  page.drawText("💳 Transaction Details", { x: 50, y, size: 14, font: boldFont });
  y -= 20;
  page.drawText(`Date: ${date}`, { x: 60, y, size: 12, font });
  y -= 15;
  page.drawText(`Transaction ID: ${transactionId}`, { x: 60, y, size: 12, font });

  // Breakdown
  y -= 30;
  page.drawText("💰 Payment Breakdown", { x: 50, y, size: 14, font: boldFont });
  y -= 20;

  const renderRow = (label, value) => {
    page.drawText(label, { x: 60, y, size: 12, font });
    page.drawText(`₹${value}`, { x: 350, y, size: 12, font });
    y -= 15;
  };

  if (breakdown["tuition.firstTerm"]) renderRow("🎓 Tuition - First Term", breakdown["tuition.firstTerm"]);
  if (breakdown["tuition.secondTerm"]) renderRow("📘 Tuition - Second Term", breakdown["tuition.secondTerm"]);
  if (breakdown["transport"]) renderRow("🚌 Transport", breakdown["transport"]);

  y -= 10;
  renderRow("Total Paid", amount);
  renderRow("Remaining Balance", balance);

  // Footer
  y -= 40;
  page.drawText("Thank you for your payment!", { x: 50, y, size: 12, font, color: rgb(0.2, 0.5, 0.2) });
  y -= 15;
  page.drawText("This is a system-generated receipt — no signature required.", {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
