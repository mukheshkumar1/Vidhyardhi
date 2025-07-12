import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fetch from 'node-fetch';

const logoUrl = 'https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png';

export const generateFeeReceiptPDF = async ({
  name,
  className,
  transactionId,
  modeOfTransaction,
  breakdown,
  amount,
  balance,
  paymentDate,
}) => {
  name = name ?? '';
  className = className ?? '';
  transactionId = transactionId ?? '';
  modeOfTransaction = modeOfTransaction ?? 'N/A';
  amount = amount ?? 0;
  balance = balance ?? 0;
  paymentDate = paymentDate
    ? new Date(paymentDate).toLocaleDateString('en-IN')
    : 'N/A';

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
  const logo = await pdfDoc.embedPng(logoBytes);

  // Border
  page.drawRectangle({
    x: 10,
    y: 10,
    width: width - 20,
    height: height - 20,
    borderColor: rgb(0.5, 0, 0.5),
    borderWidth: 2,
  });

  // Watermark
  const wmDims = logo.scale(0.45);
  page.drawImage(logo, {
    x: width / 2 - wmDims.width / 2,
    y: height / 2 - wmDims.height / 2,
    width: wmDims.width,
    height: wmDims.height,
    opacity: 0.05,
  });

  // Header
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

  // Title
  y -= 50;
  const title = 'FEE RECEIPT';
  const titleWidth = bold.widthOfTextAtSize(title, 16);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y,
    size: 16,
    font: bold,
    color: rgb(0.5, 0, 0.5),
  });

  y -= 40;

  // Basic Info Table
  const tableX = 40;
  const rowHeight = 30;
  const colWidths = [250, 250];
  let rowY = y;

  const basicInfo = [
    ['Student Name', name],
    ['Class', className],
    ['Transaction ID', transactionId],
    ['Mode of Transaction', modeOfTransaction.toUpperCase()],
    ['Payment Date', paymentDate],
  ];

  // Header row
  page.drawRectangle({
    x: tableX,
    y: rowY,
    width: colWidths[0] + colWidths[1],
    height: rowHeight,
    color: rgb(0.95, 0.85, 0.95),
    borderColor: rgb(0.5, 0, 0.5),
    borderWidth: 1,
  });

  page.drawText('Field', { x: tableX + 10, y: rowY + 9, size: 12, font: bold });
  page.drawText('Details', { x: tableX + colWidths[0] + 10, y: rowY + 9, size: 12, font: bold });

  let lastRowY = rowY;
  basicInfo.forEach(([label, value], i) => {
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
    page.drawText(String(label), { x: tableX + 10, y: rowY + 9, size: 12, font });
    page.drawText(String(value), { x: tableX + colWidths[0] + 10, y: rowY + 9, size: 12, font });
  });

  page.drawLine({
    start: { x: tableX + colWidths[0], y: y },
    end: { x: tableX + colWidths[0], y: lastRowY },
    thickness: 1,
    color: rgb(0.5, 0, 0.5),
  });

  // Breakdown
  y = lastRowY - 50;
  page.drawText('Fee Breakdown', {
    x: tableX,
    y,
    size: 14,
    font: bold,
    color: rgb(0.5, 0, 0.5),
  });

  y -= 20;
  rowY = y;

  const breakdownRows = [
    breakdown?.tuitionFirstTerm && ['Tuition - First Term', `Rs.${breakdown.tuitionFirstTerm}`],
    breakdown?.tuitionSecondTerm && ['Tuition - Second Term', `Rs.${breakdown.tuitionSecondTerm}`],
    breakdown?.kit && ['Kit', `Rs.${breakdown.kit}`],
    breakdown?.transport && ['Transport', `Rs.${breakdown.transport}`],
    ['Total Paid', `Rs.${amount}`],
    ['Remaining Balance', `Rs.${balance}`],
  ].filter(Boolean);

  page.drawRectangle({
    x: tableX,
    y: rowY,
    width: colWidths[0] + colWidths[1],
    height: rowHeight,
    color: rgb(0.93, 0.88, 0.96),
    borderColor: rgb(0.5, 0, 0.5),
    borderWidth: 1,
  });

  page.drawText('Component', { x: tableX + 10, y: rowY + 9, size: 12, font: bold });
  page.drawText('Amount', { x: tableX + colWidths[0] + 10, y: rowY + 9, size: 12, font: bold });

  let lastBreakdownRowY = rowY;

  breakdownRows.forEach(([label, value], i) => {
    rowY = y - rowHeight * (i + 1);
    lastBreakdownRowY = rowY;
    page.drawRectangle({
      x: tableX,
      y: rowY,
      width: colWidths[0] + colWidths[1],
      height: rowHeight,
      borderColor: rgb(0.5, 0, 0.5),
      borderWidth: 1,
    });
    page.drawText(String(label), { x: tableX + 10, y: rowY + 9, size: 12, font });
    page.drawText(String(value), { x: tableX + colWidths[0] + 10, y: rowY + 9, size: 12, font });
  });

  page.drawLine({
    start: { x: tableX + colWidths[0], y: y },
    end: { x: tableX + colWidths[0], y: lastBreakdownRowY },
    thickness: 1,
    color: rgb(0.5, 0, 0.5),
  });

  // Footer
  y = lastBreakdownRowY - 50;

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
  page.drawText('Note: All payments are non-refundable.', {
    x: tableX,
    y,
    size: 11,
    font,
    color: rgb(0.7, 0.2, 0.2),
  });

  y -= 20;
  page.drawText('This is a system-generated receipt. No signature required if auto-issued.', {
    x: tableX,
    y,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
