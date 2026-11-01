import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { Cart } from '../models/Cart.js';
import { seedData } from './seed.js';

async function resetDb() {
  try {
    console.log('Resetting database...');
    await connectDB();

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
    ]);

    console.log('Re-seeding initial database data...');
    await seedData();

    await disconnectDB();
    console.log('Database reset completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Reset DB Error:', err);
    process.exit(1);
  }
}

resetDb();
