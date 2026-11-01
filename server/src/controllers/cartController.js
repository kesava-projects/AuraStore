import { CartService } from '../services/cartService.js';

export async function getCart(req, res, next) {
  try {
    const cart = await CartService.getCart(req.user._id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function updateCart(req, res, next) {
  try {
    const { items } = req.body;
    const cart = await CartService.updateCart(req.user._id, items);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function mergeCart(req, res, next) {
  try {
    const { items } = req.body;
    const cart = await CartService.mergeGuestCart(req.user._id, items);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}
