const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateMonthlyReportPDF = (sales, year, month) => {
  return new Promise((resolve, reject) => {
    try {
      const reportsDir = path.join(__dirname, "../reports");

      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
      }

      const filePath = path.join(
        reportsDir,
        `monthly-report-${year}-${month}.pdf`
      );

      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ===============================
      // HEADER SECTION
      // ===============================
      doc
        .fontSize(24)
        .fillColor("#2563eb")
        .text("SMARTSHOP LITE", { align: "center" });

      doc
        .moveDown(0.5)
        .fontSize(14)
        .fillColor("black")
        .text(`Monthly Sales Report - ${month}/${year}`, {
          align: "center",
        });

      doc
        .moveDown(0.3)
        .fontSize(10)
        .fillColor("gray")
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: "center",
        });

      doc.moveDown(1.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ===============================
      // CALCULATIONS
      // ===============================
      let totalSales = 0;
      let cashTotal = 0;
      let upiTotal = 0;

      sales.forEach((sale) => {
        totalSales += sale.totalAmount;

        if (sale.paymentMethod === "Cash") {
          cashTotal += sale.totalAmount;
        } else {
          upiTotal += sale.totalAmount;
        }
      });

      // ===============================
      // SUMMARY SECTION
      // ===============================
      doc.fontSize(16).fillColor("#111827").text("Summary Overview");
      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor("black")
        .text(`Total Transactions: ${sales.length}`)
        .text(`Total Revenue: ₹${totalSales.toFixed(2)}`)
        .text(`Cash Revenue: ₹${cashTotal.toFixed(2)}`)
        .text(`UPI Revenue: ₹${upiTotal.toFixed(2)}`);

      doc.moveDown(1.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ===============================
      // TABLE HEADER
      // ===============================
      doc.fontSize(14).text("Transaction Details");
      doc.moveDown(0.5);

      const tableTop = doc.y;

      doc
        .fontSize(11)
        .text("Invoice ID", 50, tableTop)
        .text("Date", 220, tableTop)
        .text("Payment", 350, tableTop)
        .text("Amount", 450, tableTop);

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      let position = doc.y + 5;

      // ===============================
      // TABLE ROWS
      // ===============================
      sales.forEach((sale) => {
        doc
          .fontSize(10)
          .text(sale._id.toString().slice(-8), 50, position)
          .text(
            new Date(sale.createdAt).toLocaleDateString("en-IN"),
            220,
            position
          )
          .text(sale.paymentMethod, 350, position)
          .text(`₹${sale.totalAmount.toFixed(2)}`, 450, position);

        position += 20;

        // Add new page if needed
        if (position > 750) {
          doc.addPage();
          position = 50;
        }
      });

      doc.moveDown(2);

      // ===============================
      // FOOTER
      // ===============================
      doc
        .fontSize(10)
        .fillColor("gray")
        .text(
          "This report is system generated. SmartShop Lite © 2026",
          50,
          800,
          { align: "center" }
        );

      doc.end();

      stream.on("finish", () => resolve(filePath));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateMonthlyReportPDF };