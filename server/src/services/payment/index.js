import { StripeAdapter } from './stripeAdapter.js';

// Default adapter is Stripe; swap with RazorpayAdapter or other adapters when needed
export const paymentService = new StripeAdapter();
export { PaymentAdapter } from './paymentAdapter.js';
export { StripeAdapter } from './stripeAdapter.js';
