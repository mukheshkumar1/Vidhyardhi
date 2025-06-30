import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fetch from "node-fetch";

const logoUrl = "https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png";

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
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.25);

  let y = height - 50;

  // Header
  page.drawImage(logoImage, {
    x: width - logoDims.width - 40,
    y,
    width: logoDims.width,
    height: logoDims.height,
  });

  page.drawText("Vidhyardhi School", { x: 40, y: y, size: 18, font, color: rgb(0.4, 0.1, 0.6) });
  y -= 20;
  page.drawText("Near Current Office Railway", { x: 40, y, size: 10, font });
  y -= 14;
  page.drawText("Gayatri Nagar", { x: 40, y, size: 10, font });
  y -= 14;
  page.drawText("Nellore, Andhra Pradesh, India, 524004", { x: 40, y, size: 10, font });
  y -= 14;
  page.drawText(" +91-9876543210 | ✉️ vidhyardhie.m.school25@gmail.com", { x: 40, y, size: 10, font });
  y -= 30;

  // Section: Student Info
  page.drawText("Student Details", { x: 40, y, size: 14, font, color: rgb(0.4, 0.1, 0.6) });
  y -= 18;
  page.drawText(`Name: ${name}`, { x: 50, y, size: 10, font });
  y -= 14;
  page.drawText(`Class: ${className}`, { x: 50, y, size: 10, font });
  y -= 14;
  page.drawText(`Email: ${email}`, { x: 50, y, size: 10, font });
  y -= 14;
  page.drawText(`Phone: ${contact}`, { x: 50, y, size: 10, font });
  y -= 30;

  // Section: Transaction Info
  page.drawText("Transaction Details", { x: 40, y, size: 14, font, color: rgb(0.4, 0.1, 0.6) });
  y -= 18;
  page.drawText(`Date: ${date}`, { x: 50, y, size: 10, font });
  y -= 14;
  page.drawText(`Transaction ID: ${transactionId}`, { x: 50, y, size: 10, font });
  y -= 30;

  // Section: Breakdown Table
  page.drawText("Payment Breakdown", { x: 40, y, size: 14, font, color: rgb(0.4, 0.1, 0.6) });
  y -= 20;

  const drawRow = (label, val, offsetX = 50) => {
    page.drawText(label, { x: offsetX, y, size: 10, font });
    page.drawText(`₹${val}`, { x: width - 100, y, size: 10, font });
    y -= 14;
  };

  if (breakdown["tuition.firstTerm"]) drawRow("Tuition - First Term", breakdown["tuition.firstTerm"]);
  if (breakdown["tuition.secondTerm"]) drawRow("Tuition - Second Term", breakdown["tuition.secondTerm"]);
  if (breakdown["transport"]) drawRow("Transport", breakdown["transport"]);

  drawRow("Total Paid", amount);
  drawRow("Remaining Balance", balance);

  y -= 30;
  page.drawText("Thank you for your payment!", {
    x: 40,
    y,
    size: 11,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 14;
  page.drawText("This is a system-generated receipt — no signature required.", {
    x: 40,
    y,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
