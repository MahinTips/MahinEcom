import { TenantQuotaMetrics } from '../types/index.js';
import { QuotaAlert } from './IDataAdapter.js';
export declare class QuotaTracker {
    readonly tenantId: string;
    private metrics;
    private alertListeners;
    private lastAlertState;
    constructor(tenantId: string, initialMetrics?: Partial<TenantQuotaMetrics>);
    private checkDateRollover;
    recordReads(count?: number): void;
    recordWrites(count?: number): void;
    recordDeletes(count?: number): void;
    recordStorage(bytes: number): void;
    private evaluateQuota;
    getMetrics(): TenantQuotaMetrics;
    addAlertListener(callback: (alert: QuotaAlert) => void): void;
    removeAlertListener(callback: (alert: QuotaAlert) => void): void;
}
//# sourceMappingURL=QuotaTracker.d.ts.map