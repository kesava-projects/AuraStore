import { Order } from '../models/Order.js';
import { OrderService } from '../services/orderService.js';

export async function getUserOrders(req, res, next) {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Must be owner or admin
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to view this order',
        },
      });
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';
    const order = await OrderService.cancelOrder(id, req.user._id, isAdmin);

    res.json({
      order,
      message: 'Order cancelled successfully. Stock has been returned.',
    });
  } catch (err) {
    next(err);
  }
}
