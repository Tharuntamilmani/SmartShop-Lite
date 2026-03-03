import React, { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    Download,
    Eye,
    Phone,
    MessageSquare
} from 'lucide-react';
import { billingService } from '../services/billingService';
import { formatCurrency, formatDate } from '../utils';
import { toast } from 'react-hot-toast';

const SalesHistory = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await billingService.getHistory();
            const data = response.data || [];

            // Sort by date desc
            if (Array.isArray(data)) {
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
            }

            setBills(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load sales history');
            setLoading(false);
        }
    };

    const filteredBills = Array.isArray(bills) ? bills.filter(bill => {
        const matchesPhone = bill.customerPhone?.includes(searchTerm) || bill._id.includes(searchTerm);
        const dateToTrack = bill.createdAt || bill.date;
        const matchesDate = filterDate ? dateToTrack?.toString().substring(0, 10) === filterDate : true;
        return matchesPhone && matchesDate;
    }) : [];

    const totalRevenue = filteredBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const totalOrders = filteredBills.length;

    const handleDownloadInvoice = (billId) => {
        // Use window.open to trigger browser download
        const downloadUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/billing/invoice/${billId}`;
        window.open(downloadUrl, "_blank");
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="h-24 bg-slate-200 rounded-xl"></div>
                    <div className="h-24 bg-slate-200 rounded-xl"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex gap-4">
                        <div className="h-10 bg-slate-200 rounded flex-1"></div>
                        <div className="h-10 bg-slate-200 rounded w-40"></div>
                    </div>
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 bg-slate-200 rounded w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Sales History</h1>
                    <p className="text-slate-500">View and manage past transactions.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Transactions</p>
                        <h3 className="text-2xl font-bold text-slate-800">{totalOrders}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                        <Download className="w-6 h-6 text-emerald-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by phone or Bill ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div className="relative w-full md:w-auto">
                        <Calendar className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full md:w-auto pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
                        />
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {filteredBills.map((bill) => (
                        <div key={bill._id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">#{bill._id.substring(0, 8)}</span>
                                    <p className="text-slate-800 font-bold mt-1">{formatDate(bill.createdAt || bill.date)}</p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${bill.paymentMethod === 'UPI' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {bill.paymentMethod || 'Cash'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="w-3 h-3" />
                                    {bill.customerPhone || 'N/A'}
                                </div>
                                <div className="text-slate-500">
                                    {bill.items?.length || bill.products?.length || 0} items
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                <span className="text-lg font-bold text-slate-800">{formatCurrency(bill.totalAmount || 0)}</span>
                                <button
                                    onClick={() => handleDownloadInvoice(bill._id)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1 active:bg-blue-100"
                                >
                                    <Download className="w-3 h-3" />
                                    Invoice
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredBills.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No transactions found.
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 text-sm font-medium">
                            <tr>
                                <th className="px-6 py-4">Bill ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">SMS Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBills.map((bill) => (
                                <tr key={bill._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                        {bill._id.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">{formatDate(bill.createdAt || bill.date)}</td>
                                    <td className="px-6 py-4 text-slate-800 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            {bill.customerPhone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {bill.items?.length || bill.products?.length || 0} items
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bill.paymentMethod === 'UPI' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {bill.paymentMethod || 'Cash'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-800 font-bold">{formatCurrency(bill.totalAmount || 0)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bill.smsStatus === 'sent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                                            }`}>
                                            <MessageSquare className="w-3 h-3" />
                                            {bill.smsStatus === 'sent' ? 'Sent' : 'Not Sent'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDownloadInvoice(bill._id)}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-end gap-1"
                                        >
                                            <Download className="w-3 h-3" />
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredBills.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;
