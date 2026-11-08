/**
 * ShopNest Platform Constants
 */
export declare const SPARK_LIMITS: {
    readonly DAILY_READS: 50000;
    readonly DAILY_WRITES: 20000;
    readonly DAILY_DELETES: 20000;
    readonly STORAGE_BYTES: number;
    readonly MAX_TRANSACTION_WRITES: 500;
    readonly SIMULTANEOUS_CONNECTIONS: 100;
};
export declare const QUOTA_ALERT_THRESHOLDS: {
    readonly WARNING: 0.7;
    readonly CRITICAL: 0.9;
};
export declare const FIREBASE_MODES: {
    readonly SHARED: "shared";
    readonly DEDICATED: "dedicated";
};
export declare const PLAN_MODES: {
    readonly SPARK: "spark";
    readonly BLAZE: "blaze";
};
export declare const USER_ROLES: {
    readonly SUPER_ADMIN: "superadmin";
    readonly SUPPORT: "support";
    readonly TENANT_OWNER: "owner";
    readonly TENANT_MANAGER: "manager";
    readonly TENANT_STAFF: "staff";
    readonly CUSTOMER: "customer";
};
export declare const ORDER_STATUSES: {
    readonly PENDING: "pending";
    readonly PROCESSING: "processing";
    readonly SHIPPED: "shipped";
    readonly DELIVERED: "delivered";
    readonly CANCELLED: "cancelled";
    readonly REFUNDED: "refunded";
};
export declare const PAYMENT_STATUSES: {
    readonly UNPAID: "unpaid";
    readonly PAID: "paid";
    readonly REFUNDED: "refunded";
    readonly FAILED: "failed";
};
export declare const PAYMENT_METHODS: {
    readonly COD: "cod";
    readonly BKASH: "bkash";
    readonly NAGAD: "nagad";
    readonly SSLCOMMERZ: "sslcommerz";
    readonly MANUAL: "manual";
};
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
//# sourceMappingURL=index.d.ts.map