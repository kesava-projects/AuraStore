import { z } from 'zod';

const booleanCoerce = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'on') return true;
    if (s === 'false' || s === '0' || s === 'off') return false;
  }
  return val;
}, z.boolean());

const compareAtPriceSchema = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (val === '' || val === null) return null;
  return Number(val);
}, z.number().min(0, 'Compare-at price must be positive').nullable().optional());

const imagesSchema = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return val;
}, z.array(z.string()).optional().default([]));

const attributesSchema = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }
  return val;
}, z.record(z.string()).optional().default({}));

export const productCreateSchema = z.object({
  title: z.string().trim().min(2, 'Title is required'),
  slug: z.string().trim().min(2).optional(),
  description: z.string().trim().min(5, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  compareAtPrice: compareAtPriceSchema,
  categoryId: z.string().min(1, 'Category is required'),
  images: imagesSchema,
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().trim().min(2, 'SKU is required').toUpperCase(),
  attributes: attributesSchema,
  isActive: booleanCoerce.default(true),
});

export const productUpdateSchema = productCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Category name is required'),
  slug: z.string().trim().min(2).optional(),
  parentId: z.string().optional().nullable(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const couponCreateSchema = z.object({
  code: z.string().trim().min(2, 'Code is required').toUpperCase(),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().min(0.01, 'Value must be greater than 0'),
  minOrder: z.coerce.number().min(0).optional().default(0),
  maxUses: z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === '' || val === null) return null;
    return Number(val);
  }, z.number().int().min(1).optional().nullable()),
  expiresAt: z.coerce.date(),
  isActive: booleanCoerce.default(true),
});

export const couponUpdateSchema = couponCreateSchema.partial();

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['placed', 'packed', 'shipped', 'delivered', 'cancelled']),
  note: z.string().trim().optional().default(''),
});
