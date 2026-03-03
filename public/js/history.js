const History = {
    sales: [],

    async init() {
        await this.loadSales();
        this.setupListeners();
    },

    async loadSales() {
        try {
            const result = await API.get('/billing');
            this.sales = result.data || [];
            this.render();
        } catch (error) {
            console.error(error);
        }
    },

    render(data = null) {
        const list = data || this.sales;
        const tbody = document.getElementById('sales-list');
        const countBadge = document.getElementById('total-records');

        countBadge.textContent = `${list.length} records found`;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No sales found matching criteria</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(sale => {
            const date = API.formatDate(sale.createdAt);
            const itemsSummary = sale.items.map(i => {
                // Handle populated product or fallback
                const pName = i.product ? i.product.name : 'Unknown Item';
                return `${pName} (x${i.quantity})`;
            }).join(', ');

            let statusBadge = '';
            if (sale.smsStatus === 'sent') statusBadge = '<span class="badge bg-success">SMS Sent</span>';
            else if (sale.smsStatus === 'failed') statusBadge = '<span class="badge bg-danger">SMS Failed</span>';
            else statusBadge = '<span class="badge bg-secondary">No SMS</span>';

            return `
                <tr>
                    <td>${date}</td>
                    <td><span class="font-monospace small text-muted">#${sale._id.substring(sale._id.length - 6)}</span></td>
                    <td>
                        <div>${sale.customerPhone || '<span class="text-muted">Walk-in</span>'}</div>
                        <small class="text-muted">${sale.paymentMethod}</small>
                    </td>
                    <td>
                        <div class="text-truncate" style="max-width: 200px;" title="${itemsSummary}">
                            ${itemsSummary}
                        </div>
                    </td>
                    <td class="fw-bold">${API.formatCurrency(sale.totalAmount)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    },

    setupListeners() {
        const filter = () => {
            const term = document.getElementById('search-input').value.toLowerCase();
            const dateVal = document.getElementById('date-filter').value;

            const filtered = this.sales.filter(sale => {
                const matchesText = (sale.customerPhone || '').toLowerCase().includes(term) ||
                    sale._id.toLowerCase().includes(term);

                let matchesDate = true;
                if (dateVal) {
                    const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
                    matchesDate = saleDate === dateVal;
                }

                return matchesText && matchesDate;
            });

            this.render(filtered);
        };

        document.getElementById('search-input').addEventListener('input', filter);
        document.getElementById('date-filter').addEventListener('change', filter);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    History.init();
});
