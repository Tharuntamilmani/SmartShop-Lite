const Product = require("../models/Product");
const Sale = require("../models/Sale");
const { sendSMS } = require("../services/smsService");
const { generateInvoice } = require("../services/pdfService");

// =====================================
// CREATE BILL / SALE
// =====================================
exports.createSale = async (req, res, next) => {
  try {
    const { items, paymentMethod, customerPhone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items provided",
      });
    }

    if (!paymentMethod || !["Cash", "UPI"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    let totalAmount = 0;
    const saleItems = [];
    let message = "SmartShop Lite Bill\n\n";

    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      message += `${product.name} x${item.quantity} = ₹${itemTotal}\n`;
    }

    message += `\nTotal: ₹${totalAmount}\nPayment: ${paymentMethod}\n\nThank you!`;

    const sale = await Sale.create({
      items: saleItems,
      totalAmount,
      paymentMethod,
      customerPhone,
      smsStatus: customerPhone ? "not_sent" : "not_sent",
    });

    // Populate product details before generating PDF
    const populatedSale = await Sale.findById(sale._id)
      .populate("items.product", "name price");

    // Generate Invoice PDF
    const pdfPath = await generateInvoice(populatedSale);
    sale.invoicePath = pdfPath;

    // Send SMS if phone provided
    if (customerPhone) {
      const smsResult = await sendSMS(customerPhone, message);
      sale.smsStatus = smsResult.success ? "sent" : "failed";
    }

    await sale.save();

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SALES HISTORY
// =====================================
exports.getSalesHistory = async (req, res, next) => {
  try {
    const sales = await Sale.find()
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// DOWNLOAD INVOICE
// =====================================
exports.downloadInvoice = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("items.product", "name price");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // If invoice does not exist, regenerate it
    if (!sale.invoicePath) {
      const pdfPath = await generateInvoice(sale);
      sale.invoicePath = pdfPath;
      await sale.save();
    }

    res.download(sale.invoicePath);
  } catch (error) {
    next(error);
  }
};