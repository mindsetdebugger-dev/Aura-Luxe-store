const PRODUCTS = [
  {
    id: 'p1',
    name: 'AURA Pulse Pro Wireless Headphones',
    tagline: 'Active Noise Canceling & Spatial Audio',
    category: 'audio',
    price: 349,
    originalPrice: 399,
    rating: 4.9,
    reviewsCount: 142,
    stock: 15,
    badge: 'Best Seller',
    image: 'images/headphones.jpg',
    accentColor: '#6366f1',
    description: 'Experience ultra-pure soundscapes with custom dynamic drivers, studio-grade active noise cancellation, and 40-hour battery life.',
    features: [
      'Custom 45mm beryllium drivers',
      'Advanced hybrid ANC with Transparency Mode',
      'Lossless bluetooth 5.3 & LDAC support',
      'Ergonomic memory-foam ear cushions',
      '40-Hour continuous playback with fast charging'
    ],
    specs: {
      'Frequency Response': '10Hz - 40,000Hz',
      'Battery Life': '40 Hours (ANC On)',
      'Weight': '265g',
      'Connectivity': 'Bluetooth 5.3 / 3.5mm Jack / USB-C Audio'
    }
  },
  {
    id: 'p2',
    name: 'Apex Horizon Smart Watch Ultra',
    tagline: 'Titanium Case & Sapphire Crystal',
    category: 'wearables',
    price: 499,
    originalPrice: 549,
    rating: 4.8,
    reviewsCount: 98,
    stock: 8,
    badge: 'Popular',
    image: 'images/smartwatch.jpg',
    accentColor: '#3b82f6',
    description: 'Crafted for extreme endurance and daily elegance. Built with aerospace titanium, multi-band GPS, and comprehensive biometric tracking.',
    features: [
      'Grade 5 Titanium bezel with sapphire glass screen',
      'Dual-frequency precision GPS & offline topography',
      'ECG, SpO2, and continuous heart rate tracking',
      '100m Water resistance with dive depth sensor',
      'Up to 14 days battery life on a single charge'
    ],
    specs: {
      'Display': '1.95" AMOLED 1000 nits Always-On',
      'Water Rating': '10 ATM (100 Meters)',
      'Battery': '500 mAh (14 Days typical)',
      'Compatibility': 'iOS & Android'
    }
  },
  {
    id: 'p3',
    name: 'CyberKey Studio Mechanical Keyboard',
    tagline: 'Hot-Swappable Aluminum Wireless Keyboard',
    category: 'keyboards',
    price: 219,
    originalPrice: 249,
    rating: 4.9,
    reviewsCount: 210,
    stock: 22,
    badge: 'New Arrival',
    image: 'images/keyboard.jpg',
    accentColor: '#8b5cf6',
    description: 'Precision engineered custom mechanical keyboard with gasket mount, per-key RGB backlighting, sound-absorbing foam, and wireless tri-mode connectivity.',
    features: [
      'Solid CNC anodized aluminum chassis',
      'Pre-lubed linear switches & double-shot PBT keycaps',
      'Hot-swappable PCB supporting 3-pin & 5-pin switches',
      'Bluetooth 5.1, 2.4GHz Wireless, and USB-C',
      'Customizable per-key RGB lighting via web software'
    ],
    specs: {
      'Layout': '75% Compact (82 Keys)',
      'Mount Type': 'Gasket Mount with Poron Foam',
      'Battery': '4000 mAh Rechargeable',
      'Weight': '1.45 kg'
    }
  },
  {
    id: 'p4',
    name: 'Lumix Vision 8K Cinema Camera',
    tagline: 'Mirrorless Full-Frame Creator Suite',
    category: 'cameras',
    price: 1899,
    originalPrice: 2099,
    rating: 5.0,
    reviewsCount: 64,
    stock: 4,
    badge: 'Pro Choice',
    image: 'images/camera.jpg',
    accentColor: '#ec4899',
    description: 'Unleash cinematic creativity with 8K RAW video recording, 61MP sensor clarity, in-body 5-axis stabilization, and AI eye-autofocus.',
    features: [
      '61MP Full-Frame Back-Illuminated CMOS Sensor',
      '8K 30fps & 4K 120fps RAW Video Recording',
      'In-Body Image Stabilization (up to 8 stops)',
      'AI Real-time Subject Recognition Auto-Focus',
      'Dual CFexpress Type B & SD UHS-II Card Slots'
    ],
    specs: {
      'Sensor': '35.9 x 24.0 mm Full Frame',
      'ISO Range': '50 - 102,400',
      'Viewfinder': '9.44M-dot OLED EVF',
      'Weight': '725g (Body only)'
    }
  },
  {
    id: 'p5',
    name: 'AURA Orbit Spatial Speaker',
    tagline: '360° Acoustic Soundfield & Ambient Light',
    category: 'audio',
    price: 279,
    originalPrice: 299,
    rating: 4.7,
    reviewsCount: 86,
    stock: 19,
    badge: 'Limited',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    accentColor: '#10b981',
    description: 'Immerse any room in rich room-filling audio with dual passive radiators, built-in room calibration, and soothing visual light halo.',
    features: [
      'High-excursion woofer with silk dome tweeters',
      'Real-time room acoustic sensing algorithm',
      'Syncable ambient LED light effects',
      'Wi-Fi 6, AirPlay 2, Spotify Connect & Bluetooth',
      'Touch-sensitive glass top control panel'
    ],
    specs: {
      'Output Power': '80W RMS Total Output',
      'Frequency Range': '35Hz - 24,000Hz',
      'Dimensions': '180mm x 180mm x 220mm',
      'Weight': '2.1 kg'
    }
  },
  {
    id: 'p6',
    name: 'Vanguard Stealth Tech Backpack',
    tagline: 'Waterproof Modular Laptop Pack',
    category: 'accessories',
    price: 159,
    originalPrice: 189,
    rating: 4.8,
    reviewsCount: 175,
    stock: 30,
    badge: 'Essential',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    accentColor: '#f59e0b',
    description: 'Designed for modern digital nomads. Weatherproof Cordura fabric, TSA-approved 16" laptop vault, and integrated magnetic quick-access pockets.',
    features: [
      '100% Recycled Cordura® Ballistic Nylon',
      'Suspended 16" padded laptop & tablet compartment',
      'Hidden RFID-blocking passport & wallet pocket',
      'Integrated USB-C passthrough charging port',
      'Ergonomic breathable back panel & sternum strap'
    ],
    specs: {
      'Capacity': '24 Liters (Expandable to 28L)',
      'Laptop Fit': 'Up to 16-inch MacBook Pro',
      'Water Resistance': 'IPX4 Weatherproof',
      'Weight': '1.1 kg'
    }
  },
  {
    id: 'p7',
    name: 'NovaGlide Wireless Precision Mouse',
    tagline: 'Ergonomic 8K DPI Optical Tracking',
    category: 'accessories',
    price: 119,
    originalPrice: 139,
    rating: 4.9,
    reviewsCount: 132,
    stock: 25,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    accentColor: '#06b6d4',
    description: 'Engineered for smooth workflow productivity. Quiet tactile clicks, electromagnetic scroll wheel, and glass surface tracking.',
    features: [
      '8,000 DPI Darkfield glass-tracking sensor',
      'MagSpeed electromagnetic wheel (1,000 lines/sec)',
      'Dual mode wireless: Bluetooth + 2.4GHz dongle',
      'Customizable side thumb wheel & gesture buttons',
      'Fast USB-C charging (3-hr charge gives 70 days)'
    ],
    specs: {
      'Sensor': 'Darkfield High Precision',
      'Battery Life': 'Up to 70 days on full charge',
      'Weight': '141g',
      'Compatibility': 'Windows, macOS, iPadOS, Linux'
    }
  },
  {
    id: 'p8',
    name: 'Quantum VR Spatial Glasses',
    tagline: 'Ultra-Light 4K Micro-OLED Displays',
    category: 'wearables',
    price: 799,
    originalPrice: 899,
    rating: 4.9,
    reviewsCount: 57,
    stock: 6,
    badge: 'Futuristic',
    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&auto=format&fit=crop&q=80',
    accentColor: '#8b5cf6',
    description: 'Transform any room into a massive 200-inch virtual studio with dual 4K Micro-OLED screens, spatial audio speakers, and lightweight comfort.',
    features: [
      'Dual 3840x2160 Micro-OLED displays (120Hz refresh)',
      'Directional spatial audio speakers integrated into temples',
      'Plug-and-play USB-C video output for laptops & phones',
      'Adjustable interpupillary distance (IPD)',
      'Lightweight frame weighing just 85 grams'
    ],
    specs: {
      'Screen Size': '200" Virtual Screen experience',
      'FOV': '52 Degrees',
      'Weight': '85g',
      'Audio': 'Open-ear directional speakers'
    }
  }
];

const PROMO_CODES = {
  'AURA10': { discount: 0.10, description: '10% OFF Total Order' },
  'LUXE20': { discount: 0.20, description: '20% OFF Total Order' },
  'FREESHIP': { discount: 0.00, freeShipping: true, description: 'Free Express Shipping' }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRODUCTS, PROMO_CODES };
}
