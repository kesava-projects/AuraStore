import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { Cart } from '../models/Cart.js';

export async function seedData() {
  console.log('Seeding database...');

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Users (1 admin, 3 customers)
  const users = await User.create([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      addresses: [
        {
          fullName: 'Admin User',
          street: '100 Executive Way',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'USA',
          phone: '+1 555-0199',
          isDefault: true,
        },
      ],
      isActive: true,
    },
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      passwordHash,
      role: 'customer',
      addresses: [
        {
          fullName: 'Alice Johnson',
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'USA',
          phone: '+1 555-0101',
          isDefault: true,
        },
      ],
      isActive: true,
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      passwordHash,
      role: 'customer',
      addresses: [
        {
          fullName: 'Bob Smith',
          street: '221B Baker Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          phone: '+1 555-0102',
          isDefault: true,
        },
      ],
      isActive: true,
    },
    {
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      passwordHash,
      role: 'customer',
      addresses: [
        {
          fullName: 'Charlie Davis',
          street: '42 Wallaby Way',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          country: 'USA',
          phone: '+1 555-0103',
          isDefault: true,
        },
      ],
      isActive: true,
    },
  ]);

  const [_admin, alice, bob, charlie] = users;

  // 2. Categories (6 categories)
  const categoriesData = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Clothing & Apparel', slug: 'clothing' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
    { name: 'Books & Stationery', slug: 'books-stationery' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
  ];

  const categories = await Category.create(categoriesData);
  const catMap = {};
  categories.forEach((cat) => {
    catMap[cat.slug] = cat._id;
  });

  // 3. Products (~40 realistic products across 6 categories)
  const productsData = [
    // Electronics (8)
    {
      title: 'Aura Wireless Noise-Cancelling Headphones',
      slug: 'aura-wireless-noise-cancelling-headphones',
      description:
        'Premium over-ear headphones with active noise cancellation, 40-hour battery life, and crystal-clear acoustic fidelity.',
      price: 249.99,
      compareAtPrice: 299.99,
      categoryId: catMap['electronics'],
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
      stock: 45,
      sku: 'ELEC-HP-001',
      attributes: { Color: 'Matte Black', Battery: '40h', Connectivity: 'Bluetooth 5.3' },
      ratingAvg: 4.8,
      ratingCount: 124,
    },
    {
      title: 'UltraSync Smart Fitness Watch V2',
      slug: 'ultrasync-smart-fitness-watch-v2',
      description:
        'Sleek AMOLED smartwatch with continuous heart-rate tracking, GPS tracking, sleep insights, and 5 ATM water resistance.',
      price: 179.99,
      compareAtPrice: 199.99,
      categoryId: catMap['electronics'],
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
      stock: 30,
      sku: 'ELEC-SW-002',
      attributes: { Display: 'AMOLED', Battery: '7 Days', Waterproof: '5 ATM' },
      ratingAvg: 4.6,
      ratingCount: 88,
    },
    {
      title: 'ProVision 4K Ultra HD Action Camera',
      slug: 'provision-4k-ultra-hd-action-camera',
      description:
        'Capture 4K60fps adventures with hyper-smooth stabilization, waterproof casing down to 30 meters, and dual touchscreen displays.',
      price: 219.0,
      compareAtPrice: 259.0,
      categoryId: catMap['electronics'],
      images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'],
      stock: 22,
      sku: 'ELEC-AC-003',
      attributes: { Resolution: '4K60', Waterproof: '30m', Stabilizer: '6-Axis' },
      ratingAvg: 4.5,
      ratingCount: 42,
    },
    {
      title: 'EchoBeats Portable Waterproof Bluetooth Speaker',
      slug: 'echobeats-portable-waterproof-bluetooth-speaker',
      description:
        'Compact 360-degree sound speaker featuring punchy bass, IPX7 waterproof rating, and 24 hours of non-stop playback.',
      price: 69.99,
      compareAtPrice: 89.99,
      categoryId: catMap['electronics'],
      images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'],
      stock: 60,
      sku: 'ELEC-SP-004',
      attributes: { Power: '20W', Waterproof: 'IPX7', Battery: '24h' },
      ratingAvg: 4.7,
      ratingCount: 95,
    },
    {
      title: 'Apex Mechanical Gaming Keyboard RGB',
      slug: 'apex-mechanical-gaming-keyboard-rgb',
      description:
        'Customizable mechanical switches with per-key RGB backlighting, aircraft-grade aluminum chassis, and magnetic wrist rest.',
      price: 129.99,
      compareAtPrice: 149.99,
      categoryId: catMap['electronics'],
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
      stock: 35,
      sku: 'ELEC-KB-005',
      attributes: { Switches: 'Linear Red', Layout: 'Full Size', RGB: 'Yes' },
      ratingAvg: 4.9,
      ratingCount: 160,
    },
    {
      title: 'Precision Wireless Ergonomic Mouse',
      slug: 'precision-wireless-ergonomic-mouse',
      description:
        'Sculpted natural grip mouse designed to reduce wrist strain, featuring dual Bluetooth/2.4G connectivity and silent clicks.',
      price: 54.99,
      compareAtPrice: 65.0,
      categoryId: catMap['electronics'],
      images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80'],
      stock: 50,
      sku: 'ELEC-MS-006',
      attributes: { DPI: '4000', Grip: 'Ergonomic Right', Connectivity: 'Dual Mode' },
      ratingAvg: 4.4,
      ratingCount: 51,
    },
    {
      title: 'OmniCharge 65W GaN Fast Charger',
      slug: 'omnicharge-65w-gan-fast-charger',
      description:
        'Compact Gallium Nitride charger with 2 USB-C and 1 USB-A ports, capable of powering laptops, tablets, and phones simultaneously.',
      price: 39.99,
      compareAtPrice: 49.99,
      categoryId: catMap['electronics'],
      images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'],
      stock: 80,
      sku: 'ELEC-CG-007',
      attributes: { Wattage: '65W', Ports: '3 Ports', Tech: 'GaN III' },
      ratingAvg: 4.8,
      ratingCount: 110,
    },
    {
      title: 'NovaTrue Wireless Earbuds with ANC',
      slug: 'novatrue-wireless-earbuds-with-anc',
      description:
        'Ultra-lightweight wireless earbuds with active noise cancellation, transparency mode, and 32 hours total case battery life.',
      price: 99.99,
      compareAtPrice: 129.99,
      categoryId: catMap['electronics'],
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'],
      stock: 70,
      sku: 'ELEC-EB-008',
      attributes: { Color: 'Ceramic White', Battery: '32h', Waterproof: 'IPX4' },
      ratingAvg: 4.7,
      ratingCount: 78,
    },

    // Clothing & Apparel (7)
    {
      title: 'Organic Cotton Classic Crewneck T-Shirt',
      slug: 'organic-cotton-classic-crewneck-t-shirt',
      description:
        'Tailored regular fit t-shirt crafted from 100% GOTS-certified organic ring-spun cotton. Ultra-soft and pre-shrunk.',
      price: 28.0,
      compareAtPrice: 35.0,
      categoryId: catMap['clothing'],
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'],
      stock: 120,
      sku: 'CLOTH-TS-001',
      attributes: { Material: '100% Organic Cotton', Fit: 'Regular', Color: 'Heather Navy' },
      ratingAvg: 4.7,
      ratingCount: 65,
    },
    {
      title: 'All-Weather Urban Commuter Jacket',
      slug: 'all-weather-urban-commuter-jacket',
      description:
        'Windproof, water-resistant shell jacket with breathable mesh lining, hidden hood, and reflective safety accents.',
      price: 135.0,
      compareAtPrice: 165.0,
      categoryId: catMap['clothing'],
      images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80'],
      stock: 40,
      sku: 'CLOTH-JK-002',
      attributes: { WaterResistant: '10,000mm', Fabric: 'Recycled Poly', Color: 'Charcoal' },
      ratingAvg: 4.6,
      ratingCount: 38,
    },
    {
      title: 'Stretch Denim Slim-Fit Jeans',
      slug: 'stretch-denim-slim-fit-jeans',
      description:
        'Comfortable everyday jeans engineered with premium flex denim for maximum movement and durability.',
      price: 78.0,
      compareAtPrice: 95.0,
      categoryId: catMap['clothing'],
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80'],
      stock: 55,
      sku: 'CLOTH-JN-003',
      attributes: { Cut: 'Slim Fit', Material: '98% Cotton 2% Elastane', Wash: 'Dark Indigo' },
      ratingAvg: 4.5,
      ratingCount: 47,
    },
    {
      title: 'Merino Wool Minimalist Pullover Sweater',
      slug: 'merino-wool-minimalist-pullover-sweater',
      description:
        'Spun from extra-fine Australian merino wool, offering natural temperature regulation, odor resistance, and unmatched warmth.',
      price: 110.0,
      compareAtPrice: 140.0,
      categoryId: catMap['clothing'],
      images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80'],
      stock: 35,
      sku: 'CLOTH-SW-004',
      attributes: { Material: '100% Merino Wool', Neckline: 'Crew', Color: 'Oatmeal' },
      ratingAvg: 4.8,
      ratingCount: 29,
    },
    {
      title: 'Performance Athletic Training Shorts',
      slug: 'performance-athletic-training-shorts',
      description:
        'Lightweight 7-inch inseam athletic shorts with built-in compression liner, zippered phone pocket, and 4-way stretch fabric.',
      price: 42.0,
      compareAtPrice: 50.0,
      categoryId: catMap['clothing'],
      images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80'],
      stock: 65,
      sku: 'CLOTH-SH-005',
      attributes: { Inseam: '7 inch', Liner: 'Compression', QuickDry: 'Yes' },
      ratingAvg: 4.6,
      ratingCount: 52,
    },
    {
      title: 'Relaxed Heavyweight French Terry Hoodie',
      slug: 'relaxed-heavyweight-french-terry-hoodie',
      description:
        'Substantial 450 GSM French terry hoodie with double-layer hood, kangaroo pocket, and ribbed side gussets.',
      price: 89.0,
      compareAtPrice: 105.0,
      categoryId: catMap['clothing'],
      images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80'],
      stock: 48,
      sku: 'CLOTH-HD-006',
      attributes: { Weight: '450 GSM', Fit: 'Relaxed Drop Shoulder', Color: 'Olive' },
      ratingAvg: 4.9,
      ratingCount: 84,
    },
    {
      title: 'Genuine Leather Minimalist Bifold Wallet',
      slug: 'genuine-leather-minimalist-bifold-wallet',
      description:
        'Handcrafted full-grain leather wallet equipped with RFID-blocking lining, 8 card slots, and slim currency pocket.',
      price: 45.0,
      compareAtPrice: 60.0,
      categoryId: catMap['clothing'],
      images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'],
      stock: 50,
      sku: 'CLOTH-WL-007',
      attributes: { Material: 'Full Grain Leather', RFID: 'Yes', Color: 'Cognac Brown' },
      ratingAvg: 4.7,
      ratingCount: 71,
    },

    // Home & Kitchen (7)
    {
      title: 'Precision Temperature Electric Gooseneck Kettle',
      slug: 'precision-temperature-electric-gooseneck-kettle',
      description:
        'Barista-grade 0.9L pour-over kettle with to-the-degree temperature control, 60-minute hold mode, and rapid 1200W heating.',
      price: 89.99,
      compareAtPrice: 109.99,
      categoryId: catMap['home-kitchen'],
      images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80'],
      stock: 35,
      sku: 'HOME-KT-001',
      attributes: { Capacity: '0.9 Liter', Power: '1200W', Material: 'Stainless Steel' },
      ratingAvg: 4.9,
      ratingCount: 112,
    },
    {
      title: 'Cast Iron Enamelled Dutch Oven 5.5 Quart',
      slug: 'cast-iron-enamelled-dutch-oven-5-5-quart',
      description:
        'Heavyweight enameled cast iron pot designed for superior heat distribution and retention. Oven safe up to 500°F.',
      price: 99.0,
      compareAtPrice: 129.0,
      categoryId: catMap['home-kitchen'],
      images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80'],
      stock: 25,
      sku: 'HOME-DO-002',
      attributes: { Capacity: '5.5 Qt', OvenSafe: '500 F', Color: 'Emerald Green' },
      ratingAvg: 4.8,
      ratingCount: 93,
    },
    {
      title: 'Artisan Japanese Damascus Steel Chef Knife 8-Inch',
      slug: 'artisan-japanese-damascus-steel-chef-knife-8-inch',
      description:
        'Forged with 67 layers of VG-10 Damascus steel, razor-sharp 15-degree edge angle, and ergonomic pakkawood handle.',
      price: 119.0,
      compareAtPrice: 149.0,
      categoryId: catMap['home-kitchen'],
      images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80'],
      stock: 40,
      sku: 'HOME-KN-003',
      attributes: { Steel: 'VG-10 Damascus', BladeLength: '8 inch', Handle: 'Pakkawood' },
      ratingAvg: 4.9,
      ratingCount: 145,
    },
    {
      title: 'Smart Ultrasonic Cool Mist Humidifier',
      slug: 'smart-ultrasonic-cool-mist-humidifier',
      description:
        'Top-fill 4L whisper-quiet humidifier with built-in humidistat, essential oil diffuser tray, and auto shut-off protection.',
      price: 59.99,
      compareAtPrice: 74.99,
      categoryId: catMap['home-kitchen'],
      images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80'],
      stock: 45,
      sku: 'HOME-HM-004',
      attributes: { TankSize: '4L', NoiseLevel: '<28dB', Diffuser: 'Yes' },
      ratingAvg: 4.5,
      ratingCount: 66,
    },
    {
      title: 'AeroBlend High-Speed Countertop Blender',
      slug: 'aeroblend-high-speed-countertop-blender',
      description:
        'Commercial-grade 1400W motor blender with 6 stainless steel blades, pulse control, and 64oz BPA-free Tritan pitcher.',
      price: 139.99,
      compareAtPrice: 179.99,
      categoryId: catMap['home-kitchen'],
      images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80'],
      stock: 20,
      sku: 'HOME-BL-005',
      attributes: { Power: '1400W', Pitcher: '64 oz BPA-Free', Speeds: '10 Variable' },
      ratingAvg: 4.7,
      ratingCount: 77,
    },
    {
      title: 'Organic Bamboo Non-Slip Cutting Board Set',
      slug: 'organic-bamboo-non-slip-cutting-board-set',
      description:
        'Set of 3 knife-friendly bamboo cutting boards featuring juice grooves, handle cutouts, and silicone non-slip feet.',
      price: 34.99,
      compareAtPrice: 45.0,
      categoryId: catMap['home-kitchen'],
      images: ['https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80'],
      stock: 65,
      sku: 'HOME-CB-006',
      attributes: { Material: 'Organic Bamboo', Pieces: '3-Piece Set', Feature: 'Juice Grooves' },
      ratingAvg: 4.6,
      ratingCount: 54,
    },
    {
      title: 'Minimalist Ceramic Pour-Over Coffee Maker',
      slug: 'minimalist-ceramic-pour-over-coffee-maker',
      description:
        'Artisanal matte ceramic dripper paired with a heat-resistant borosilicate glass carafe for pure, flavorful coffee extraction.',
      price: 38.0,
      compareAtPrice: 48.0,
      categoryId: catMap['home-kitchen'],
      images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'],
      stock: 40,
      sku: 'HOME-CF-007',
      attributes: { Material: 'Ceramic & Glass', Capacity: '600ml', FilterSize: '#02' },
      ratingAvg: 4.8,
      ratingCount: 83,
    },

    // Sports & Outdoors (6)
    {
      title: 'Summit Ultralight 2-Person Backpacking Tent',
      slug: 'summit-ultralight-2-person-backpacking-tent',
      description:
        'Freestanding 3-season tent weighing only 3.2 lbs, built with ripstop silicone-coated nylon and aerospace aluminum poles.',
      price: 229.0,
      compareAtPrice: 269.0,
      categoryId: catMap['sports-outdoors'],
      images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80'],
      stock: 18,
      sku: 'SPRT-TN-001',
      attributes: { Capacity: '2-Person', Weight: '3.2 lbs', Seasons: '3-Season' },
      ratingAvg: 4.9,
      ratingCount: 67,
    },
    {
      title: 'HydroShield Insulated Stainless Steel Water Bottle 32oz',
      slug: 'hydroshield-insulated-stainless-steel-water-bottle-32oz',
      description:
        'Double-wall vacuum insulation keeps ice cold for 24 hours or hot for 12 hours. Sweat-free powder coat exterior.',
      price: 29.99,
      compareAtPrice: 38.0,
      categoryId: catMap['sports-outdoors'],
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
      stock: 90,
      sku: 'SPRT-WB-002',
      attributes: { Volume: '32 oz', ColdHold: '24 Hours', HotHold: '12 Hours' },
      ratingAvg: 4.8,
      ratingCount: 182,
    },
    {
      title: 'Eco-Grip Non-Slip Natural Rubber Yoga Mat',
      slug: 'eco-grip-non-slip-natural-rubber-yoga-mat',
      description:
        'Extra-dense 5mm cushioning crafted from sustainably harvested tree rubber with laser-etched alignment guides.',
      price: 68.0,
      compareAtPrice: 85.0,
      categoryId: catMap['sports-outdoors'],
      images: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80'],
      stock: 45,
      sku: 'SPRT-YM-003',
      attributes: { Thickness: '5mm', Material: 'Natural Tree Rubber', Weight: '5.5 lbs' },
      ratingAvg: 4.7,
      ratingCount: 91,
    },
    {
      title: 'Velocity Pro Adjustable Speed Jump Rope',
      slug: 'velocity-pro-adjustable-speed-jump-rope',
      description:
        'Smooth 360-degree ball bearing system with steel wire cable and anti-slip aluminum knurled handles for high-intensity training.',
      price: 24.99,
      compareAtPrice: 32.0,
      categoryId: catMap['sports-outdoors'],
      images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80'],
      stock: 75,
      sku: 'SPRT-JR-004',
      attributes: {
        Cable: 'Kink-free Steel Wire',
        Bearings: 'Dual Precision',
        Length: '10ft Adjustable',
      },
      ratingAvg: 4.6,
      ratingCount: 49,
    },
    {
      title: 'TrailMaster Carbon Fiber Trekking Poles Pair',
      slug: 'trailmaster-carbon-fiber-trekking-poles-pair',
      description:
        'Ultralight carbon fiber poles with quick-flip lock adjustments, moisture-wicking cork grips, and tungsten carbide tips.',
      price: 79.0,
      compareAtPrice: 99.0,
      categoryId: catMap['sports-outdoors'],
      images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'],
      stock: 30,
      sku: 'SPRT-TP-005',
      attributes: { Material: '100% Carbon Fiber', WeightPerPair: '15.4 oz', Grip: 'Natural Cork' },
      ratingAvg: 4.8,
      ratingCount: 63,
    },
    {
      title: 'Endurance Hex Rubber Dumbbells Set (2x 20 lbs)',
      slug: 'endurance-hex-rubber-dumbbells-set-2x-20-lbs',
      description:
        'Heavy-duty solid cast iron dumbbells encased in durable virgin rubber to protect floors and reduce noise during home workouts.',
      price: 64.99,
      compareAtPrice: 79.99,
      categoryId: catMap['sports-outdoors'],
      images: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80'],
      stock: 25,
      sku: 'SPRT-DB-006',
      attributes: {
        Weight: '20 lbs each (pair)',
        Finish: 'Hex Rubber Encased',
        Handle: 'Chrome Contoured',
      },
      ratingAvg: 4.7,
      ratingCount: 40,
    },

    // Books & Stationery (6)
    {
      title: 'Refined Hardcover Dot-Grid Journal Notebook',
      slug: 'refined-hardcover-dot-grid-journal-notebook',
      description:
        'Fountain pen-friendly 160 GSM bamboo paper, numbered pages, dual ribbon bookmarks, and an expandable back pocket.',
      price: 22.5,
      compareAtPrice: 28.0,
      categoryId: catMap['books-stationery'],
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'],
      stock: 85,
      sku: 'BOOK-JN-001',
      attributes: { PaperWeight: '160 GSM', Ruling: '5mm Dot Grid', Pages: '192 Pages' },
      ratingAvg: 4.9,
      ratingCount: 135,
    },
    {
      title: 'Brass Fountain Pen with Fine Stainless Steel Nib',
      slug: 'brass-fountain-pen-with-fine-stainless-steel-nib',
      description:
        'Solid machined brass pen that develops a unique natural patina over time. Balanced weight distribution for fatigue-free writing.',
      price: 48.0,
      compareAtPrice: 60.0,
      categoryId: catMap['books-stationery'],
      images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80'],
      stock: 40,
      sku: 'BOOK-FP-002',
      attributes: { Body: 'Solid Brass', Nib: 'Fine (0.5mm)', Filling: 'Cartridge/Converter' },
      ratingAvg: 4.7,
      ratingCount: 58,
    },
    {
      title: 'Modern Architecture & Design Monograph',
      slug: 'modern-architecture-and-design-monograph',
      description:
        'Coffee table hardcover publication surveying monumental contemporary architectural works across 5 continents with 300+ full-color plates.',
      price: 55.0,
      compareAtPrice: 70.0,
      categoryId: catMap['books-stationery'],
      images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80'],
      stock: 20,
      sku: 'BOOK-AR-003',
      attributes: { Format: 'Hardcover', Pages: '320', Dimensions: '10x12 inches' },
      ratingAvg: 4.8,
      ratingCount: 32,
    },
    {
      title: 'Minimalist Walnut Wood Desk Organizer Tray',
      slug: 'minimalist-walnut-wood-desk-organizer-tray',
      description:
        'Hand-sanded solid American walnut tray carved with dedicated slots for pens, smartphones, paperclips, and keys.',
      price: 36.0,
      compareAtPrice: 45.0,
      categoryId: catMap['books-stationery'],
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'],
      stock: 35,
      sku: 'BOOK-DO-004',
      attributes: { Wood: 'Solid Walnut', Finish: 'Natural Wax', Feet: 'Cork Cushioned' },
      ratingAvg: 4.6,
      ratingCount: 44,
    },
    {
      title: 'The Art of Mindful Software Architecture Book',
      slug: 'the-art-of-mindful-software-architecture-book',
      description:
        'A comprehensive engineering guide on domain-driven design, scalable microservices, resilient patterns, and engineering culture.',
      price: 44.99,
      compareAtPrice: 54.99,
      categoryId: catMap['books-stationery'],
      images: ['https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&q=80'],
      stock: 50,
      sku: 'BOOK-SW-005',
      attributes: { Language: 'English', Pages: '460', PublicationYear: '2025' },
      ratingAvg: 4.9,
      ratingCount: 120,
    },
    {
      title: 'Premium Gel Roller Ink Pens (Pack of 8)',
      slug: 'premium-gel-roller-ink-pens-pack-of-8',
      description:
        'Quick-drying, smear-free Japanese archival pigment gel pens with comfortable rubberized grip and needle tip precision.',
      price: 16.99,
      compareAtPrice: 22.0,
      categoryId: catMap['books-stationery'],
      images: ['https://images.unsplash.com/photo-1585336261026-78b172a39281?w=800&q=80'],
      stock: 100,
      sku: 'BOOK-PN-006',
      attributes: { TipSize: '0.5mm', InkColor: 'Black', Quantity: '8 Pens' },
      ratingAvg: 4.8,
      ratingCount: 89,
    },

    // Beauty & Personal Care (6)
    {
      title: 'Radiance Hyaluronic Acid & Vitamin C Facial Serum',
      slug: 'radiance-hyaluronic-acid-vitamin-c-facial-serum',
      description:
        'Clinically proven brightening facial serum with pure vitamin C, multi-molecular weight hyaluronic acid, and botanical extracts.',
      price: 38.0,
      compareAtPrice: 48.0,
      categoryId: catMap['beauty-personal-care'],
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'],
      stock: 60,
      sku: 'BEAUT-SR-001',
      attributes: { Volume: '30ml / 1 fl oz', SkinType: 'All Skin Types', Vegan: 'Yes' },
      ratingAvg: 4.8,
      ratingCount: 142,
    },
    {
      title: 'Botanical Nourishing Ceramide Moisturizer 50ml',
      slug: 'botanical-nourishing-ceramide-moisturizer-50ml',
      description:
        'Rich barrier-repair moisturizer loaded with ceramides, squalane, and colloidal oat to deeply hydrate and soothe dry, sensitive skin.',
      price: 32.0,
      compareAtPrice: 40.0,
      categoryId: catMap['beauty-personal-care'],
      images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80'],
      stock: 55,
      sku: 'BEAUT-CR-002',
      attributes: { Volume: '50ml', FragranceFree: 'Yes', CrueltyFree: 'Yes' },
      ratingAvg: 4.7,
      ratingCount: 98,
    },
    {
      title: 'Sonic Wave Silicone Facial Cleansing Device',
      slug: 'sonic-wave-silicone-facial-cleansing-device',
      description:
        'Ultra-hygienic silicone electric cleanser delivering 8000 sonic pulsations per minute with 8 adjustable intensity settings.',
      price: 59.0,
      compareAtPrice: 75.0,
      categoryId: catMap['beauty-personal-care'],
      images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80'],
      stock: 35,
      sku: 'BEAUT-SD-003',
      attributes: { Waterproof: 'IPX7', BatteryLife: '300 Uses', Material: 'Body-Safe Silicone' },
      ratingAvg: 4.6,
      ratingCount: 52,
    },
    {
      title: 'Organic Cold-Pressed Pure Argan Oil 100ml',
      slug: 'organic-cold-pressed-pure-argan-oil-100ml',
      description:
        '100% pure Moroccan argan oil rich in essential fatty acids and vitamin E, providing restorative moisture for hair, skin, and nails.',
      price: 26.0,
      compareAtPrice: 34.0,
      categoryId: catMap['beauty-personal-care'],
      images: ['https://images.unsplash.com/photo-1608248597359-009d73cb695f?w=800&q=80'],
      stock: 70,
      sku: 'BEAUT-AO-004',
      attributes: { Certification: 'USDA Organic', Volume: '100ml', ColdPressed: 'Yes' },
      ratingAvg: 4.9,
      ratingCount: 110,
    },
    {
      title: 'Mineral Broad-Spectrum Matte Sunscreen SPF 50',
      slug: 'mineral-broad-spectrum-matte-sunscreen-spf-50',
      description:
        'Non-nano zinc oxide physical sunscreen offering reef-safe SPF 50 protection with an invisible, non-greasy matte finish.',
      price: 28.0,
      compareAtPrice: 35.0,
      categoryId: catMap['beauty-personal-care'],
      images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80'],
      stock: 80,
      sku: 'BEAUT-SS-005',
      attributes: { SPF: '50 Broad Spectrum', Active: '20% Zinc Oxide', ReefSafe: 'Yes' },
      ratingAvg: 4.7,
      ratingCount: 75,
    },
    {
      title: 'Aromatherapy Lavender & Cedarwood Essential Oil Diffuser Set',
      slug: 'aromatherapy-lavender-and-cedarwood-essential-oil-diffuser-set',
      description:
        'Pure therapeutic-grade organic essential oils packaged in amber UV-protective dropper bottles for deep relaxation and restful sleep.',
      price: 24.0,
      compareAtPrice: 30.0,
      categoryId: catMap['beauty-personal-care'],
      images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80'],
      stock: 65,
      sku: 'BEAUT-EO-006',
      attributes: {
        SetIncludes: 'Lavender 15ml, Cedarwood 15ml',
        Grade: 'Therapeutic',
        Organic: 'Yes',
      },
      ratingAvg: 4.8,
      ratingCount: 63,
    },
  ];

  const products = await Product.create(productsData);

  // 4. Coupons (one expired, one valid percent, one valid fixed, one usage-limited)
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 30);

  const coupons = await Coupon.create([
    {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      minOrder: 50,
      maxUses: 1000,
      usedCount: 15,
      expiresAt: futureDate,
      isActive: true,
    },
    {
      code: 'SAVE20',
      type: 'fixed',
      value: 20,
      minOrder: 100,
      maxUses: 500,
      usedCount: 42,
      expiresAt: futureDate,
      isActive: true,
    },
    {
      code: 'EXPIRED30',
      type: 'percent',
      value: 30,
      minOrder: 50,
      maxUses: 100,
      usedCount: 100,
      expiresAt: pastDate,
      isActive: true,
    },
    {
      code: 'FLASH50',
      type: 'percent',
      value: 50,
      minOrder: 200,
      maxUses: 10,
      usedCount: 10, // fully used
      expiresAt: futureDate,
      isActive: true,
    },
  ]);

  // 5. Sample orders in each status (placed, packed, shipped, delivered, cancelled)
  const headphones = products[0];
  const watch = products[1];
  const tShirt = products[8];
  const kettle = products[15];

  const sampleAddress = {
    fullName: 'Alice Johnson',
    street: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'USA',
    phone: '+1 555-0101',
  };

  const orders = await Order.create([
    // Placed
    {
      userId: alice._id,
      items: [
        {
          productId: headphones._id,
          title: headphones.title,
          price: headphones.price,
          quantity: 1,
          image: headphones.images[0],
        },
      ],
      shippingAddress: sampleAddress,
      subtotal: 249.99,
      discount: 0,
      shippingFee: 0,
      tax: 20.0,
      total: 269.99,
      paymentStatus: 'paid',
      orderStatus: 'placed',
      stripeSessionId: 'cs_test_sample_placed_001',
      stripePaymentIntentId: 'pi_test_sample_001',
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(Date.now() - 3600000 * 2),
          note: 'Order placed & paid',
        },
      ],
    },
    // Packed
    {
      userId: bob._id,
      items: [
        {
          productId: watch._id,
          title: watch.title,
          price: watch.price,
          quantity: 1,
          image: watch.images[0],
        },
      ],
      shippingAddress: sampleAddress,
      subtotal: 179.99,
      discount: 18.0,
      shippingFee: 0,
      tax: 12.96,
      total: 174.95,
      paymentStatus: 'paid',
      orderStatus: 'packed',
      couponCode: 'WELCOME10',
      stripeSessionId: 'cs_test_sample_packed_002',
      stripePaymentIntentId: 'pi_test_sample_002',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 3600000 * 12), note: 'Order placed' },
        {
          status: 'packed',
          timestamp: new Date(Date.now() - 3600000 * 6),
          note: 'Packed at fulfillment center',
        },
      ],
    },
    // Shipped
    {
      userId: alice._id,
      items: [
        {
          productId: tShirt._id,
          title: tShirt.title,
          price: tShirt.price,
          quantity: 2,
          image: tShirt.images[0],
        },
      ],
      shippingAddress: sampleAddress,
      subtotal: 56.0,
      discount: 0,
      shippingFee: 10.0,
      tax: 4.48,
      total: 70.48,
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      stripeSessionId: 'cs_test_sample_shipped_003',
      stripePaymentIntentId: 'pi_test_sample_003',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 3600000 * 48), note: 'Order placed' },
        { status: 'packed', timestamp: new Date(Date.now() - 3600000 * 36), note: 'Packed' },
        {
          status: 'shipped',
          timestamp: new Date(Date.now() - 3600000 * 24),
          note: 'Shipped via FedEx Express #FX982341',
        },
      ],
    },
    // Delivered (allows Alice to review kettle)
    {
      userId: alice._id,
      items: [
        {
          productId: kettle._id,
          title: kettle.title,
          price: kettle.price,
          quantity: 1,
          image: kettle.images[0],
        },
      ],
      shippingAddress: sampleAddress,
      subtotal: 89.99,
      discount: 0,
      shippingFee: 10.0,
      tax: 7.2,
      total: 107.19,
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      stripeSessionId: 'cs_test_sample_delivered_004',
      stripePaymentIntentId: 'pi_test_sample_004',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 3600000 * 96), note: 'Order placed' },
        { status: 'packed', timestamp: new Date(Date.now() - 3600000 * 80), note: 'Packed' },
        { status: 'shipped', timestamp: new Date(Date.now() - 3600000 * 60), note: 'In transit' },
        {
          status: 'delivered',
          timestamp: new Date(Date.now() - 3600000 * 10),
          note: 'Delivered to front door',
        },
      ],
    },
    // Cancelled
    {
      userId: charlie._id,
      items: [
        {
          productId: watch._id,
          title: watch.title,
          price: watch.price,
          quantity: 1,
          image: watch.images[0],
        },
      ],
      shippingAddress: sampleAddress,
      subtotal: 179.99,
      discount: 0,
      shippingFee: 0,
      tax: 14.4,
      total: 194.39,
      paymentStatus: 'refunded',
      orderStatus: 'cancelled',
      stripeSessionId: 'cs_test_sample_cancelled_005',
      stripePaymentIntentId: 'pi_test_sample_005',
      statusHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 3600000 * 30), note: 'Order placed' },
        {
          status: 'cancelled',
          timestamp: new Date(Date.now() - 3600000 * 25),
          note: 'Order cancelled by customer. Refund processed.',
        },
      ],
    },
  ]);

  // 6. Sample Review (Alice reviewed kettle since it was delivered)
  await Review.create({
    productId: kettle._id,
    userId: alice._id,
    rating: 5,
    comment:
      'Exceptional kettle! Heats to the exact degree within two minutes and the pour stream is ultra steady for morning coffee.',
  });

  // 7. Initial empty cart for Alice and Bob
  await Cart.create([
    {
      userId: alice._id,
      items: [
        {
          productId: headphones._id,
          quantity: 1,
          priceSnapshot: headphones.price,
        },
      ],
    },
    {
      userId: bob._id,
      items: [],
    },
  ]);

  console.log('Database seeded successfully:');
  console.log(`- ${users.length} Users (1 admin: admin@example.com, 3 customers)`);
  console.log(`- ${categories.length} Categories`);
  console.log(`- ${products.length} Products`);
  console.log(`- ${coupons.length} Coupons`);
  console.log(`- ${orders.length} Sample Orders`);
}

// If executed directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      // Clear before seeding
      await Promise.all([
        User.deleteMany({}),
        Category.deleteMany({}),
        Product.deleteMany({}),
        Coupon.deleteMany({}),
        Order.deleteMany({}),
        Review.deleteMany({}),
        Cart.deleteMany({}),
      ]);
      await seedData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('Seed Error:', err);
      process.exit(1);
    }
  })();
}
