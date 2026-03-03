const Billing = {
    products: [],
    cart: [],

    async init() {
        await this.loadProducts();
        this.setupListeners();
    },

    async loadProducts() {
        try {
            const result = await API.get('/products');
            this.products = result.data || [];
            this.renderProducts(this.products);
        } catch (error) {
            console.error(error);
        }
    },

    renderProducts(list) {
        const grid = document.getElementById('product-grid');

        if (list.length === 0) {
            grid.innerHTML = `<div class="col-12 text-center text-muted py-5">No products found</div>`;
            return;
        }

        grid.innerHTML = list.map(item => `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card h-100 product-card-btn shadow-sm ${item.stock === 0 ? 'opacity-50' : ''}" 
                     onclick="Billing.addToCart('${item._id}')">
                    <div class="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                            <h6 class="card-title mb-1 text-truncate" title="${item.name}">${item.name}</h6>
                            <small class="text-muted">Stock: ${item.stock}</small>
                        </div>
                        <div class="mt-2 fw-bold text-primary">
                            ${API.formatCurrency(item.price)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    addToCart(productId) {
        const product = this.products.find(p => p._id === productId);

        if (!product || product.stock === 0) {
            API.showToast('Product out of stock', 'warning');
            return;
        }

        const existingItem = this.cart.find(item => item.productId === productId);

        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                API.showToast('Max stock reached', 'warning');
                return;
            }
            existingItem.quantity++;
        } else {
            this.cart.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock
            });
        }

        this.updateCartUI();
    },

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.updateCartUI();
    },

    updateQuantity(productId, delta) {
        const item = this.cart.find(i => i.productId === productId);
        if (!item) return;

        const newQty = item.quantity + delta;

        if (newQty <= 0) {
            this.removeFromCart(productId);
        } else if (newQty > item.maxStock) {
            API.showToast('Max stock reached', 'warning');
        } else {
            item.quantity = newQty;
            this.updateCartUI();
        }
    },

    updateCartUI() {
        const cartContainer = document.getElementById('cart-items');
        const totalEl = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');

        // Calculate Total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalEl.textContent = API.formatCurrency(total);

        // Enable/Disable Checkout
        checkoutBtn.disabled = this.cart.length === 0;

        // Render Items
        if (this.cart.length === 0) {
            cartContainer.parentElement.innerHTML = `
                 <div class="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <i class="bi bi-basket display-4 opacity-25"></i>
                    <p class="mt-2">Cart is empty</p>
                </div>
            `;
            return;
        } else {
            // Restore container if it was replaced
            if (!document.getElementById('cart-items')) {
                const wrapper = cartContainer.parentElement || document.querySelector('.overflow-auto');
                wrapper.innerHTML = '<div id="cart-items" class="d-flex flex-column gap-2"></div>';
            }
        }

        // Re-select container in case it was re-created
        const container = document.getElementById('cart-items');

        container.innerHTML = this.cart.map(item => `
            <div class="card border-0 shadow-sm">
                <div class="card-body p-2 d-flex justify-content-between align-items-center">
                    <div class="me-2 text-truncate" style="max-width: 120px;">
                        <span class="fw-semibold d-block text-truncate">${item.name}</span>
                        <small class="text-muted">${API.formatCurrency(item.price)}</small>
                    </div>
                    
                    <div class="input-group input-group-sm" style="width: 100px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="Billing.updateQuantity('${item.productId}', -1)">-</button>
                        <span class="input-group-text bg-white px-2">${item.quantity}</span>
                        <button class="btn btn-outline-secondary" type="button" onclick="Billing.updateQuantity('${item.productId}', 1)">+</button>
                    </div>
                    
                    <div class="ms-2 fw-bold text-end" style="min-width: 60px;">
                        ${API.formatCurrency(item.price * item.quantity)}
                    </div>
                    
                    <button class="btn btn-link text-danger p-0 ms-2" onclick="Billing.removeFromCart('${item.productId}')">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    setupListeners() {
        // Search Filter
        document.getElementById('product-search').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = this.products.filter(p => p.name.toLowerCase().includes(term));
            this.renderProducts(filtered);
        });

        // Checkout Form
        document.getElementById('checkout-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            await this.processCheckout();
        });
    },

    async processCheckout() {
        if (this.cart.length === 0) return;

        const paymentMethod = document.getElementById('payment-method').value;
        const customerPhone = document.getElementById('customer-phone').value;

        const payload = {
            items: this.cart,
            paymentMethod,
            customerPhone
        };

        try {
            const result = await API.post('/billing', payload);

            if (result.success) {
                // Show Success Modal
                const modal = new bootstrap.Modal(document.getElementById('billSuccessModal'));
                modal.show();

                // Clear Cart
                this.cart = [];
                this.updateCartUI();
                document.getElementById('billing-form').reset();

                // Refresh Products to get updated stock
                await this.loadProducts();
            }
        } catch (error) {
            // Error handled by API wrapper
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Billing.init();
});
