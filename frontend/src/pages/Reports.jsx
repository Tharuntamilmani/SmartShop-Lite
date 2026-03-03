import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    CreditCard
} from 'lucide-react';
import { billingService } from '../services/billingService';
import { formatCurrency } from '../utils';
import { toast } from 'react-hot-toast';

const Reports = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [reportData, setReportData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        calculateReport();
    }, [bills, selectedMonth]);

    const fetchData = async () => {
        try {
            const response = await billingService.getHistory();
            setBills(response.data || []);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load data');
            setLoading(false);
        }
    };

    const calculateReport = () => {
        if (!bills || !Array.isArray(bills) || !bills.length) {
            setReportData({
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0
            });
            return;
        }

        const [year, month] = selectedMonth.split('-');

        const filtered = bills.filter(bill => {
            // Fix: use createdAt instead of date
            if (!bill.createdAt) return false;
            const billDate = new Date(bill.createdAt);
            return billDate.getFullYear() === parseInt(year) &&
                billDate.getMonth() === parseInt(month) - 1;
        });

        // Fix: use totalAmount instead of grandTotal
        const totalRevenue = filtered.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
        const totalOrders = filtered.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setReportData({ totalRevenue, totalOrders, averageOrderValue });
    };

    const handleDownload = () => {
        const [year, month] = selectedMonth.split('-');

        // Trigger browser download via window.open or a hidden link
        const downloadUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/reports/monthly?year=${year}&month=${month}`;

        // Create invisible link and click it to force download if needed, or just window.open
        // window.open(downloadUrl, "_blank"); // simpler

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = '_blank';
        link.download = `monthly-report-${selectedMonth}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Downloading report for ${selectedMonth}...`);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto animate-pulse space-y-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="h-8 bg-slate-200 rounded w-48"></div>
                    <div className="flex gap-4">
                        <div className="h-10 bg-slate-200 rounded w-40"></div>
                        <div className="h-10 bg-slate-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
                    ))}
                </div>
                <div className="h-48 bg-slate-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Monthly Reports</h1>
                    <p className="text-slate-500">Generate and download sales reports.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Calendar className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full sm:w-auto pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 bg-white"
                        />
                    </div>
                    <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 shadow-md transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                            {selectedMonth}
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(reportData.totalRevenue)}</h3>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                            {selectedMonth}
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{reportData.totalOrders}</h3>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-violet-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-violet-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                            Avg per order
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Average Order Value</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(reportData.averageOrderValue)}</h3>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">Detailed Report Available</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                    Download the detailed PDF report to view item-wise breakdown, tax details, and customer insights for {selectedMonth}.
                </p>
                <button
                    onClick={handleDownload}
                    className="text-blue-600 font-medium hover:text-blue-700 hover:underline"
                >
                    Download Detailed Report &rarr;
                </button>
            </div>
        </div>
    );
};

export default Reports;
