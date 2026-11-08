import { z } from 'zod';
import { FIREBASE_MODES, PLAN_MODES, PAYMENT_METHODS, } from '../constants/index.js';
export const FirebaseWebConfigSchema = z.object({
    apiKey: z.string().min(1, 'API key is required'),
    authDomain: z.string().min(1, 'Auth domain is required'),
    projectId: z.string().min(1, 'Project ID is required'),
    storageBucket: z.string().optional(),
    messagingSenderId: z.string().optional(),
    appId: z.string().optional(),
});
export const TenantCreateSchema = z.object({
    name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
    nameBn: z.string().optional(),
    slug: z
        .string()
        .min(3, 'স্লাগ কমপক্ষে ৩ অক্ষরের হতে হবে')
        .max(30, 'স্লাগ ৩০ অক্ষরের বেশি হতে পারবে না')
        .regex(/^[a-z0-9-]+$/, 'স্লাগে শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা এবং হাইফেন ব্যবহার করুন'),
    ownerEmail: z.string().email('সঠিক ইমেইল এড্রেস দিন'),
    ownerPhone: z.string().optional(),
    firebaseMode: z.enum([FIREBASE_MODES.SHARED, FIREBASE_MODES.DEDICATED]),
    planMode: z.enum([PLAN_MODES.SPARK, PLAN_MODES.BLAZE]).default(PLAN_MODES.SPARK),
    saasPlanId: z.string().default('basic'),
    dedicatedFirebaseConfig: FirebaseWebConfigSchema.optional(),
});
export const ProductVariantSchema = z.object({
    id: z.string(),
    sku: z.string().min(1, 'SKU আবশ্যক'),
    name: z.string().min(1, 'ভেরিয়েন্টের নাম দিন'),
    attributes: z.record(z.string()),
    price: z.number().min(0, 'মূল্য শূন্য বা তার বেশি হতে হবে'),
    compareAtPrice: z.number().optional(),
    stock: z.number().int().min(0, 'স্টক ঋণাত্মক হতে পারবে না'),
    image: z.string().url().optional(),
});
export const ProductImageSchema = z.object({
    id: z.string(),
    url: z.string().url('সঠিক ছবির URL দিন'),
    publicId: z.string().min(1, 'Cloudinary public_id আবশ্যক'),
    blurDataUrl: z.string().optional(),
    alt: z.string().min(1, 'SEO-র জন্য Alt টেক্সট আবশ্যক'),
    altBn: z.string().optional(),
    isPrimary: z.boolean().default(false),
    displayOrder: z.number().int().default(0),
});
export const ProductSchema = z.object({
    name: z.string().min(2, 'পণ্যের নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
    nameBn: z.string().optional(),
    slug: z
        .string()
        .min(2, 'স্লাগ আবশ্যক')
        .regex(/^[a-z0-9-]+$/, 'স্লাগে শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা এবং হাইফেন ব্যবহার করুন'),
    sku: z.string().min(1, 'SKU আবশ্যক'),
    description: z.string().min(10, 'পণ্যের বিবরণ কমপক্ষে ১০ অক্ষরের হতে হবে'),
    descriptionBn: z.string().optional(),
    price: z.number().positive('পণ্যের মূল্য ০ এর বেশি হতে হবে'),
    compareAtPrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    stock: z.number().int().min(0, 'স্টক ঋণাত্মক হতে পারে না'),
    trackStock: z.boolean().default(true),
    lowStockThreshold: z.number().int().default(5),
    status: z.enum(['draft', 'published']).default('published'),
    categoryIds: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    variants: z.array(ProductVariantSchema).default([]),
    images: z.array(ProductImageSchema).min(1, 'কমপক্ষে একটি পণ্যের ছবি দিতে হবে'),
    seo: z.object({
        metaTitle: z.string().max(70, 'Meta title ৭০ অক্ষরের মধ্যে রাখুন').optional(),
        metaDescription: z.string().max(160, 'Meta description ১৬০ অক্ষরের মধ্যে রাখুন').optional(),
        ogImage: z.string().url().optional(),
        keywords: z.array(z.string()).optional(),
    }).default({}),
});
export const OrderItemSchema = z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    productName: z.string(),
    variantName: z.string().optional(),
    sku: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive('পরিমাণ কমপক্ষে ১ হতে হবে'),
    total: z.number().positive(),
    image: z.string().optional(),
});
export const OrderCheckoutSchema = z.object({
    customer: z.object({
        name: z.string().min(2, 'আপনার নাম দিন'),
        phone: z.string().regex(/^(\+?8801|01)[3-9]\d{8}$/, 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'),
        email: z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
        notes: z.string().optional(),
    }),
    shippingAddress: z.object({
        address: z.string().min(5, 'সম্পূর্ণ ঠিকানা লিখুন'),
        city: z.string().min(2, 'শহর/থানা নির্বাচন করুন'),
        district: z.string().min(2, 'জেলা নির্বাচন করুন'),
        postalCode: z.string().optional(),
    }),
    items: z.array(OrderItemSchema).min(1, 'কার্ট খালি রাখা যাবে না'),
    paymentMethod: z.enum([
        PAYMENT_METHODS.COD,
        PAYMENT_METHODS.BKASH,
        PAYMENT_METHODS.NAGAD,
        PAYMENT_METHODS.SSLCOMMERZ,
    ]),
});
export const StoreSettingsSchema = z.object({
    general: z.object({
        storeName: z.string().min(1, 'দোকানের নাম আবশ্যক'),
        storeNameBn: z.string().optional(),
        phone: z.string().min(11, 'সঠিক ফোন নম্বর দিন'),
        email: z.string().email('সঠিক ইমেইল দিন'),
        currency: z.enum(['BDT', 'USD']).default('BDT'),
        currencySymbol: z.string().default('৳'),
        logoUrl: z.string().url().optional(),
        faviconUrl: z.string().url().optional(),
        address: z.string().optional(),
        addressBn: z.string().optional(),
    }),
    theme: z.object({
        primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'সঠিক HEX কালার কোড দিন'),
        accentColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'সঠিক HEX কালার কোড দিন'),
        font: z.enum(['Hind Siliguri', 'Tiro Bangla', 'Inter']).default('Hind Siliguri'),
        headerStyle: z.enum(['standard', 'centered', 'minimal']).default('standard'),
        footerText: z.string().optional(),
        footerTextBn: z.string().optional(),
        heroBanners: z.array(z.object({
            imageUrl: z.string().url(),
            title: z.string().optional(),
            subtitle: z.string().optional(),
            linkUrl: z.string().optional(),
        })).default([]),
    }),
    payment: z.object({
        codEnabled: z.boolean().default(true),
        codInstructions: z.string().optional(),
        bkashEnabled: z.boolean().default(false),
        bkashMerchantNumber: z.string().optional(),
        bkashType: z.enum(['merchant', 'personal']).optional(),
        nagadEnabled: z.boolean().default(false),
        nagadMerchantNumber: z.string().optional(),
        sslcommerzEnabled: z.boolean().default(false),
    }),
    shipping: z.object({
        insideDhakaFee: z.number().min(0).default(60),
        outsideDhakaFee: z.number().min(0).default(120),
        freeShippingMinAmount: z.number().optional(),
        courierProvider: z.enum(['steadfast', 'pathao', 'redx', 'manual']).default('manual'),
    }),
    seo: z.object({
        defaultMetaTitle: z.string().min(1),
        defaultMetaDescription: z.string().min(1),
        defaultOgImage: z.string().url().optional(),
        googleSearchConsoleId: z.string().optional(),
        googleAnalyticsId: z.string().optional(),
        facebookPixelId: z.string().optional(),
    }),
});
//# sourceMappingURL=index.js.map