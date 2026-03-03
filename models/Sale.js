const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    invoicePath: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI"],
      required: true,
    },
    customerPhone: {
      type: String,
    },
    smsStatus: {
      type: String,
      enum: ["sent", "failed", "not_sent"],
      default: "not_sent",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);