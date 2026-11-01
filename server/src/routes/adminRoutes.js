import { Router } from 'express';
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminCustomers,
  getAdminSalesReport,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';
import {
  productCreateSchema,
  productUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  couponCreateSchema,
  couponUpdateSchema,
  orderStatusUpdateSchema,
} from '../validations/adminValidation.js';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireRole('admin'));

// Products
router.get('/products', getAdminProducts);
router.post('/products', upload.single('image'), validate(productCreateSchema), createAdminProduct);
router.put(
  '/products/:id',
  upload.single('image'),
  validate(productUpdateSchema),
  updateAdminProduct
);
router.delete('/products/:id', deleteAdminProduct);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', validate(categoryCreateSchema), createAdminCategory);
router.put('/categories/:id', validate(categoryUpdateSchema), updateAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', validate(couponCreateSchema), createAdminCoupon);
router.put('/coupons/:id', validate(couponUpdateSchema), updateAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);

// Orders
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', validate(orderStatusUpdateSchema), updateAdminOrderStatus);

// Customers
router.get('/customers', getAdminCustomers);

// Sales Reports
router.get('/reports/sales', getAdminSalesReport);

export default router;
