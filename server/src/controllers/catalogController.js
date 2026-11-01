import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Review } from '../models/Review.js';

export async function getProducts(req, res, next) {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      minRating,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Search query: text search or regex fallback
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
    }

    // Category filter: match slug or ObjectId
    if (category && category !== 'all') {
      const catDoc = await Category.findOne({
        $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }],
      });
      if (catDoc) {
        query.categoryId = catDoc._id;
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating !== undefined) {
      query.ratingAvg = { $gte: Number(minRating) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { ratingAvg: -1, ratingCount: -1 };
    else if (sort === 'title') sortOptions = { title: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug')
        .sort(sortOptions)
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
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true })
      .populate('categoryId', 'name slug parentId')
      .lean();

    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with slug "${slug}" not found`,
        },
      });
    }

    // Fetch product reviews populated with user name
    const reviews = await Review.find({ productId: product._id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      product: {
        ...product,
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json({
      categories,
    });
  } catch (err) {
    next(err);
  }
}
