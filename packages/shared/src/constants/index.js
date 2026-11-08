/**
 * ShopNest Platform Constants
 */
export const SPARK_LIMITS = {
    DAILY_READS: 50_000,
    DAILY_WRITES: 20_000,
    DAILY_DELETES: 20_000,
    STORAGE_BYTES: 1 * 1024 * 1024 * 1024, // 1 GiB
    MAX_TRANSACTION_WRITES: 500,
    SIMULTANEOUS_CONNECTIONS: 100,
};
export const QUOTA_ALERT_THRESHOLDS = {
    WARNING: 0.70, // 70% of Spark limit
    CRITICAL: 0.90, // 90% of Spark limit
};
export const FIREBASE_MODES = {
    SHARED: 'shared',
    DEDICATED: 'dedicated',
};
export const PLAN_MODES = {
    SPARK: 'spark',
    BLAZE: 'blaze',
};
export const USER_ROLES = {
    SUPER_ADMIN: 'superadmin',
    SUPPORT: 'support',
    TENANT_OWNER: 'owner',
    TENANT_MANAGER: 'manager',
    TENANT_STAFF: 'staff',
    CUSTOMER: 'customer',
};
export const ORDER_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
};
export const PAYMENT_STATUSES = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    REFUNDED: 'refunded',
    FAILED: 'failed',
};
export const PAYMENT_METHODS = {
    COD: 'cod',
    BKASH: 'bkash',
    NAGAD: 'nagad',
    SSLCOMMERZ: 'sslcommerz',
    MANUAL: 'manual',
};
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
//# sourceMappingURL=index.js.map