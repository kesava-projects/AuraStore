import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { OrderService } from '../services/orderService.js';

export async function getAddresses(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json({
      addresses: user?.addresses || [],
    });
  } catch (err) {
    next(err);
  }
}

export async function addAddress(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    const newAddress = req.body;

    // If marked default, unset others
    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    } else if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      addresses: user.addresses,
      address: user.addresses[user.addresses.length - 1],
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found',
        },
      });
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.set(req.body);
    await user.save();

    res.json({
      addresses: user.addresses,
      address,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found',
        },
      });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull({ _id: id });

    // If deleted address was default, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      addresses: user.addresses,
      message: 'Address removed successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    const user = await User.findById(req.user._id);
    const existingIndex = user.wishlist.findIndex((id) => id.toString() === productId);

    let inWishlist = false;
    if (existingIndex > -1) {
      user.wishlist.splice(existingIndex, 1);
      inWishlist = false;
    } else {
      user.wishlist.push(product._id);
      inWishlist = true;
    }

    await user.save();

    res.json({
      inWishlist,
      wishlist: user.wishlist,
      message: inWishlist ? 'Added to wishlist' : 'Removed from wishlist',
    });
  } catch (err) {
    next(err);
  }
}

export async function addProductReview(req, res, next) {
  try {
    const { id: productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // 1. Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    // 2. Business rule: Reviews are allowed only for products the user has received (delivered order)
    const canReview = await OrderService.canUserReviewProduct(userId, productId);
    if (!canReview) {
      return res.status(403).json({
        error: {
          code: 'REVIEW_NOT_PERMITTED',
          message: 'You can only review products from delivered orders that you have received.',
        },
      });
    }

    // 3. Business rule: One review per user per product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(409).json({
        error: {
          code: 'REVIEW_ALREADY_EXISTS',
          message: 'You have already reviewed this product.',
        },
      });
    }

    const review = await Review.create({
      productId,
      userId,
      rating,
      comment,
    });

    // 4. Update product rating average & count
    const allReviews = await Review.find({ productId });
    const count = allReviews.length;
    const avg = count > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    product.ratingCount = count;
    product.ratingAvg = Math.round(avg * 10) / 10;
    await product.save();

    const populatedReview = await Review.findById(review._id).populate('userId', 'name');

    res.status(201).json({
      review: populatedReview,
      productRating: {
        ratingAvg: product.ratingAvg,
        ratingCount: product.ratingCount,
      },
    });
  } catch (err) {
    next(err);
  }
}
