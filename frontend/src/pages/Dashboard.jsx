import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    Package,
    AlertTriangle,
    DollarSign,
    Plus,
    ShoppingCart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { billingService } from '../services/billingService';
import { formatCurrency } from '../utils';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold mt-2 text-slate-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {trend}
                </span>
                <span className="text-slate-400 ml-2">vs last month</span>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        todaySales: 0,
        monthRevenue: 0
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, historyRes] = await Promise.all([
                productService.getAll(),
                billingService.getHistory()
            ]);

            const products = productsRes.data || [];
            const history = historyRes.data || [];

            console.log("Products:", products);
            console.log("History:", history);

            // Defensive coding
            if (!Array.isArray(products) || !Array.isArray(history)) {
                console.error("Invalid data format received");
                setLoading(false);
                return;
            }

            const totalProducts = products.length;

            const lowStock = products.filter(p => p.stock < 5).length;

            const todayString = new Date().toISOString().split('T')[0];

            const todaySales = history
                .filter(bill =>
                    // Fix: use createdAt instead of date
                    new Date(bill.createdAt).toISOString().split('T')[0] === todayString
                )
                // Fix: use totalAmount instead of grandTotal (checking bill property text from prompt: totalAmount)
                // Prompt said: totalAmount (NOT grandTotal)
                .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

            const currentMonth = new Date().getMonth();

            const monthRevenue = history
                .filter(bill =>
                    new Date(bill.createdAt).getMonth() === currentMonth
                )
                .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toISOString().split('T')[0];
            });

            const chartData = last7Days.map(date => {
                const sales = history
                    .filter(bill =>
                        new Date(bill.createdAt).toISOString().split('T')[0] === date
                    )
                    .reduce((sum, bill) => sum + bill.totalAmount, 0);

                return {
                    name: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
                    sales
                };
            });

            setStats({
                totalProducts,
                lowStock,
                todaySales,
                monthRevenue
            });

            setChartData(chartData);
            setLoading(false);

        } catch (error) {
            console.error("Error fetching dashboard data", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-slate-200 rounded w-48"></div>
                    <div className="flex gap-3">
                        <div className="h-10 bg-slate-200 rounded w-32"></div>
                        <div className="h-10 bg-slate-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 bg-slate-200 rounded-xl"></div>
                    <div className="h-80 bg-slate-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex w-full lg:w-auto gap-3">
                    <button
                        onClick={() => navigate('/products')}
                        className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                    <button
                        onClick={() => navigate('/billing')}
                        className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        New Bill
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Today's Sales"
                    value={formatCurrency(stats.todaySales)}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats.monthRevenue)}
                    icon={DollarSign}
                    color="bg-violet-500"
                    trend="+12%"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStock}
                    icon={AlertTriangle}
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Analytics</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button onClick={() => navigate('/billing')} className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between group">
                            <span className="font-medium text-slate-700">Create New Invoice</span>
                            <ShoppingCart className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                        </button>
                        <button onClick={() => navigate('/products')} className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between group">
                            <span className="font-medium text-slate-700">Update Inventory</span>
                            <Package className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                        </button>
                        <button onClick={() => navigate('/history')} className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between group">
                            <span className="font-medium text-slate-700">View Sales History</span>
                            <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
