import puppeteer from "puppeteer";

const logoUrl = "https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png";

export const generatePromotionReportPDF = async ({
  fullName,
  email,
  phone,
  fromClass,
  toClass,
  feeStructure,
  promotedAt,
}) => {
  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #ccc;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .logo {
            height: 60px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            border-bottom: 1px solid #aaa;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            font-size: 14px;
            text-align: center;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Promotion Report</h1>
          <img src="${logoUrl}" class="logo" alt="School Logo"/>
        </div>

        <div class="section">
          <div class="section-title">Student Information</div>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Promoted From:</strong> ${fromClass}</p>
          <p><strong>Promoted To:</strong> ${toClass}</p>
          <p><strong>Date:</strong> ${new Date(promotedAt).toLocaleString()}</p>
        </div>

        <div class="section">
          <div class="section-title">Updated Fee Structure</div>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tuition - First Term</td>
                <td>₹${feeStructure.tuition?.firstTerm || 0}</td>
              </tr>
              <tr>
                <td>Tuition - Second Term</td>
                <td>₹${feeStructure.tuition?.secondTerm || 0}</td>
              </tr>
              <tr>
                <td>Transport (One Time)</td>
                <td>₹${feeStructure.transport || 0}</td>
              </tr>
              <tr>
                <th>Total</th>
                <th>₹${feeStructure.total || 0}</th>
              </tr>
              <tr>
                <td>Paid</td>
                <td>₹0</td>
              </tr>
              <tr>
                <td><strong>Balance</strong></td>
                <td><strong>₹${feeStructure.total || 0}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          This is an auto-generated promotion report from Vidhyardhi School.
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      bottom: "20px",
      left: "30px",
      right: "30px",
    },
  });

  await browser.close();
  return pdfBuffer;
};
