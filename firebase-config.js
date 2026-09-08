/* ==========================================================================
   AURA Luxe - Firebase Real Integration Service
   Live Firebase Project: aura-luxe-store
   ========================================================================== */

// Real Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRp5BjU7VvJXnmKRPsoHxOnp6lTbITFO8",
  authDomain: "aura-luxe-store.firebaseapp.com",
  projectId: "aura-luxe-store",
  storageBucket: "aura-luxe-store.firebasestorage.app",
  messagingSenderId: "862920363701",
  appId: "1:862920363701:web:0557a9ea04a845df3238fc",
  measurementId: "G-DN3K1SW892"
};

/* ==========================================================================
   Firebase SDK Loading & Initialization
   ========================================================================== */

// Dynamically load Firebase SDKs from CDN
(function () {
  'use strict';

  // Inject Firebase App SDK script
  function loadScript(src, onload) {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    document.head.appendChild(script);
  }

  // We use Firebase compat version for simpler global access
  const scripts = [
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics-compat.js'
  ];

  let loadedCount = 0;

  function onAllLoaded() {
    // Initialize Firebase App
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Initialize Analytics
    try { firebase.analytics(); } catch (e) {}

    const auth = firebase.auth();
    const db = firebase.firestore();
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    // --- Auth State Listener ---
    let currentUser = JSON.parse(localStorage.getItem('aura_user') || 'null');

    auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        currentUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          provider: 'google.com'
        };
        localStorage.setItem('aura_user', JSON.stringify(currentUser));
      } else {
        currentUser = null;
        localStorage.removeItem('aura_user');
      }
      window.dispatchEvent(new CustomEvent('aura_auth_change', { detail: currentUser }));
    });

    // --- Auth Service ---
    const AuthService = {
      getCurrentUser: () => {
        const fbUser = auth.currentUser;
        if (fbUser) {
          return {
            uid: fbUser.uid,
            displayName: fbUser.displayName,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            provider: 'google.com'
          };
        }
        return JSON.parse(localStorage.getItem('aura_user') || 'null');
      },

      signInWithGoogle: async () => {
        try {
          const result = await auth.signInWithPopup(googleProvider);
          const user = result.user;
          const userData = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            provider: 'google.com'
          };

          // Save user profile to Firestore
          await db.collection('users').doc(user.uid).set({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          currentUser = userData;
          localStorage.setItem('aura_user', JSON.stringify(userData));
          window.dispatchEvent(new CustomEvent('aura_auth_change', { detail: userData }));
          return userData;
        } catch (error) {
          console.error('Google Sign-In error:', error);
          throw error;
        }
      },

      signOut: async () => {
        await auth.signOut();
        currentUser = null;
        localStorage.removeItem('aura_user');
        window.dispatchEvent(new CustomEvent('aura_auth_change', { detail: null }));
      }
    };

    // --- Database Service (Firestore + localStorage fallback) ---
    function getLocalProducts() {
      const stored = localStorage.getItem('aura_custom_products');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      return typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
    }

    function saveLocalProducts(arr) {
      localStorage.setItem('aura_custom_products', JSON.stringify(arr));
    }

    function getLocalOrders() {
      const stored = localStorage.getItem('aura_all_orders');
      return stored ? JSON.parse(stored) : [];
    }

    function saveLocalOrders(arr) {
      localStorage.setItem('aura_all_orders', JSON.stringify(arr));
    }

    const DatabaseService = {
      // Products
      getProducts: () => getLocalProducts(),

      saveProduct: async (productData) => {
        const prods = getLocalProducts();
        const existingIdx = prods.findIndex(p => p.id === productData.id);
        if (existingIdx > -1) {
          prods[existingIdx] = { ...prods[existingIdx], ...productData };
        } else {
          productData.id = 'p_' + Date.now();
          prods.unshift(productData);
        }
        saveLocalProducts(prods);

        // Sync to Firestore
        try {
          await db.collection('products').doc(productData.id).set(productData, { merge: true });
        } catch (e) { console.warn('Firestore sync error:', e.message); }

        window.dispatchEvent(new Event('aura_products_updated'));
        return productData;
      },

      deleteProduct: async (productId) => {
        let prods = getLocalProducts().filter(p => p.id !== productId);
        saveLocalProducts(prods);

        try {
          await db.collection('products').doc(productId).delete();
        } catch (e) { console.warn('Firestore delete error:', e.message); }

        window.dispatchEvent(new Event('aura_products_updated'));
      },

      // Orders
      getOrders: () => getLocalOrders(),

      createOrder: async (payload) => {
        const orders = getLocalOrders();
        const newOrder = {
          orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString(),
          customer: payload.customer,
          userUid: currentUser ? currentUser.uid : null,
          userEmail: currentUser ? currentUser.email : null,
          items: payload.items,
          subtotal: payload.subtotal,
          discount: payload.discount || 0,
          shipping: payload.shipping || 0,
          total: payload.total,
          paymentMethod: payload.paymentMethod,
          status: 'Pending'
        };

        orders.unshift(newOrder);
        saveLocalOrders(orders);

        // Sync to Firestore
        try {
          await db.collection('orders').doc(newOrder.orderId).set({
            ...newOrder,
            date: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (e) { console.warn('Firestore order sync error:', e.message); }

        window.dispatchEvent(new Event('aura_orders_updated'));
        return newOrder;
      },

      updateOrderStatus: async (orderId, newStatus) => {
        const orders = getLocalOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
          order.status = newStatus;
          saveLocalOrders(orders);

          try {
            await db.collection('orders').doc(orderId).update({ status: newStatus });
          } catch (e) { console.warn('Firestore status update error:', e.message); }

          window.dispatchEvent(new Event('aura_orders_updated'));
        }
      },

      getUserOrders: (userUid) => {
        const orders = getLocalOrders();
        const user = currentUser;
        return orders.filter(o =>
          (userUid && o.userUid === userUid) ||
          (user && o.userEmail === user.email)
        );
      },

      // Load live products from Firestore on startup
      syncProductsFromFirestore: async () => {
        try {
          const snapshot = await db.collection('products').get();
          if (!snapshot.empty) {
            const firestoreProds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Merge with default products
            const defaultProds = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
            const merged = [...firestoreProds];
            defaultProds.forEach(dp => {
              if (!merged.find(fp => fp.id === dp.id)) merged.push(dp);
            });
            saveLocalProducts(merged);
            window.dispatchEvent(new Event('aura_products_updated'));
          }
        } catch (e) {
          console.warn('Firestore products sync skipped (offline/rules):', e.message);
        }
      },

      // Load live orders from Firestore on admin startup
      syncOrdersFromFirestore: async () => {
        try {
          const snapshot = await db.collection('orders').orderBy('date', 'desc').limit(100).get();
          if (!snapshot.empty) {
            const firestoreOrders = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                ...data,
                orderId: doc.id,
                date: data.date && data.date.toDate ? data.date.toDate().toISOString() : data.date || new Date().toISOString()
              };
            });
            saveLocalOrders(firestoreOrders);
            window.dispatchEvent(new Event('aura_orders_updated'));
          }
        } catch (e) {
          console.warn('Firestore orders sync skipped (offline/rules):', e.message);
        }
      }
    };

    // Expose to global window
    window.AuraBackend = {
      config: firebaseConfig,
      auth: AuthService,
      db: DatabaseService,
      firebase: firebase,
      firestoreDb: db
    };

    // Trigger ready event
    window.dispatchEvent(new Event('aura_backend_ready'));

    // Auto-sync products from Firestore
    DatabaseService.syncProductsFromFirestore();

    console.log('%c🔥 AURA Luxe Firebase Connected: aura-luxe-store', 'color: #6366f1; font-weight: bold; font-size: 13px;');
  }

  // Load scripts sequentially
  function loadNext(index) {
    if (index >= scripts.length) {
      onAllLoaded();
      return;
    }
    const s = document.createElement('script');
    s.src = scripts[index];
    s.onload = () => loadNext(index + 1);
    s.onerror = () => {
      console.warn('Failed to load Firebase SDK, using offline mode.');
      setupOfflineFallback();
    };
    document.head.appendChild(s);
  }

  // Offline fallback
  function setupOfflineFallback() {
    let currentUser = JSON.parse(localStorage.getItem('aura_user') || 'null');

    window.AuraBackend = {
      config: firebaseConfig,
      auth: {
        getCurrentUser: () => currentUser,
        signInWithGoogle: async () => {
          const user = {
            uid: 'local_' + Date.now(),
            displayName: 'Preview User',
            email: 'preview@example.com',
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            provider: 'local'
          };
          currentUser = user;
          localStorage.setItem('aura_user', JSON.stringify(user));
          window.dispatchEvent(new CustomEvent('aura_auth_change', { detail: user }));
          return user;
        },
        signOut: async () => {
          currentUser = null;
          localStorage.removeItem('aura_user');
          window.dispatchEvent(new CustomEvent('aura_auth_change', { detail: null }));
        }
      },
      db: {
        getProducts: () => {
          const stored = localStorage.getItem('aura_custom_products');
          return stored ? JSON.parse(stored) : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
        },
        saveProduct: (p) => {
          const prods = window.AuraBackend.db.getProducts();
          const idx = prods.findIndex(x => x.id === p.id);
          if (idx > -1) prods[idx] = { ...prods[idx], ...p };
          else { p.id = 'p_' + Date.now(); prods.unshift(p); }
          localStorage.setItem('aura_custom_products', JSON.stringify(prods));
          window.dispatchEvent(new Event('aura_products_updated'));
          return p;
        },
        deleteProduct: (id) => {
          const prods = window.AuraBackend.db.getProducts().filter(p => p.id !== id);
          localStorage.setItem('aura_custom_products', JSON.stringify(prods));
          window.dispatchEvent(new Event('aura_products_updated'));
        },
        getOrders: () => JSON.parse(localStorage.getItem('aura_all_orders') || '[]'),
        createOrder: (payload) => {
          const orders = window.AuraBackend.db.getOrders();
          const o = { orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000), date: new Date().toISOString(), ...payload, status: 'Pending' };
          orders.unshift(o);
          localStorage.setItem('aura_all_orders', JSON.stringify(orders));
          window.dispatchEvent(new Event('aura_orders_updated'));
          return o;
        },
        updateOrderStatus: (id, status) => {
          const orders = window.AuraBackend.db.getOrders();
          const o = orders.find(x => x.orderId === id);
          if (o) { o.status = status; localStorage.setItem('aura_all_orders', JSON.stringify(orders)); }
          window.dispatchEvent(new Event('aura_orders_updated'));
        },
        getUserOrders: (uid) => window.AuraBackend.db.getOrders().filter(o => o.userUid === uid || (currentUser && o.userEmail === currentUser.email)),
        syncProductsFromFirestore: async () => {},
        syncOrdersFromFirestore: async () => {}
      }
    };
    window.dispatchEvent(new Event('aura_backend_ready'));
  }

  // Start loading Firebase SDKs
  loadNext(0);

})();
