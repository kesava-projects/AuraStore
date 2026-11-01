import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { OrderService } from '../services/orderService.js';
import { processUploadedFile } from '../middlewares/upload.js';

// Helper to generate a slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ---------------- PRODUCTS ----------------
export async function getAdminProducts(req, res, next) {
  try {
    const { page = 1, limit = 20, q, category } = req.query;
    const query = {};

    if (q) {
      query.$or = [{ title: { $regex: q, $options: 'i' } }, { sku: { $regex: q, $options: 'i' } }];
    }
    if (category) {
      query.categoryId = category;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminProduct(req, res, next) {
  try {
    let images = req.body.images || [];
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        images = [images];
      }
    }

    if (req.file) {
      const uploadedUrl = await processUploadedFile(req.file, req);
      if (uploadedUrl) images.unshift(uploadedUrl);
    }

    const slug = req.body.slug || generateSlug(req.body.title);

    // Ensure unique slug
    let finalSlug = slug;
    let count = 1;
    while (await Product.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${count++}`;
    }

    const product = await Product.create({
      ...req.body,
      slug: finalSlug,
      images,
    });

    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminProduct(req, res, next) {
  try {
    const { id } = req.params;
    let images = req.body.images;
    if (images && typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        images = [images];
      }
    }

    if (req.file) {
      const uploadedUrl = await processUploadedFile(req.file, req);
      if (uploadedUrl) {
        images = images ? [uploadedUrl, ...images] : [uploadedUrl];
      }
    }

    const updateData = { ...req.body };
    if (images) updateData.images = images;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },
      });
    }

    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },
      });
    }

    res.json({ message: 'Product deleted successfully', id });
  } catch (err) {
    next(err);
  }
}

// ---------------- CATEGORIES ----------------
export async function getAdminCategories(req, res, next) {
  try {
    const categories = await Category.find().populate('parentId', 'name').sort({ name: 1 }).lean();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function createAdminCategory(req, res, next) {
  try {
    const slug = req.body.slug || generateSlug(req.body.name);
    const category = await Category.create({ ...req.body, slug });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        error: { code: 'CATEGORY_NOT_FOUND', message: 'Category not found' },
      });
    }

    res.json({ category });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        error: { code: 'CATEGORY_NOT_FOUND', message: 'Category not found' },
      });
    }

    res.json({ message: 'Category deleted successfully', id });
  } catch (err) {
    next(err);
  }
}

// ---------------- COUPONS ----------------
export async function getAdminCoupons(req, res, next) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json({ coupons });
  } catch (err) {
    next(err);
  }
}

export async function createAdminCoupon(req, res, next) {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ coupon });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({
        error: { code: 'COUPON_NOT_FOUND', message: 'Coupon not found' },
      });
    }

    res.json({ coupon });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        error: { code: 'COUPON_NOT_FOUND', message: 'Coupon not found' },
      });
    }

    res.json({ message: 'Coupon deleted successfully', id });
  } catch (err) {
    next(err);
  }
}

// ---------------- ORDERS ----------------
export async function getAdminOrders(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await OrderService.updateOrderStatus(id, status, note);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

// ---------------- CUSTOMERS ----------------
export async function getAdminCustomers(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      User.find({ role: 'customer' })
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments({ role: 'customer' }),
    ]);

    // Aggregate order stats per customer
    const userIds = customers.map((c) => c._id);
    const orderStats = await Order.aggregate([
      { $match: { userId: { $in: userIds }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    orderStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const enrichedCustomers = customers.map((c) => ({
      ...c,
      totalSpent: Math.round((statsMap[c._id.toString()]?.totalSpent || 0) * 100) / 100,
      orderCount: statsMap[c._id.toString()]?.orderCount || 0,
    }));

    res.json({
      customers: enrichedCustomers,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (err) {
    next(err);
  }
}

// ---------------- SALES REPORTS ----------------
export async function getAdminSalesReport(req, res, next) {
  try {
    // 1. Overall Metrics
    const paidOrders = await Order.find({ paymentStatus: 'paid' }).lean();
    const totalOrders = paidOrders.length;
    const totalRevenue = Math.round(paidOrders.reduce((sum, o) => sum + o.total, 0) * 100) / 100;
    const averageOrderValue =
      totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

    // 2. Count by Order Status
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Category Sales Breakdown
    const categorySales = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          unitsSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // 4. Recent daily / monthly trend (last 7 orders or days)
    const recentOrders = await Order.find({ paymentStatus: 'paid' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean();

    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
      },
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      categorySales: categorySales.map((c) => ({
        category: c._id,
        totalSales: Math.round(c.totalSales * 100) / 100,
        unitsSold: c.unitsSold,
      })),
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
}
