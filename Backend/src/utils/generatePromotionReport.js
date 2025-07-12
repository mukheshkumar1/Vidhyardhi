import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fetch from 'node-fetch';

const logoUrl = 'https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png';

export const generatePromotionReportPDF = async ({
  fullName,
  email,
  phone,
  fromClass,
  toClass,
  feeStructure,
  promotedAt,
}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
  const logo = await pdfDoc.embedPng(logoBytes);

  // === Watermark ===
  const wmDims = logo.scale(0.5);
  page.drawImage(logo, {
    x: width / 2 - wmDims.width / 2,
    y: height / 2 - wmDims.height / 2,
    width: wmDims.width,
    height: wmDims.height,
    opacity: 0.05,
  });

  // === Header ===
  let y = height - 50;
  const headerLogoDims = logo.scale(0.18);
  page.drawImage(logo, {
    x: width - headerLogoDims.width - 40,
    y: y - headerLogoDims.height + 10,
    width: headerLogoDims.width,
    height: headerLogoDims.height,
  });

  page.drawText('Vidhyardhi English Medium School', {
    x: 40,
    y,
    size: 18,
    font: bold,
    color: rgb(0.5, 0, 0.5),
  });

  y -= 22;
  page.drawText('Door no: 26-175/1', { x: 40, y, size: 12, font });
  y -= 15;
  page.drawText('Gayatri Nagar, Near Current Office Railway', { x: 40, y, size: 12, font });
  y -= 15;
  page.drawText('Nellore, Andhra Pradesh, India, 524004', { x: 40, y, size: 12, font });
  y -= 15;
  page.drawText('+91-9849244277 | vidhyardhie.m.school25@gmail.com', { x: 40, y, size: 12, font });

  // === Title ===
  y -= 50;
  const title = 'Promotion Report';
  const titleWidth = bold.widthOfTextAtSize(title, 16);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y,
    size: 16,
    font: bold,
    color: rgb(0.5, 0, 0.5),
  });

  // === Student Info Table ===
  y -= 40;
  const tableX = 40;
  const rowHeight = 25;
  const colWidths = [200, 300];

  const infoRows = [
    ['Student Name', fullName],
    ['Email', email],
    ['Phone', phone],
    ['From Class', fromClass],
    ['To Class', toClass],
    ['Promoted On', new Date(promotedAt).toLocaleString()],
  ];

  let rowY = y;
  page.drawRectangle({
    x: tableX,
    y: rowY,
    width: colWidths[0] + colWidths[1],
    height: rowHeight,
    color: rgb(0.93, 0.88, 0.96),
    borderColor: rgb(0.5, 0, 0.5),
    borderWidth: 1,
  });

  page.drawText('Field', { x: tableX + 10, y: rowY + 7, size: 12, font: bold });
  page.drawText('Details', { x: tableX + colWidths[0] + 10, y: rowY + 7, size: 12, font: bold });

  let lastRowY = rowY;
  infoRows.forEach(([label, value], i) => {
    rowY = y - rowHeight * (i + 1);
    lastRowY = rowY;
    page.drawRectangle({
      x: tableX,
      y: rowY,
      width: colWidths[0] + colWidths[1],
      height: rowHeight,
      borderColor: rgb(0.5, 0, 0.5),
      borderWidth: 1,
    });
    page.drawText(label, { x: tableX + 10, y: rowY + 7, size: 12, font });
    page.drawText(String(value), { x: tableX + colWidths[0] + 10, y: rowY + 7, size: 12, font });
  });

  // Vertical line
  page.drawLine({
    start: { x: tableX + colWidths[0], y },
    end: { x: tableX + colWidths[0], y: lastRowY },
    thickness: 1,
    color: rgb(0.5, 0, 0.5),
  });

  // === Fee Structure Table ===
y = lastRowY - 30;
page.drawText('Updated Fee Structure', {
  x: tableX,
  y,
  size: 14,
  font: bold,
  color: rgb(0.5, 0, 0.5),
});

y -= 20;
rowY = y;


  const feeRows = [
    ['Tuition - First Term', `Rs.${feeStructure?.tuition?.firstTerm ?? 0}`],
    ['Tuition - Second Term', `Rs.${feeStructure?.tuition?.secondTerm ?? 0}`],
    ['Transport (One Time)', `Rs.${feeStructure?.transport ?? 0}`],
    ['Kit Fee', `Rs.${feeStructure?.kit ?? 0}`],
    ['Total', `Rs.${feeStructure?.total ?? 0}`],
    ['Paid', `Rs.0`],
    ['Balance', `Rs.${feeStructure?.total ?? 0}`],
  ];

  page.drawRectangle({
    x: tableX,
    y: rowY,
    width: colWidths[0] + colWidths[1],
    height: rowHeight,
    color: rgb(0.95, 0.9, 0.95),
    borderColor: rgb(0.5, 0, 0.5),
    borderWidth: 1,
  });

  page.drawText('Component', { x: tableX + 10, y: rowY + 7, size: 12, font: bold });
  page.drawText('Amount (Rs.)', { x: tableX + colWidths[0] + 10, y: rowY + 7, size: 12, font: bold });

  let lastFeeRowY = rowY;

  feeRows.forEach(([label, value], i) => {
    rowY = y - rowHeight * (i + 1);
    lastFeeRowY = rowY;
    page.drawRectangle({
      x: tableX,
      y: rowY,
      width: colWidths[0] + colWidths[1],
      height: rowHeight,
      borderColor: rgb(0.5, 0, 0.5),
      borderWidth: 1,
    });
    page.drawText(label, { x: tableX + 10, y: rowY + 7, size: 12, font });
    page.drawText(value, { x: tableX + colWidths[0] + 10, y: rowY + 7, size: 12, font });
  });

  page.drawLine({
    start: { x: tableX + colWidths[0], y },
    end: { x: tableX + colWidths[0], y: lastFeeRowY },
    thickness: 1,
    color: rgb(0.5, 0, 0.5),
  });

  // === Footer ===
  y = lastFeeRowY - 40;
  page.drawText('Authorized Signature:', {
    x: width - 250,
    y,
    size: 12,
    font: bold,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawLine({
    start: { x: width - 120, y: y + 2 },
    end: { x: width - 40, y: y + 2 },
    thickness: 1,
    color: rgb(0.4, 0.4, 0.4),
  });

  y -= 40;
  page.drawText('This is a system-generated promotion report. No signature required.', {
    x: tableX,
    y,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
