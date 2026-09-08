/* ==========================================================================
   AURA Luxe - Application State & Interactivity Engine (with Backend & Auth)
   ========================================================================== */

(function () {
  'use strict';

  // State Store
  const state = {
    products: typeof AuraBackend !== 'undefined' ? AuraBackend.db.getProducts() : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []),
    cart: JSON.parse(localStorage.getItem('aura_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('aura_wishlist') || '[]'),
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    appliedPromo: null,
    theme: localStorage.getItem('aura_theme') || 'dark',
    user: typeof AuraBackend !== 'undefined' ? AuraBackend.auth.getCurrentUser() : null
  };

  // Free shipping minimum threshold
  const FREE_SHIPPING_THRESHOLD = 150;
  const STANDARD_SHIPPING_FEE = 15;

  // DOM Elements
  const DOM = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    searchInput: document.getElementById('searchInput'),
    categoryChips: document.getElementById('categoryChips'),
    sortSelect: document.getElementById('sortSelect'),
    productsGrid: document.getElementById('productsGrid'),
    productCountBadge: document.getElementById('productCountBadge'),
    activeFilterText: document.getElementById('activeFilterText'),
    
    // Auth Widget
    authWidgetContainer: document.getElementById('authWidgetContainer'),
    googleSignInBtn: document.getElementById('googleSignInBtn'),
    myOrdersBtn: document.getElementById('myOrdersBtn'),
    myOrdersModalOverlay: document.getElementById('myOrdersModalOverlay'),
    closeMyOrdersBtn: document.getElementById('closeMyOrdersBtn'),
    myOrdersList: document.getElementById('myOrdersList'),

    // Cart Drawer
    cartToggleBtn: document.getElementById('cartToggleBtn'),
    cartBadge: document.getElementById('cartBadge'),
    cartBackdrop: document.getElementById('cartBackdrop'),
    cartDrawer: document.getElementById('cartDrawer'),
    closeCartBtn: document.getElementById('closeCartBtn'),
    cartItemsList: document.getElementById('cartItemsList'),
    cartSubtotal: document.getElementById('cartSubtotal'),
    cartDiscount: document.getElementById('cartDiscount'),
    discountRow: document.getElementById('discountRow'),
    cartShipping: document.getElementById('cartShipping'),
    cartTotal: document.getElementById('cartTotal'),
    promoInput: document.getElementById('promoInput'),
    applyPromoBtn: document.getElementById('applyPromoBtn'),
    promoMessage: document.getElementById('promoMessage'),
    shippingMeterText: document.getElementById('shippingMeterText'),
    shippingMeterFill: document.getElementById('shippingMeterFill'),
    checkoutBtn: document.getElementById('checkoutBtn'),

    // Wishlist
    wishlistBtn: document.getElementById('wishlistBtn'),
    wishlistBadge: document.getElementById('wishlistBadge'),

    // Product Quick View Modal
    productModalOverlay: document.getElementById('productModalOverlay'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalProductDetails: document.getElementById('modalProductDetails'),

    // Checkout Modal
    checkoutModalOverlay: document.getElementById('checkoutModalOverlay'),
    closeCheckoutBtn: document.getElementById('closeCheckoutBtn'),
    checkoutForm: document.getElementById('checkoutForm'),
    checkoutPayAmount: document.getElementById('checkoutPayAmount'),

    // Hero buttons
    heroExploreBtn: document.getElementById('heroExploreBtn'),
    heroQuickBuyBtn: document.getElementById('heroQuickBuyBtn'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // Initialize App
  function init() {
    applyTheme(state.theme);
    refreshProductsFromBackend();
    updateAuthUI();
    renderProducts();
    updateCartUI();
    updateWishlistUI();
    attachEventListeners();

    // Listen for product catalog updates from Admin CMS
    window.addEventListener('aura_products_updated', () => {
      refreshProductsFromBackend();
      renderProducts();
    });

    window.addEventListener('aura_auth_change', (e) => {
      state.user = e.detail;
      updateAuthUI();
    });
  }

  function refreshProductsFromBackend() {
    if (typeof AuraBackend !== 'undefined') {
      state.products = AuraBackend.db.getProducts();
    }
  }

  // --- Auth UI Engine ---
  function updateAuthUI() {
    if (!DOM.authWidgetContainer) return;

    if (state.user) {
      DOM.authWidgetContainer.innerHTML = `
        <div class="user-profile-menu">
          <img src="${state.user.photoURL}" alt="${state.user.displayName}" class="user-avatar">
          <span class="user-name">${state.user.displayName.split(' ')[0]}</span>
          <button id="signOutBtn" class="icon-btn" style="width: 26px; height: 26px; font-size: 0.75rem;" title="Sign Out">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      `;
      if (DOM.myOrdersBtn) DOM.myOrdersBtn.style.display = 'flex';
      
      document.getElementById('signOutBtn')?.addEventListener('click', () => {
        AuraBackend.auth.signOut();
        showToast('Signed out of Google account', 'fa-right-from-bracket');
      });

      // Prefill checkout inputs if user is logged in
      const firstNameEl = document.getElementById('firstName');
      const emailEl = document.getElementById('email');
      if (firstNameEl && !firstNameEl.value) firstNameEl.value = state.user.displayName.split(' ')[0];
      if (emailEl && !emailEl.value) emailEl.value = state.user.email;

    } else {
      DOM.authWidgetContainer.innerHTML = `
        <button id="googleSignInBtn" class="google-signin-btn">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          Sign in with Google
        </button>
      `;
      if (DOM.myOrdersBtn) DOM.myOrdersBtn.style.display = 'none';

      document.getElementById('googleSignInBtn')?.addEventListener('click', async () => {
        const user = await AuraBackend.auth.signInWithGoogle();
        showToast(`Welcome, <strong>${user.displayName}</strong>!`, 'fa-circle-check');
      });
    }
  }

  // --- Theme Management ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
    
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.innerHTML = theme === 'dark' 
        ? '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
    }
  }

  function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} theme`, 'fa-circle-half-stroke');
  }

  // --- Product Filtering & Sorting ---
  function getFilteredProducts() {
    return state.products.filter(product => {
      const matchesCategory = state.activeCategory === 'all' || product.category === state.activeCategory;
      const query = state.searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        product.name.toLowerCase().includes(query) ||
        product.tagline.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (state.sortBy === 'price-low') return a.price - b.price;
      if (state.sortBy === 'price-high') return b.price - a.price;
      if (state.sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      return 0;
    });
  }

  // --- Render Store Grid ---
  function renderProducts() {
    const filtered = getFilteredProducts();

    if (DOM.productCountBadge) {
      DOM.productCountBadge.textContent = `${filtered.length} Item${filtered.length !== 1 ? 's' : ''}`;
    }

    if (DOM.activeFilterText) {
      const catName = state.activeCategory === 'all' ? 'All luxury items' : state.activeCategory.toUpperCase();
      const queryText = state.searchQuery ? ` matching "${state.searchQuery}"` : '';
      DOM.activeFilterText.textContent = `Showing ${catName}${queryText}`;
    }

    if (filtered.length === 0) {
      DOM.productsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-magnifying-glass-minus"></i></div>
          <h3>No matching products found</h3>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search query or selecting a different category filter.</p>
          <button id="resetFiltersBtn" class="btn-secondary" style="margin-top: 1.5rem;">Reset All Filters</button>
        </div>
      `;
      document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
        state.activeCategory = 'all';
        state.searchQuery = '';
        DOM.searchInput.value = '';
        document.querySelectorAll('.chip-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === 'all');
        });
        renderProducts();
      });
      return;
    }

    DOM.productsGrid.innerHTML = filtered.map(product => {
      const isWishlisted = state.wishlist.includes(product.id);
      return `
        <div class="product-card" data-id="${product.id}">
          <div class="card-image-wrap">
            <span class="product-badge">${product.badge || 'Luxury'}</span>
            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
              <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'">
          </div>

          <div class="card-body">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title" data-action="quickview" data-id="${product.id}">${product.name}</h3>
            <div class="product-tagline">${product.tagline}</div>
            
            <div class="product-rating">
              <i class="fa-solid fa-star"></i>
              <strong>${product.rating || 5.0}</strong>
              <span class="reviews">(${product.reviewsCount || 12} reviews)</span>
            </div>

            <div class="card-footer">
              <div class="price-wrap">
                <span class="price-current">$${product.price}</span>
                ${product.originalPrice ? `<span class="price-original">$${product.originalPrice}</span>` : ''}
              </div>

              <button class="add-cart-btn" data-action="add-cart" data-id="${product.id}">
                <i class="fa-solid fa-cart-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Shopping Cart Operations ---
  function addToCart(productId, quantity = 1) {
    const existing = state.cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      state.cart.push({ id: productId, quantity: quantity });
    }

    saveCart();
    updateCartUI();
    
    const prod = state.products.find(p => p.id === productId);
    showToast(`Added <strong>${prod ? prod.name : 'Item'}</strong> to cart`, 'fa-cart-shopping');
  }

  function updateQuantity(productId, delta) {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    saveCart();
    updateCartUI();
  }

  function removeFromCart(productId) {
    const prod = state.products.find(p => p.id === productId);
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showToast(`Removed <strong>${prod ? prod.name : 'Item'}</strong> from cart`, 'fa-trash-can');
  }

  function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(state.cart));
  }

  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (DOM.cartBadge) {
      DOM.cartBadge.textContent = totalItems;
      DOM.cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    if (state.cart.length === 0) {
      DOM.cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-bag-shopping" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p style="font-weight: 600;">Your cart is currently empty</p>
          <p style="font-size: 0.85rem; margin-top: 0.3rem;">Browse our collection and add your favorite tech items!</p>
        </div>
      `;
    } else {
      DOM.cartItemsList.innerHTML = state.cart.map(item => {
        const product = state.products.find(p => p.id === item.id);
        if (!product) return '';

        return `
          <div class="cart-item">
            <img src="${product.image}" alt="${product.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80'">
            <div class="cart-item-info">
              <div class="cart-item-title">${product.name}</div>
              <div class="cart-item-price">$${product.price}</div>
              <div class="qty-controls">
                <button class="qty-btn" data-action="qty-minus" data-id="${item.id}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" data-action="qty-plus" data-id="${item.id}">+</button>
              </div>
            </div>
            <button class="remove-item-btn" data-action="cart-remove" data-id="${item.id}" title="Remove Item">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
      }).join('');
    }

    const subtotal = state.cart.reduce((sum, item) => {
      const product = state.products.find(p => p.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    let discountAmount = 0;
    let isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

    if (state.appliedPromo) {
      if (state.appliedPromo.discount) {
        discountAmount = subtotal * state.appliedPromo.discount;
      }
      if (state.appliedPromo.freeShipping) {
        isFreeShipping = true;
      }
    }

    const shippingFee = (subtotal === 0 || isFreeShipping) ? 0 : STANDARD_SHIPPING_FEE;
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

    DOM.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    
    if (discountAmount > 0) {
      DOM.discountRow.style.display = 'flex';
      DOM.cartDiscount.textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
      DOM.discountRow.style.display = 'none';
    }

    DOM.cartShipping.textContent = shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`;
    DOM.cartTotal.textContent = `$${finalTotal.toFixed(2)}`;
    if (DOM.checkoutPayAmount) DOM.checkoutPayAmount.textContent = `$${finalTotal.toFixed(2)}`;

    const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const meterPercentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

    DOM.shippingMeterFill.style.width = `${meterPercentage}%`;
    if (remainingForFree === 0 || subtotal === 0) {
      DOM.shippingMeterText.innerHTML = subtotal === 0 
        ? `Free Shipping on orders over <strong>$${FREE_SHIPPING_THRESHOLD}.00</strong>` 
        : `<i class="fa-solid fa-truck-fast" style="color: var(--accent-emerald);"></i> You have unlocked <strong>Free Express Shipping!</strong>`;
    } else {
      DOM.shippingMeterText.innerHTML = `Add <strong>$${remainingForFree.toFixed(2)}</strong> more for Free Express Shipping!`;
    }

    DOM.checkoutBtn.disabled = state.cart.length === 0;
    DOM.checkoutBtn.style.opacity = state.cart.length === 0 ? '0.5' : '1';
  }

  function applyPromoCode(code) {
    const upperCode = code.toUpperCase().trim();
    if (typeof PROMO_CODES !== 'undefined' && PROMO_CODES[upperCode]) {
      state.appliedPromo = PROMO_CODES[upperCode];
      DOM.promoMessage.style.display = 'block';
      DOM.promoMessage.style.color = 'var(--accent-emerald)';
      DOM.promoMessage.innerHTML = `<i class="fa-solid fa-circle-check"></i> Code applied: ${state.appliedPromo.description}`;
      updateCartUI();
      showToast(`Applied coupon: ${upperCode}`, 'fa-tag');
    } else {
      DOM.promoMessage.style.display = 'block';
      DOM.promoMessage.style.color = 'var(--accent-rose)';
      DOM.promoMessage.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Invalid promo code. Try AURA10`;
    }
  }

  function toggleWishlist(productId) {
    const index = state.wishlist.indexOf(productId);
    const prod = state.products.find(p => p.id === productId);

    if (index > -1) {
      state.wishlist.splice(index, 1);
      showToast(`Removed <strong>${prod ? prod.name : 'Item'}</strong> from Wishlist`, 'fa-heart-crack');
    } else {
      state.wishlist.push(productId);
      showToast(`Saved <strong>${prod ? prod.name : 'Item'}</strong> to Wishlist`, 'fa-heart');
    }

    localStorage.setItem('aura_wishlist', JSON.stringify(state.wishlist));
    updateWishlistUI();
    renderProducts();
  }

  function updateWishlistUI() {
    if (DOM.wishlistBadge) {
      DOM.wishlistBadge.textContent = state.wishlist.length;
      DOM.wishlistBadge.style.display = state.wishlist.length > 0 ? 'flex' : 'none';
    }
  }

  function openQuickViewModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    DOM.modalProductDetails.innerHTML = `
      <div class="detail-img-box">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'">
      </div>
      <div class="detail-info-box">
        <div class="product-category">${product.category}</div>
        <h2 class="detail-title">${product.name}</h2>
        
        <div class="product-rating" style="margin-bottom: 0.8rem;">
          <i class="fa-solid fa-star"></i> <strong>${product.rating || 5.0}</strong> (${product.reviewsCount || 10} reviews)
        </div>

        <div class="detail-price-row">
          <span class="price-current" style="font-size: 1.8rem;">$${product.price}</span>
          ${product.originalPrice ? `<span class="price-original" style="font-size: 1.1rem;">$${product.originalPrice}</span>` : ''}
          <span style="color: var(--accent-emerald); font-weight: 600; font-size: 0.85rem;">In Stock (${product.stock || 10} units left)</span>
        </div>

        <p class="detail-desc">${product.description}</p>

        <h4 style="font-size: 0.95rem; margin-bottom: 0.6rem;">Key Features:</h4>
        <ul class="detail-features-list">
          ${(product.features || ['Aerospace precision', 'Premium sound']).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
        </ul>

        <div style="margin-top: auto; display: flex; gap: 1rem;">
          <button class="btn-primary" id="modalAddToCartBtn" data-id="${product.id}" style="flex: 1; justify-content: center;">
            <i class="fa-solid fa-cart-plus"></i> Add to Shopping Cart
          </button>
        </div>
      </div>
    `;

    DOM.productModalOverlay.classList.add('active');

    document.getElementById('modalAddToCartBtn')?.addEventListener('click', () => {
      addToCart(product.id);
      DOM.productModalOverlay.classList.remove('active');
      openCartDrawer();
    });
  }

  function openCartDrawer() { DOM.cartBackdrop.classList.add('active'); }
  function closeCartDrawer() { DOM.cartBackdrop.classList.remove('active'); }
  function openCheckoutModal() {
    if (state.cart.length === 0) return;
    closeCartDrawer();
    DOM.checkoutModalOverlay.classList.add('active');
  }
  function closeCheckoutModal() { DOM.checkoutModalOverlay.classList.remove('active'); }

  // Customer Order History Modal
  function openMyOrdersModal() {
    if (!state.user) return;
    const orders = AuraBackend.db.getUserOrders(state.user.uid);
    
    if (orders.length === 0) {
      DOM.myOrdersList.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">You have not placed any orders yet.</p>`;
    } else {
      DOM.myOrdersList.innerHTML = orders.map(o => `
        <div style="background: var(--bg-primary); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="color: var(--brand-primary);">${o.orderId}</strong>
            <span class="status-pill ${o.status.toLowerCase()}">${o.status}</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
            Total Paid: <strong>$${(o.total || 0).toFixed(2)}</strong> via ${o.paymentMethod || 'Card'}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Items: ${o.items.map(i => i.name).join(', ')}
          </div>
        </div>
      `).join('');
    }

    DOM.myOrdersModalOverlay.classList.add('active');
  }

  function showToast(message, icon = 'fa-circle-check') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon} toast-icon"></i> <span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function attachEventListeners() {
    DOM.themeToggleBtn?.addEventListener('click', toggleTheme);

    DOM.searchInput?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderProducts();
    });

    DOM.categoryChips?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn');
      if (!chip) return;
      document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
      chip.classList.add('active');
      state.activeCategory = chip.dataset.category;
      renderProducts();
    });

    DOM.sortSelect?.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderProducts();
    });

    DOM.productsGrid?.addEventListener('click', (e) => {
      const addCartBtn = e.target.closest('[data-action="add-cart"]');
      if (addCartBtn) {
        addToCart(addCartBtn.dataset.id);
        return;
      }
      const wishlistBtn = e.target.closest('.wishlist-btn');
      if (wishlistBtn) {
        toggleWishlist(wishlistBtn.dataset.id);
        return;
      }
      const quickviewTrigger = e.target.closest('[data-action="quickview"]');
      if (quickviewTrigger) {
        openQuickViewModal(quickviewTrigger.dataset.id);
        return;
      }
    });

    DOM.cartToggleBtn?.addEventListener('click', openCartDrawer);
    DOM.closeCartBtn?.addEventListener('click', closeCartDrawer);
    DOM.cartBackdrop?.addEventListener('click', (e) => { if (e.target === DOM.cartBackdrop) closeCartDrawer(); });

    DOM.cartItemsList?.addEventListener('click', (e) => {
      const plusBtn = e.target.closest('[data-action="qty-plus"]');
      if (plusBtn) { updateQuantity(plusBtn.dataset.id, 1); return; }
      const minusBtn = e.target.closest('[data-action="qty-minus"]');
      if (minusBtn) { updateQuantity(minusBtn.dataset.id, -1); return; }
      const removeBtn = e.target.closest('[data-action="cart-remove"]');
      if (removeBtn) { removeFromCart(removeBtn.dataset.id); return; }
    });

    DOM.applyPromoBtn?.addEventListener('click', () => {
      if (DOM.promoInput.value) applyPromoCode(DOM.promoInput.value);
    });

    DOM.closeModalBtn?.addEventListener('click', () => DOM.productModalOverlay.classList.remove('active'));
    DOM.productModalOverlay?.addEventListener('click', (e) => {
      if (e.target === DOM.productModalOverlay) DOM.productModalOverlay.classList.remove('active');
    });

    DOM.checkoutBtn?.addEventListener('click', openCheckoutModal);
    DOM.closeCheckoutBtn?.addEventListener('click', closeCheckoutModal);
    DOM.checkoutModalOverlay?.addEventListener('click', (e) => {
      if (e.target === DOM.checkoutModalOverlay) closeCheckoutModal();
    });

    // Orders History Modal
    DOM.myOrdersBtn?.addEventListener('click', openMyOrdersModal);
    DOM.closeMyOrdersBtn?.addEventListener('click', () => DOM.myOrdersModalOverlay.classList.remove('active'));

    // Checkout Form Submission
    DOM.checkoutForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const address = document.getElementById('address').value;
      const city = document.getElementById('city').value;
      const zip = document.getElementById('zip').value;
      const paymentMethod = document.getElementById('paymentMethod').value;

      const orderItems = state.cart.map(item => {
        const p = state.products.find(prod => prod.id === item.id);
        return {
          id: item.id,
          name: p ? p.name : 'Product',
          price: p ? p.price : 0,
          qty: item.quantity
        };
      });

      const subtotal = orderItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
      const discount = state.appliedPromo ? (state.appliedPromo.discount ? subtotal * state.appliedPromo.discount : 0) : 0;
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
      const total = subtotal - discount + shipping;

      // Save Order to Backend Database
      const newOrder = AuraBackend.db.createOrder({
        customer: { name: `${firstName} ${lastName}`, email, address: `${address}, ${city} ${zip}` },
        items: orderItems,
        subtotal,
        discount,
        shipping,
        total,
        paymentMethod
      });

      closeCheckoutModal();
      
      state.cart = [];
      state.appliedPromo = null;
      saveCart();
      updateCartUI();

      showToast(`Order <strong>${newOrder.orderId}</strong> created!`, 'fa-circle-check');

      setTimeout(() => {
        alert(`🎉 Thank you for your order, ${firstName}!\n\nOrder Ref: ${newOrder.orderId}\nTotal: $${total.toFixed(2)}\n\nYour order has been recorded in the database. You can track its status in 'My Orders' or view it in the Admin CMS!`);
      }, 500);
    });

    DOM.heroExploreBtn?.addEventListener('click', () => {
      DOM.productsGrid.scrollIntoView({ behavior: 'smooth' });
    });

    DOM.heroQuickBuyBtn?.addEventListener('click', () => {
      openQuickViewModal('p1');
    });

    DOM.wishlistBtn?.addEventListener('click', () => {
      if (state.wishlist.length === 0) {
        showToast('Your Wishlist is currently empty', 'fa-heart');
      } else {
        showToast(`You have ${state.wishlist.length} item(s) saved in your Wishlist`, 'fa-heart');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait for Firebase backend to initialize
      if (window.AuraBackend) {
        init();
      } else {
        window.addEventListener('aura_backend_ready', init, { once: true });
      }
    });
  } else {
    if (window.AuraBackend) {
      init();
    } else {
      window.addEventListener('aura_backend_ready', init, { once: true });
    }
  }
})();
