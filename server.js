require("dotenv").config();
const cors = require("cors");
const express = require("express");

const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const billingRoutes = require("./routes/billingRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// ===============================
// CONNECT DATABASE
// ===============================
connectDB();

// ===============================
// CORS
// ===============================
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// API ROUTES ONLY
// ===============================
app.use("/products", productRoutes);
app.use("/billing", billingRoutes);
app.use("/reports", reportRoutes);

// Test API route
app.get("/api-status", (req, res) => {
  res.json({ status: "Backend Running 🚀" });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message,
  });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});