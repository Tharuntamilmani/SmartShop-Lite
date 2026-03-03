const express = require("express");
const router = express.Router();

const billingController = require("../controllers/billingController");

// ===============================
// BILLING ROUTES
// ===============================

// Create Sale
router.post("/", billingController.createSale);

// Get Sales History
router.get("/history", billingController.getSalesHistory);

// Download Invoice
router.get("/invoice/:id", billingController.downloadInvoice);

module.exports = router;