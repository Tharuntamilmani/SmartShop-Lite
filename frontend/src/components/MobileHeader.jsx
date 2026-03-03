import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const MobileHeader = ({ onMenuClick }) => {
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return 'Dashboard';
            case '/products': return 'Products';
            case '/billing': return 'Billing';
            case '/history': return 'Sales History';
            case '/reports': return 'Reports';
            default: return 'EcoCart';
        }
    };

    return (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-all"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg text-slate-800">{getPageTitle()}</h1>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <Bell className="w-5 h-5" />
            </button>
        </div>
    );
};

export default MobileHeader;
