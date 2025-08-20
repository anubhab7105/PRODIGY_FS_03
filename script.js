// script.js
// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const overlay = document.getElementById('overlay');
const checkoutBtn = document.getElementById('checkoutBtn');
const paymentModal = document.getElementById('paymentModal');
const paymentForm = document.getElementById('paymentForm');
const filterButtons = document.querySelectorAll('.filter-btn');
const paymentMethods = document.querySelectorAll('.payment-method');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const upiDetails = document.getElementById('upiDetails');
const trackOrderBtn = document.getElementById('trackOrderBtn');
const orderIdInput = document.getElementById('orderIdInput');
const trackingResults = document.getElementById('trackingResults');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const languageSelector = document.getElementById('languageSelector');

// Product Data (will be fetched from API)
let products = [];

// Cart State
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();
    
    // Event Listeners
    cartIcon.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModal);
    overlay.addEventListener('click', closeAllModals);
    checkoutBtn.addEventListener('click', openPaymentModal);
    paymentForm.addEventListener('submit', processPayment);
    trackOrderBtn.addEventListener('click', trackOrder);
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Filter Buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Filter products
            const category = button.dataset.category;
            renderProducts(category);
        });
    });
    
    // Payment Method Selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
            
            // Show UPI fields if UPI selected
            if(method.dataset.method === 'upi') {
                upiDetails.style.display = 'block';
            } else {
                upiDetails.style.display = 'none';
            }
        });
    });
});

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to sample products if API fails
        products = [
            {
                id: 1,
                name: "Fresh Apples",
                description: "Crisp and juicy organic apples from local farms. Perfect for snacks or baking.",
                price: 120,
                image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "fruits"
            },
            {
                id: 2,
                name: "Organic Tomatoes",
                description: "Fresh vine-ripened tomatoes, perfect for salads and sauces.",
                price: 80,
                image: "https://images.unsplash.com/photo-1561136594-7f68413baa99?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "vegetables"
            },
            {
                id: 3,
                name: "Farm Fresh Milk",
                description: "Pure, unadulterated milk from grass-fed cows. Pasteurized for safety.",
                price: 55,
                image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "dairy"
            },
            {
                id: 4,
                name: "Whole Wheat Bread",
                description: "Freshly baked whole wheat bread with no preservatives. Great for sandwiches.",
                price: 45,
                image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "bakery"
            },
            {
                id: 5,
                name: "Bananas",
                description: "Naturally ripened bananas, rich in potassium and energy.",
                price: 60,
                image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "fruits"
            },
            {
                id: 6,
                name: "Carrots",
                description: "Sweet and crunchy carrots, packed with vitamins and antioxidants.",
                price: 40,
                image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "vegetables"
            },
            {
                id: 7,
                name: "Eggs",
                description: "10 Farm fresh eggs from free-range chickens. Rich in protein and nutrients.",
                price: 90,
                image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "dairy"
            },
            {
                id: 8,
                name: "Cake",
                description: "Buttery, baked fresh daily. Perfect for birthdays.",
                price: 350,
                image: "https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "bakery"
            }
        ];
        renderProducts();
    }
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
}

// Render Products
function renderProducts(category = 'all') {
    productsGrid.innerHTML = '';
    
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-img" style="background-image: url(${product.image})"></div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">₹${product.price}</div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
    
    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        });
    });
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartUI();
    
    // Show toast notification
    showToast(`${product.name} added to cart!`);
}

// Update Cart UI
function updateCartUI() {
    // Update cart count
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart</p>
            </div>
        `;
        cartTotal.textContent = '₹0';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-img" style="background-image: url(${item.image})"></div>
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
                <div class="cart-item-actions">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Update total
    cartTotal.textContent = `₹${total}`;
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            updateQuantity(id, -1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            updateQuantity(id, 1);
        });
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('button').dataset.id);
            removeFromCart(id);
        });
    });
}

// Update Item Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        // Remove item if quantity is 0
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update UI
        updateCartUI();
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartUI();
    
    // Show toast notification
    const product = products.find(p => p.id === productId);
    showToast(`${product.name} removed from cart!`);
}

// Open Cart
function openCart() {
    cartModal.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    mobileMenu.style.display = 'none';
}

// Close Cart Modal
function closeCartModal() {
    cartModal.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// Open Payment Modal
function openPaymentModal() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    closeCartModal();
    paymentModal.classList.add('show');
    overlay.classList.add('show');
}

// Close All Modals
function closeAllModals() {
    cartModal.classList.remove('open');
    paymentModal.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    mobileMenu.style.display = 'none';
}

// Process Payment
async function processPayment(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        city: document.getElementById('city').value,
        zip: document.getElementById('zip').value,
        paymentMethod: document.querySelector('.payment-method.active').dataset.method,
        upiId: document.getElementById('upiId')?.value || null
    };
    
    try {
        // Send order to backend
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cart: cart,
                user_info: formData
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Clear cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Close modals
            closeAllModals();
            
            // Show success message
            showToast(`Order placed successfully! Order ID: ${result.order_id}`);
            
            // Reset form
            paymentForm.reset();
            
            // Update UI
            updateCartUI();
        } else {
            showToast('Error placing order. Please try again.');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        showToast('Error placing order. Please try again.');
    }
}

// Track Order
async function trackOrder() {
    const orderId = orderIdInput.value.trim();
    if (!orderId) {
        showToast('Please enter an order ID');
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        const order = await response.json();
        
        if (response.ok) {
            // Display order details
            trackingResults.innerHTML = `
                <div class="tracking-steps">
                    <div class="tracking-step ${order.status !== 'Processing' ? 'step-completed' : 'step-active'}">
                        <div class="step-icon"><i class="fas ${order.status !== 'Processing' ? 'fa-check' : 'fa-truck'}"></i></div>
                        <div class="step-text">Order Placed</div>
                    </div>
                    <div class="tracking-step ${order.status === 'Processing' ? 'step-active' : 'step-completed'}">
                        <div class="step-icon"><i class="fas ${order.status === 'Processing' ? 'fa-truck' : 'fa-check'}"></i></div>
                        <div class="step-text">Processing</div>
                    </div>
                    <div class="tracking-step">
                        <div class="step-icon"><i class="fas fa-home"></i></div>
                        <div class="step-text">Delivered</div>
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="order-card">
                        <h3>Order Information</h3>
                        <p><strong>Order ID:</strong> ${order.id}</p>
                        <p><strong>Order Date:</strong> ${order.date}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                    </div>
                    
                    <div class="order-card">
                        <h3>Delivery Address</h3>
                        <p>${order.user_info.address}</p>
                        <p>${order.user_info.city}, ${order.user_info.zip}</p>
                    </div>
                    
                    <div class="order-card">
                        <h3>Order Summary</h3>
                        <p><strong>Items:</strong> ${order.items.reduce((total, item) => total + item.quantity, 0)}</p>
                        <p><strong>Total:</strong> ₹${order.total}</p>
                    </div>
                </div>
            `;
        } else {
            trackingResults.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Order not found. Please check your order ID.</p>
                </div>
            `;
        }
        
        trackingResults.style.display = 'block';
    } catch (error) {
        console.error('Error tracking order:', error);
        trackingResults.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error tracking order. Please try again.</p>
            </div>
        `;
        trackingResults.style.display = 'block';
    }
}

// Show Toast Notification
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}