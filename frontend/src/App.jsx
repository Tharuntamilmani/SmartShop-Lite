import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Billing from './pages/Billing';
import SalesHistory from './pages/SalesHistory';
import Reports from './pages/Reports';

import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <Router>
            <Toaster position="top-center" />
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="history" element={<SalesHistory />} />
                    <Route path="reports" element={<Reports />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
