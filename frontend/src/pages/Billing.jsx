import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    User,
    CheckCircle,
    Smartphone
} from 'lucide-react';
import { productService } from '../services/productService';
import { billingService } from '../services/billingService';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

const Billing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [customerPhone, setCustomerPhone] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productService.getAll();
            setProducts(response.data || []);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load products');
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast.error('Not enough stock available');
                    return prev;
                }
                return prev.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item._id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => {
            return prev.map(item => {
                if (item._id === productId) {
                    const newQty = item.quantity + delta;
                    const product = products.find(p => p._id === productId);

                    if (newQty < 1) return item;
                    if (product && newQty > product.stock) {
                        toast.error('Stock limit reached');
                        return item;
                    }
                    return { ...item, quantity: newQty };
                }
                return item;
            });
        });
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = 0; // Assuming 0 for now or calculate if needed
    const total = subtotal + tax;

    const [paymentMethod, setPaymentMethod] = useState("Cash");

    const [lastBill, setLastBill] = useState(null);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        if (!customerPhone || customerPhone.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        setIsProcessing(true);

        try {
            const payload = {
                paymentMethod,
                customerPhone,
                items: cart.map(item => ({
                    productId: item._id,
                    quantity: item.quantity
                }))
            };

            const response = await billingService.createBill(payload);

            // Store bill details for the success modal before clearing cart
            setLastBill({
                total: total,
                paymentMethod: paymentMethod,
                invoicePath: response.data?.invoicePath // If backend returns it
            });

            setShowSuccess(true);
            setCart([]);
            setCustomerPhone('');
            fetchProducts();

            setTimeout(() => {
                setShowSuccess(false);
                setLastBill(null); // Reset after modal closes
            }, 3000);

        } catch (error) {
            console.error(error);
            toast.error('Checkout failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ... (rest of the component)

    const [mobileView, setMobileView] = useState('products'); // 'products' | 'cart'

    // ... (rest of the component)

    return (
        <div className="flex h-[calc(100vh-80px)] lg:h-screen bg-slate-50 overflow-hidden relative">
            {/* Sidebar / Left Column (Products) */}
            <div className={`flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col order-1 lg:order-1 transition-all
                ${mobileView === 'cart' ? 'hidden lg:flex' : 'flex'}
            `}>
                <div className="mb-6 relative">
                    <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-48 animate-pulse">
                                <div className="h-4 bg-slate-100 rounded w-3/4 mb-3"></div>
                                <div className="h-3 bg-slate-100 rounded w-1/2 mb-6"></div>
                                <div className="mt-auto flex justify-between items-center">
                                    <div className="h-6 bg-slate-100 rounded w-16"></div>
                                    <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-24 lg:pb-20">
                        {products
                            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(product => (
                                <div
                                    key={product._id}
                                    onClick={() => product.stock > 0 && addToCart(product)}
                                    className={`bg-white p-3 lg:p-4 rounded-xl shadow-sm border border-slate-100 transition-all cursor-pointer group relative overflow-hidden flex flex-col
                                        ${product.stock === 0 ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:shadow-md hover:border-blue-200 hover:-translate-y-1 active:scale-95'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`p-2 rounded-lg transition-colors ${product.stock > 0
                                            ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                                            : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            <ShoppingCart className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {product.stock > 0 ? `${product.stock} Left` : 'Out of Stock'}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-slate-700 mb-1 truncate text-lg pr-2 text-sm lg:text-lg" title={product.name}>{product.name}</h3>
                                    <p className="text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">{product.category || 'General'}</p>

                                    <div className="mt-auto flex justify-between items-center pt-3 border-t border-slate-50">
                                        <span className="text-lg lg:text-xl font-bold text-slate-800">{formatCurrency(product.price)}</span>
                                        <button
                                            disabled={product.stock === 0}
                                            className={`w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm
                                                ${product.stock > 0
                                                    ? 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white hover:shadow-blue-200 hover:rotate-90'
                                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                                            `}
                                        >
                                            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                        {products.length > 0 && products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                <Search className="w-12 h-12 mb-3 opacity-20" />
                                <p>No products found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Floating Cart Summary */}
                {cart.length > 0 && (
                    <div className="lg:hidden absolute bottom-4 left-4 right-4 z-30">
                        <button
                            onClick={() => setMobileView('cart')}
                            className="w-full bg-slate-900 text-white p-4 rounded-xl shadow-xl flex justify-between items-center animate-slide-up"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-800 p-2 rounded-lg">
                                    <ShoppingCart className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm">{cart.length} Items</p>
                                    <p className="text-xs text-slate-400">{formatCurrency(total)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                View Cart
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Right Column (Cart & Checkout) */}
            <div className={`w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex-col shadow-xl z-20 h-full relative order-2 lg:order-2 transition-all
                ${mobileView === 'products' ? 'hidden lg:flex' : 'flex'}
            `}>
                {/* Mobile Back Button */}
                <div className="lg:hidden p-4 border-b border-slate-100 flex items-center gap-2">
                    <button
                        onClick={() => setMobileView('products')}
                        className="p-2 -ml-2 hover:bg-slate-50 rounded-lg text-slate-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h2 className="font-bold text-slate-800">Your Cart</h2>
                </div>

                {/* Cart Header (Desktop) */}
                <div className="hidden lg:flex p-5 border-b border-slate-100 bg-white sticky top-0 z-10 justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-blue-50 p-1.5 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        Current Order
                    </h2>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{cart.length} items</span>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 min-h-[300px]">
                            <div className="w-12 h-12 lg:w-20 lg:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                <ShoppingCart className="w-6 h-6 lg:w-10 lg:h-10 text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-500 text-sm lg:text-base">Your cart is empty</p>
                            <button
                                onClick={() => setMobileView('products')}
                                className="lg:hidden text-blue-600 font-medium text-sm hover:underline"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {cart.map(item => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800 text-sm truncate mb-0.5">{item.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{formatCurrency(item.price)}</span>
                                            <span className="text-[10px] text-slate-400">Total: {formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between gap-2">
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1 -mr-1"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                                            <button
                                                onClick={() => updateQuantity(item._id, -1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-bold w-6 text-center text-slate-700">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-500 transition-all"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Billing Details & Checkout */}
                <div className="p-4 lg:p-5 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-20">
                    <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-500 font-medium">Subtotal</span>
                            <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-slate-800 pt-3 border-t border-dashed border-slate-200 items-baseline">
                            <span>Total</span>
                            <span className="text-blue-600">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Payment</label>
                                <div className="relative">
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-slate-50 hover:bg-white transition-colors cursor-pointer"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                    <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Customer</label>
                                <div className="relative">
                                    <Smartphone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        maxLength={10}
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 hover:bg-white transition-colors placeholder:font-normal"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing || cart.length === 0}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 transform active:scale-[0.98]
                                ${isProcessing || cart.length === 0
                                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30'}
                            `}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="text-white/90">Processing...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Generate Bill
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal Overlay - Improved Mobile */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white p-6 lg:p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-auto relative overflow-hidden"
                        >
                            {/* Confetti-like decoration */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>

                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 lg:mb-6 ring-8 ring-green-50/50">
                                <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" />
                            </div>

                            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
                            <p className="text-slate-500 text-center mb-6 lg:mb-8 leading-relaxed text-sm">
                                The bill has been generated successfully and the invoice has been saved.
                            </p>

                            <div className="w-full bg-slate-50 p-4 lg:p-5 rounded-xl border border-slate-100 mb-6 lg:mb-8 space-y-3">
                                <div className="flex justify-between text-sm items-center border-b border-slate-200 pb-3">
                                    <span className="text-slate-500">Total Amount</span>
                                    <span className="font-bold text-slate-800 text-lg">{formatCurrency(lastBill?.total || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm items-center pt-1">
                                    <span className="text-slate-500">Payment Method</span>
                                    <span className="font-medium text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 text-xs">{lastBill?.paymentMethod || 'Cash'}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                            >
                                Start New Bill
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Billing;
