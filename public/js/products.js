const Products = {
    list: [],
    editId: null,
    deleteId: null,

    async init() {
        await this.loadProducts();
        this.setupListeners();
    },

    async loadProducts() {
        try {
            const result = await API.get('/products');
            this.list = result.data || [];
            this.render();
        } catch (error) {
            console.error(error);
        }
    },

    render() {
        const tbody = document.getElementById('product-list');
        const countBadge = document.getElementById('product-count');

        countBadge.textContent = `${this.list.length} Items`;

        if (this.list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No products found. Add one!</td></tr>`;
            return;
        }

        tbody.innerHTML = this.list.map(product => `
            <tr>
                <td>
                    <div class="d-flex flex-column">
                        <span class="fw-bold">${product.name}</span>
                        <span class="small text-muted">ID: ${product._id.substring(product._id.length - 6)}</span>
                    </div>
                </td>
                <td>${API.formatCurrency(product.price)}</td>
                <td>
                    <span class="badge ${product.stock < 5 ? (product.stock === 0 ? 'bg-danger' : 'bg-warning') : 'bg-success'}">
                        ${product.stock}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="Products.edit('${product._id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="Products.confirmDelete('${product._id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    setupListeners() {
        // Form Submit
        document.getElementById('product-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProduct();
        });

        // Cancel Edit
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.resetForm();
        });

        // Confirm Delete
        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            await this.deleteProduct();
        });
    },

    async saveProduct() {
        const name = document.getElementById('name').value;
        const price = parseFloat(document.getElementById('price').value);
        const stock = parseInt(document.getElementById('stock').value);

        const data = { name, price, stock };

        try {
            if (this.editId) {
                // Update
                await API.put(`/products/${this.editId}`, data);
                API.showToast('Product updated successfully!');
            } else {
                // Create
                await API.post('/products', data);
                API.showToast('Product added successfully!');
            }

            this.resetForm();
            await this.loadProducts();

        } catch (error) {
            // Error handled by API wrapper
        }
    },

    edit(id) {
        const product = this.list.find(p => p._id === id);
        if (!product) return;

        this.editId = id;
        document.getElementById('product-id').value = id;
        document.getElementById('name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('stock').value = product.stock;

        // UI Updates
        document.getElementById('form-title').textContent = 'Edit Item';
        document.getElementById('save-btn').innerHTML = '<i class="bi bi-check-lg me-1"></i> Update Item';
        document.getElementById('save-btn').classList.replace('btn-primary', 'btn-success');
        document.getElementById('cancel-btn').classList.remove('d-none');
    },

    resetForm() {
        this.editId = null;
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';

        // UI Updates
        document.getElementById('form-title').textContent = 'Add New Item';
        document.getElementById('save-btn').innerHTML = '<i class="bi bi-plus-lg me-1"></i> Add Item';
        document.getElementById('save-btn').classList.replace('btn-success', 'btn-primary');
        document.getElementById('cancel-btn').classList.add('d-none');
    },

    confirmDelete(id) {
        const product = this.list.find(p => p._id === id);
        if (!product) return;

        this.deleteId = id;
        document.getElementById('delete-product-name').textContent = product.name;

        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    },

    async deleteProduct() {
        if (!this.deleteId) return;

        try {
            await API.delete(`/products/${this.deleteId}`);
            API.showToast('Product deleted successfully');

            // Close modal
            const modalEl = document.getElementById('deleteModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            this.deleteId = null;
            await this.loadProducts();

        } catch (error) {
            // Error handled by wrapper
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    Products.init();
});
