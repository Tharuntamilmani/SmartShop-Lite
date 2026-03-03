const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (sale) => {
  return new Promise((resolve, reject) => {
    try {
      const invoicesDir = path.join(__dirname, "../invoices");

      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir);
      }

      const filePath = path.join(invoicesDir, `invoice-${sale._id}.pdf`);

      const doc = new PDFDocument({ margin: 40 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ==============================
      // HEADER
      // ==============================
      doc
        .fontSize(22)
        .text("EcoCart", { align: "center" })
        .moveDown(0.3);

      doc
        .fontSize(10)
        .text("Your Local Digital Billing System", { align: "center" })
        .moveDown(1);

      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ==============================
      // INVOICE DETAILS
      // ==============================
      doc.fontSize(12);
      doc.text(`Invoice ID: ${sale._id.toString().slice(-6)}`);
      doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`);
      doc.text(`Payment Method: ${sale.paymentMethod}`);
      doc.moveDown(1);

      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ==============================
      // TABLE HEADER
      // ==============================
      const tableTop = doc.y;

      doc.fontSize(12).text("Item", 40, tableTop);
      doc.text("Qty", 300, tableTop);
      doc.text("Price", 350, tableTop);
      doc.text("Total", 450, tableTop);

      doc.moveDown();
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

      // ==============================
      // TABLE ROWS
      // ==============================
      let position = doc.y + 5;

      sale.items.forEach((item) => {
        const itemTotal = item.quantity * item.price;

        // SAFETY CHECK
        const productName =
          typeof item.product === "object" && item.product.name
            ? item.product.name
            : "Product";

        doc.text(productName, 40, position);
        doc.text(item.quantity.toString(), 300, position);
        doc.text(`₹${item.price.toFixed(2)}`, 350, position);
        doc.text(`₹${itemTotal.toFixed(2)}`, 450, position);

        position += 20;
      });

      doc.moveTo(40, position).lineTo(550, position).stroke();

      // ==============================
      // GRAND TOTAL
      // ==============================
      doc
        .fontSize(14)
        .text(
          `Grand Total: ₹${sale.totalAmount.toFixed(2)}`,
          350,
          position + 20,
          { align: "right" }
        );

      doc.moveDown(4);

      // ==============================
      // FOOTER
      // ==============================
      doc
        .fontSize(10)
        .text("Thank you for shopping with us!", { align: "center" })
        .text("Visit again ", { align: "center" });

      doc.end();

      stream.on("finish", () => resolve(filePath));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };