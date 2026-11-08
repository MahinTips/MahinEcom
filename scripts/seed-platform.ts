/**
 * ShopNest Platform Database Seeder
 * Seeds platform master collections and initial demo tenants
 */

import { MockDataAdapter } from '../packages/shared/src/data-adapter/MockDataAdapter.js';
import {
  SaaSPlan,
  Tenant,
  DomainRecord,
  Product,
  Category,
  StoreSettings,
  BackupScheduleConfig,
} from '../packages/shared/src/types/index.js';

export async function seedPlatformDatabase(adapter: MockDataAdapter) {
  console.log('🌱 Starting ShopNest Platform Database Seeding...');

  // 1. Seed SaaS Plans
  const plans: SaaSPlan[] = [
    {
      id: 'free',
      name: 'Starter (Spark)',
      nameBn: 'স্টার্টার (ফ্রি)',
      description: 'Ideal for testing and small boutique shops with up to 50 products',
      descriptionBn: 'ছোট অনলাইন শপ এবং টেস্টিংয়ের জন্য উপযুক্ত',
      priceMonthly: 0,
      priceYearly: 0,
      limits: {
        maxProducts: 50,
        maxStaff: 1,
        storageLimitMb: 1024,
        dailyReadLimit: 10_000,
        dailyWriteLimit: 5_000,
      },
      features: ['Wildcard Subdomain', 'Cash on Delivery', 'Mobile Responsive Store', 'Basic Analytics'],
      isPublic: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pro',
      name: 'Pro Merchant',
      nameBn: 'প্রো মার্চেন্ট',
      description: 'Unlimited products, custom domains, bKash/Nagad integration & automated backups',
      descriptionBn: 'কাস্টম ডোমেইন, অনলাইন পেমেন্ট ও অটোমেটিক ব্যাকআপ সহ সেরা প্যাকেজ',
      priceMonthly: 1499,
      priceYearly: 14990,
      limits: {
        maxProducts: -1, // Unlimited
        maxStaff: 5,
        storageLimitMb: 10240,
        dailyReadLimit: 50_000,
        dailyWriteLimit: 20_000,
      },
      features: [
        'Custom Domain + Auto SSL',
        'Unlimited Products & Variants',
        'bKash, Nagad, SSLCOMMERZ Gateways',
        'Automated Daily Google Drive Backup',
        'Steadfast/Pathao Courier Integration',
        'Advanced SEO & Facebook Pixel',
      ],
      isPublic: true,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const plan of plans) {
    await adapter.set('saasPlans', plan.id, plan);
  }
  console.log(`✅ Seeded ${plans.length} SaaS Plans`);

  // 2. Seed Tenants
  const tenant1: Tenant = {
    id: 'artisan-bd',
    name: 'Artisan Bangladesh',
    nameBn: 'আর্টিসান বাংলাদেশ',
    slug: 'artisan-bd',
    customDomains: ['artisan.com.bd'],
    firebaseMode: 'shared',
    planMode: 'spark',
    saasPlanId: 'pro',
    status: 'active',
    ownerUid: 'user-artisan-owner',
    ownerEmail: 'owner@artisanbd.com',
    ownerPhone: '01711000001',
    quotaMetrics: {
      date: new Date().toISOString().split('T')[0],
      firestoreReads: 1250,
      firestoreWrites: 420,
      firestoreDeletes: 10,
      estimatedStorageBytes: 15 * 1024 * 1024,
      lastResetAt: new Date().toISOString(),
    },
    features: {
      customDomainAllowed: true,
      bulkExportAllowed: true,
      dedicatedFirebaseAllowed: false,
      prioritySupport: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await adapter.set('tenants', tenant1.id, tenant1);
  console.log(`✅ Seeded Tenant: ${tenant1.name} (Shared Spark Mode)`);

  // 3. Seed Domains
  const domains: DomainRecord[] = [
    {
      hostname: 'artisan-bd.shopnest.com',
      tenantId: 'artisan-bd',
      isCustom: false,
      sslStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      hostname: 'artisan.com.bd',
      tenantId: 'artisan-bd',
      isCustom: true,
      sslStatus: 'active',
      cloudflareHostnameId: 'cf-host-12345',
      dnsCnameTarget: 'custom.shopnest.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const domain of domains) {
    await adapter.set('domains', domain.hostname, domain);
  }
  console.log(`✅ Seeded ${domains.length} Domain mappings`);

  // 4. Seed Categories for Tenant artisan-bd
  const categories: Category[] = [
    {
      id: 'cat-textiles',
      tenantId: 'artisan-bd',
      name: 'Handloom & Textiles',
      nameBn: 'হ্যান্ডলুম ও বস্ত্র',
      slug: 'handloom-textiles',
      description: 'Authentic Bangladeshi handcrafted sarees and apparel',
      displayOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat-pottery',
      tenantId: 'artisan-bd',
      name: 'Clay & Pottery',
      nameBn: 'মৃৎশিল্প ও শোপিস',
      slug: 'clay-pottery',
      description: 'Traditional terracotta craft items',
      displayOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const cat of categories) {
    await adapter.set(`tenants/artisan-bd/categories`, cat.id, cat);
  }
  console.log(`✅ Seeded ${categories.length} Categories for artisan-bd`);

  // 5. Seed Sample Products with Bengali typography and Cloudinary attributes
  const products: Product[] = [
    {
      id: 'prod-jamdani-01',
      tenantId: 'artisan-bd',
      name: 'Handwoven Dhakai Jamdani Saree - Royal Blue',
      nameBn: 'হাতে বোনা ঢাকাই জামদানি শাড়ি - রয়েল ব্লু',
      slug: 'handwoven-dhakai-jamdani-saree-royal-blue',
      sku: 'JAM-RB-001',
      description: 'Traditional Dhakai Jamdani handcrafted by master weavers of Rupganj with 84 count cotton yarn.',
      descriptionBn: 'রূপগঞ্জের দক্ষ কারিগরদের হাতে বোনা ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি। প্রিমিয়াম ৮৪ কাউন্ট সুতা।',
      price: 6500,
      compareAtPrice: 7500,
      costPrice: 4500,
      stock: 12,
      trackStock: true,
      lowStockThreshold: 3,
      status: 'published',
      categoryIds: ['cat-textiles'],
      tags: ['jamdani', 'saree', 'traditional', 'handloom', 'eid-collection'],
      variants: [
        {
          id: 'var-1',
          sku: 'JAM-RB-001-STD',
          name: 'Standard (১২ হাত)',
          attributes: { Size: 'Standard' },
          price: 6500,
          compareAtPrice: 7500,
          stock: 12,
        },
      ],
      images: [
        {
          id: 'img-1',
          url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          publicId: 'shopnest/tenants/artisan-bd/products/jamdani-blue-main',
          blurDataUrl: 'data:image/svg+xml;base64,PHN2Zw...',
          alt: 'Dhakai Jamdani Saree in Royal Blue',
          altBn: 'রয়েল ব্লু ঢাকাই জামদানি শাড়ি',
          isPrimary: true,
          displayOrder: 0,
        },
      ],
      seo: {
        metaTitle: 'Dhakai Jamdani Saree Royal Blue | Artisan Bangladesh',
        metaDescription: 'Buy authentic Dhakai Jamdani saree directly from master weavers. Fast delivery across Bangladesh.',
        keywords: ['jamdani saree', 'bangladeshi saree', 'ঢাকাই জামদানি'],
      },
      searchTokens: ['dhakai', 'jamdani', 'saree', 'royal', 'blue', 'জামদানি', 'শাড়ি'],
      stats: {
        views: 284,
        ordersCount: 8,
        salesAmount: 52000,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-terracotta-vase',
      tenantId: 'artisan-bd',
      name: 'Handcrafted Terracotta Decorative Vase',
      nameBn: 'হস্তশিল্পের মাটির ফুলদানি (টেরাকোটা)',
      slug: 'handcrafted-terracotta-decorative-vase',
      sku: 'POT-TV-002',
      description: 'Eco-friendly natural clay terracotta vase baked with traditional kiln finish.',
      descriptionBn: 'প্রাকৃতিক মাটি দিয়ে তৈরি নিখুঁত টেরাকোটা শোপিস ও ফুলদানি।',
      price: 850,
      compareAtPrice: 990,
      costPrice: 400,
      stock: 25,
      trackStock: true,
      lowStockThreshold: 5,
      status: 'published',
      categoryIds: ['cat-pottery'],
      tags: ['pottery', 'terracotta', 'vase', 'home-decor'],
      variants: [],
      images: [
        {
          id: 'img-2',
          url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
          publicId: 'shopnest/tenants/artisan-bd/products/terracotta-vase-1',
          alt: 'Terracotta Decorative Vase',
          altBn: 'টেরাকোটা মাটির ফুলদানি',
          isPrimary: true,
          displayOrder: 0,
        },
      ],
      seo: {
        metaTitle: 'Handcrafted Terracotta Decorative Vase | Artisan Bangladesh',
        metaDescription: 'Exquisite terracotta vase for modern home decor.',
        keywords: ['terracotta', 'vase', 'মাটির ফুলদানি'],
      },
      searchTokens: ['terracotta', 'vase', 'clay', 'pottery', 'ফুলদানি', 'মাটি'],
      stats: {
        views: 142,
        ordersCount: 15,
        salesAmount: 12750,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const prod of products) {
    await adapter.set('tenants/artisan-bd/products', prod.id, prod);
  }
  console.log(`✅ Seeded ${products.length} Products for artisan-bd`);

  // 6. Seed Store Settings
  const storeSettings: StoreSettings = {
    general: {
      storeName: 'Artisan Bangladesh',
      storeNameBn: 'আর্টিসান বাংলাদেশ',
      phone: '01711000001',
      email: 'contact@artisanbd.com',
      currency: 'BDT',
      currencySymbol: '৳',
      address: 'House 42, Road 11, Banani, Dhaka-1213',
      addressBn: 'বাড়ি ৪২, রোড ১১, বনানী, ঢাকা-১২১৩',
    },
    theme: {
      primaryColor: '#B45309', // Warm amber / terracotta
      accentColor: '#D97706',
      font: 'Hind Siliguri',
      headerStyle: 'standard',
      footerText: '© 2026 Artisan Bangladesh. Crafted with ShopNest.',
      footerTextBn: '© ২০২৬ আর্টিসান বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।',
      heroBanners: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
          title: 'বাংলার নিখুঁত হস্তশিল্প সম্ভার',
          subtitle: 'সরাসরি কারিগরদের থেকে সংগৃহীত খাঁটি জামদানি ও মৃৎশিল্প',
          linkUrl: '/category/handloom-textiles',
        },
      ],
    },
    payment: {
      codEnabled: true,
      codInstructions: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। ঢাকার মধ্যে ডেলিভারি চার্জ ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।',
      bkashEnabled: true,
      bkashMerchantNumber: '01711000001',
      bkashType: 'merchant',
      nagadEnabled: true,
      nagadMerchantNumber: '01711000001',
      sslcommerzEnabled: false,
    },
    shipping: {
      insideDhakaFee: 60,
      outsideDhakaFee: 120,
      freeShippingMinAmount: 3000,
      courierProvider: 'steadfast',
    },
    seo: {
      defaultMetaTitle: 'Artisan Bangladesh — Traditional Handloom & Terracotta',
      defaultMetaDescription: 'Shop handcrafted sarees, terracotta crafts, and heritage Bengali arts with home delivery across Bangladesh.',
    },
  };

  await adapter.set('tenants/artisan-bd/settings', 'general', storeSettings.general);
  await adapter.set('tenants/artisan-bd/settings', 'theme', storeSettings.theme);
  await adapter.set('tenants/artisan-bd/settings', 'payment', storeSettings.payment);
  await adapter.set('tenants/artisan-bd/settings', 'shipping', storeSettings.shipping);
  await adapter.set('tenants/artisan-bd/settings', 'seo', storeSettings.seo);
  console.log('✅ Seeded Store Settings (General, Theme, Payment, Shipping, SEO)');

  // 7. Seed Backup Schedule Configuration
  const backupConfig: BackupScheduleConfig = {
    tenantId: 'artisan-bd',
    scheduleType: 'daily',
    scheduleTimeDhaka: '03:30', // 3:30 AM Asia/Dhaka
    retentionDays: 30,
    retentionMaxCount: 15,
    autoDeleteOld: true,
    lastBackupAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    nextBackupAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    status: 'idle',
    updatedAt: new Date().toISOString(),
  };

  await adapter.set('backupConfigs', backupConfig.tenantId, backupConfig);
  console.log('✅ Seeded Backup Configuration');

  console.log('✨ ShopNest Platform Database Seeding Completed Successfully!\n');
}

