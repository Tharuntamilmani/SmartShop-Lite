(async function () {
    try {
        // Fetch Data
        const [productsData, salesData] = await Promise.all([
            API.get('/products'),
            API.get('/billing')
        ]);

        const products = productsData.data || [];
        const sales = salesData.data || [];

        // 1. Total Products
        document.getElementById('total-products').textContent = products.length;

        // 2. Low Stock Logic
        const lowStockItems = products.filter(p => p.stock < 5);
        document.getElementById('low-stock-count').textContent = lowStockItems.length;

        // Render Low Stock Table
        const lowStockTable = document.getElementById('low-stock-list');
        if (lowStockItems.length === 0) {
            lowStockTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No low stock items. Good job!</td></tr>`;
        } else {
            lowStockTable.innerHTML = lowStockItems.map(item => `
                <tr>
                    <td class="fw-bold text-dark">${item.name}</td>
                    <td><span class="badge ${item.stock === 0 ? 'bg-danger' : 'bg-warning'} text-dark">${item.stock}</span></td>
                    <td>${API.formatCurrency(item.price)}</td>
                    <td>
                        <a href="/inventory" class="btn btn-sm btn-outline-primary">Manage</a>
                    </td>
                </tr>
            `).join('');
        }

        // 3. Today's Stats
        const today = new Date().setHours(0, 0, 0, 0);
        const todaySales = sales.filter(sale => {
            const saleDate = new Date(sale.createdAt).setHours(0, 0, 0, 0);
            return saleDate === today;
        });

        const totalTransactions = todaySales.length;
        const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

        document.getElementById('today-transactions').textContent = totalTransactions;
        document.getElementById('today-sales').textContent = API.formatCurrency(totalRevenue);

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
})();
