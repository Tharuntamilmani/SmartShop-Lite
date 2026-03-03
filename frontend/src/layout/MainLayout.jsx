import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:pl-64 min-h-screen transition-all duration-300 flex flex-col">
                <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
