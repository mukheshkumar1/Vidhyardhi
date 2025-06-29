import puppeteer from "puppeteer";

const logoUrl =
  "https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png";

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
  const breakdownHtml = `
    ${
      breakdown["tuition.firstTerm"]
        ? `<tr><td>🎓 Tuition - First Term</td><td>₹${breakdown["tuition.firstTerm"]}</td></tr>`
        : ""
    }
    ${
      breakdown["tuition.secondTerm"]
        ? `<tr><td>📘 Tuition - Second Term</td><td>₹${breakdown["tuition.secondTerm"]}</td></tr>`
        : ""
    }
    ${
      breakdown["transport"]
        ? `<tr><td>🚌 Transport</td><td>₹${breakdown["transport"]}</td></tr>`
        : ""
    }
  `;

  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #2c3e50;
            background-color: #fdfdfd;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #8e44ad;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header .left h1 {
            font-size: 26px;
            color: #8e44ad;
            margin: 0;
          }
          .header .left p {
            margin: 4px 0;
            font-size: 14px;
            color: #555;
          }
          .header img {
            height: 70px;
            border-radius: 8px;
          }

          .section {
            margin-bottom: 30px;
            padding: 15px 20px;
            border: 1px solid #ddd;
            border-left: 5px solid #8e44ad;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #8e44ad;
            margin-bottom: 12px;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 5px;
          }
          .section p {
            font-size: 14px;
            margin: 6px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            background: #fff;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          }
          th, td {
            border: 1px solid #eee;
            padding: 10px 14px;
            text-align: left;
          }
          th {
            background-color: #f4e1f2;
            color: #333;
          }
          tbody tr:nth-child(even) {
            background-color: #fdf7ff;
          }
          .footer {
            margin-top: 50px;
            font-size: 13px;
            text-align: center;
            color: #888;
          }
            h1{
                color: #8e44ad;
                text: bold;
            }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="left">
            <h1>Vidhyardhi School</h1>
            <p>🏫 Near Current Office Railyway</p>
            <p> Gayatri Nagar </p>
            <p> Nellore, Andhra Pradesh, India, 524004</p>
            <p>📞 +91-9876543210 | ✉️ vidhyardhie.m.school25@gmail.com</p>
          </div>
          <img src="${logoUrl}" alt="School Logo" />
        </div>

        <div class="section">
          <div class="section-title">👤 Student Details</div>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Class:</strong> ${className}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${contact}</p>
        </div>

        <div class="section">
          <div class="section-title">💳 Transaction Details</div>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
        </div>

        <div class="section">
          <div class="section-title">💰 Payment Breakdown</div>
          <table>
            <thead>
              <tr><th>Component</th><th>Amount (₹)</th></tr>
            </thead>
            <tbody>
              ${breakdownHtml}
              <tr><th>Total Paid</th><th>₹${amount}</th></tr>
              <tr><td><strong>Remaining Balance</strong></td><td><strong>₹${balance}</strong></td></tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          Thank you for your payment!<br/>
          This is a system-generated receipt — no signature required.
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
