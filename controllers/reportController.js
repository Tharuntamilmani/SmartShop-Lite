const Sale = require("../models/Sale");
const { generateMonthlyReportPDF } = require("../services/monthlyReportService");

exports.generateMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month required",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lt: endDate },
    }).populate("items.product");

    const filePath = await generateMonthlyReportPDF(sales, year, month);

    res.setHeader("Content-Disposition", `attachment; filename=monthly-report-${year}-${month}.pdf`);
    res.download(filePath);
  } catch (error) {
    next(error);
  }
};