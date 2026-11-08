import { FIREBASE_MODES, PLAN_MODES, USER_ROLES, ORDER_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS } from '../constants/index.js';
export type FirebaseMode = (typeof FIREBASE_MODES)[keyof typeof FIREBASE_MODES];
export type PlanMode = (typeof PLAN_MODES)[keyof typeof PLAN_MODES];
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export interface FirebaseWebConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
}
export interface TenantQuotaMetrics {
    date: string;
    firestoreReads: number;
    firestoreWrites: number;
    firestoreDeletes: number;
    estimatedStorageBytes: number;
    lastResetAt: string;
}
export interface Tenant {
    id: string;
    name: string;
    nameBn?: string;
    slug: string;
    customDomains: string[];
    firebaseMode: FirebaseMode;
    planMode: PlanMode;
    saasPlanId: string;
    status: 'active' | 'suspended' | 'trial';
    ownerUid: string;
    ownerEmail: string;
    ownerPhone?: string;
    dedicatedFirebaseConfig?: FirebaseWebConfig;
    encryptedCredentialsKey?: string;
    quotaMetrics: TenantQuotaMetrics;
    features: {
        customDomainAllowed: boolean;
        bulkExportAllowed: boolean;
        dedicatedFirebaseAllowed: boolean;
        prioritySupport: boolean;
    };
    createdAt: string;
    updatedAt: string;
}
export interface DomainRecord {
    hostname: string;
    tenantId: string;
    isCustom: boolean;
    sslStatus: 'pending_validation' | 'active' | 'failed' | 'deleted';
    cloudflareHostnameId?: string;
    verificationToken?: string;
    dnsCnameTarget?: string;
    createdAt: string;
    updatedAt: string;
}
export interface SaaSPlan {
    id: string;
    name: string;
    nameBn: string;
    description: string;
    descriptionBn: string;
    priceMonthly: number;
    priceYearly: number;
    limits: {
        maxProducts: number;
        maxStaff: number;
        storageLimitMb: number;
        dailyReadLimit: number;
        dailyWriteLimit: number;
    };
    features: string[];
    isPublic: boolean;
    createdAt: string;
}
export interface AuditLog {
    id: string;
    actorId: string;
    actorEmail: string;
    actorRole: UserRole;
    action: string;
    targetTenantId?: string;
    targetEntity?: string;
    targetId?: string;
    ip?: string;
    userAgent?: string;
    details: Record<string, unknown>;
    timestamp: string;
}
export interface BackupScheduleConfig {
    tenantId: string;
    scheduleType: 'manual' | 'hourly' | 'daily' | 'weekly';
    scheduleTimeDhaka?: string;
    retentionDays: number;
    retentionMaxCount: number;
    autoDeleteOld: boolean;
    lastBackupAt?: string;
    nextBackupAt?: string;
    status: 'idle' | 'running' | 'failed';
    driveFolderId?: string;
    updatedAt: string;
}
export interface BackupRecord {
    id: string;
    tenantId: string;
    fileName: string;
    driveFileId: string;
    sizeBytes: number;
    documentCount: number;
    format: 'json.gz' | 'json';
    status: 'completed' | 'failed' | 'in_progress';
    error?: string;
    startedAt: string;
    completedAt?: string;
}
export interface ProductVariant {
    id: string;
    sku: string;
    name: string;
    attributes: Record<string, string>;
    price: number;
    compareAtPrice?: number;
    stock: number;
    image?: string;
}
export interface ProductImage {
    id: string;
    url: string;
    publicId: string;
    blurDataUrl?: string;
    alt: string;
    altBn?: string;
    isPrimary: boolean;
    displayOrder: number;
}
export interface ProductSEO {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
    canonicalUrl?: string;
}
export interface Product {
    id: string;
    tenantId: string;
    name: string;
    nameBn?: string;
    slug: string;
    sku: string;
    description: string;
    descriptionBn?: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    stock: number;
    trackStock: boolean;
    lowStockThreshold: number;
    status: 'draft' | 'published';
    categoryIds: string[];
    tags: string[];
    variants: ProductVariant[];
    images: ProductImage[];
    seo: ProductSEO;
    searchTokens: string[];
    stats: {
        views: number;
        ordersCount: number;
        salesAmount: number;
    };
    createdAt: string;
    updatedAt: string;
}
export interface Category {
    id: string;
    tenantId: string;
    name: string;
    nameBn?: string;
    slug: string;
    description?: string;
    descriptionBn?: string;
    image?: string;
    parentId?: string | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface OrderCustomerInfo {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
}
export interface OrderShippingAddress {
    address: string;
    city: string;
    district: string;
    postalCode?: string;
}
export interface OrderItem {
    productId: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    sku: string;
    price: number;
    quantity: number;
    total: number;
    image?: string;
}
export interface OrderTimelineEntry {
    status: OrderStatus;
    note: string;
    noteBn?: string;
    actorId?: string;
    timestamp: string;
}
export interface OrderCourierDetails {
    provider: 'steadfast' | 'pathao' | 'redx' | 'manual';
    consignmentId?: string;
    trackingCode?: string;
    trackingUrl?: string;
    status?: string;
    lastSyncAt?: string;
}
export interface Order {
    id: string;
    tenantId: string;
    orderNumber: string;
    customer: OrderCustomerInfo;
    shippingAddress: OrderShippingAddress;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    couponCode?: string;
    shippingFee: number;
    total: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentTransactionId?: string;
    courierDetails?: OrderCourierDetails;
    timeline: OrderTimelineEntry[];
    customerUid?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Customer {
    id: string;
    tenantId: string;
    name: string;
    phone: string;
    email?: string;
    addresses: OrderShippingAddress[];
    totalOrders: number;
    totalSpent: number;
    lastOrderAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface InventoryLog {
    id: string;
    tenantId: string;
    productId: string;
    variantId?: string;
    changeQty: number;
    previousStock: number;
    newStock: number;
    reason: 'purchase' | 'manual_restock' | 'cancellation_restock' | 'damage';
    orderId?: string;
    actorId?: string;
    timestamp: string;
}
export interface StoreGeneralSettings {
    storeName: string;
    storeNameBn?: string;
    phone: string;
    email: string;
    currency: 'BDT' | 'USD';
    currencySymbol: string;
    logoUrl?: string;
    faviconUrl?: string;
    address?: string;
    addressBn?: string;
}
export interface StoreThemeSettings {
    primaryColor: string;
    accentColor: string;
    font: 'Hind Siliguri' | 'Tiro Bangla' | 'Inter';
    headerStyle: 'standard' | 'centered' | 'minimal';
    footerText?: string;
    footerTextBn?: string;
    heroBanners: {
        imageUrl: string;
        title?: string;
        subtitle?: string;
        linkUrl?: string;
    }[];
}
export interface StorePaymentSettings {
    codEnabled: boolean;
    codInstructions?: string;
    bkashEnabled: boolean;
    bkashMerchantNumber?: string;
    bkashType?: 'merchant' | 'personal';
    nagadEnabled: boolean;
    nagadMerchantNumber?: string;
    sslcommerzEnabled: boolean;
}
export interface StoreShippingSettings {
    insideDhakaFee: number;
    outsideDhakaFee: number;
    freeShippingMinAmount?: number;
    courierProvider?: 'steadfast' | 'pathao' | 'redx' | 'manual';
}
export interface StoreSeoSettings {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    defaultOgImage?: string;
    googleSearchConsoleId?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
}
export interface StoreSettings {
    general: StoreGeneralSettings;
    theme: StoreThemeSettings;
    payment: StorePaymentSettings;
    shipping: StoreShippingSettings;
    seo: StoreSeoSettings;
}
export interface TenantUser {
    uid: string;
    tenantId: string;
    email: string;
    displayName: string;
    role: UserRole;
    status: 'active' | 'suspended';
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=index.d.ts.map