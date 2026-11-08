import { SPARK_LIMITS, QUOTA_ALERT_THRESHOLDS } from '../constants/index.js';
export class QuotaTracker {
    tenantId;
    metrics;
    alertListeners = [];
    lastAlertState = {
        reads: 'none',
        writes: 'none',
        deletes: 'none',
    };
    constructor(tenantId, initialMetrics) {
        this.tenantId = tenantId;
        const today = new Date().toISOString().split('T')[0];
        this.metrics = {
            date: initialMetrics?.date || today,
            firestoreReads: initialMetrics?.firestoreReads || 0,
            firestoreWrites: initialMetrics?.firestoreWrites || 0,
            firestoreDeletes: initialMetrics?.firestoreDeletes || 0,
            estimatedStorageBytes: initialMetrics?.estimatedStorageBytes || 0,
            lastResetAt: initialMetrics?.lastResetAt || new Date().toISOString(),
        };
    }
    checkDateRollover() {
        const today = new Date().toISOString().split('T')[0];
        if (this.metrics.date !== today) {
            this.metrics.date = today;
            this.metrics.firestoreReads = 0;
            this.metrics.firestoreWrites = 0;
            this.metrics.firestoreDeletes = 0;
            this.metrics.lastResetAt = new Date().toISOString();
            this.lastAlertState = { reads: 'none', writes: 'none', deletes: 'none' };
        }
    }
    recordReads(count = 1) {
        this.checkDateRollover();
        this.metrics.firestoreReads += count;
        this.evaluateQuota('reads', this.metrics.firestoreReads, SPARK_LIMITS.DAILY_READS);
    }
    recordWrites(count = 1) {
        this.checkDateRollover();
        this.metrics.firestoreWrites += count;
        this.evaluateQuota('writes', this.metrics.firestoreWrites, SPARK_LIMITS.DAILY_WRITES);
    }
    recordDeletes(count = 1) {
        this.checkDateRollover();
        this.metrics.firestoreDeletes += count;
        this.evaluateQuota('deletes', this.metrics.firestoreDeletes, SPARK_LIMITS.DAILY_DELETES);
    }
    recordStorage(bytes) {
        this.metrics.estimatedStorageBytes = Math.max(0, this.metrics.estimatedStorageBytes + bytes);
    }
    evaluateQuota(metric, usage, limit) {
        const ratio = usage / limit;
        let level = 'none';
        if (ratio >= 1.0) {
            level = 'exceeded';
        }
        else if (ratio >= QUOTA_ALERT_THRESHOLDS.CRITICAL) {
            level = 'critical';
        }
        else if (ratio >= QUOTA_ALERT_THRESHOLDS.WARNING) {
            level = 'warning';
        }
        if (level !== 'none' && level !== this.lastAlertState[metric]) {
            this.lastAlertState[metric] = level === 'exceeded' ? 'critical' : level;
            const percentage = Math.round(ratio * 100);
            const alert = {
                tenantId: this.tenantId,
                level: level === 'exceeded' ? 'exceeded' : level,
                metric,
                currentUsage: usage,
                limit,
                percentage,
                message: `Tenant "${this.tenantId}" has consumed ${percentage}% (${usage}/${limit}) of daily Spark ${metric} quota.`,
                suggestBlaze: ratio >= QUOTA_ALERT_THRESHOLDS.WARNING,
            };
            for (const listener of this.alertListeners) {
                try {
                    listener(alert);
                }
                catch (err) {
                    console.error('[QuotaTracker] Error in alert listener:', err);
                }
            }
        }
    }
    getMetrics() {
        this.checkDateRollover();
        return { ...this.metrics };
    }
    addAlertListener(callback) {
        this.alertListeners.push(callback);
    }
    removeAlertListener(callback) {
        this.alertListeners = this.alertListeners.filter((cb) => cb !== callback);
    }
}
//# sourceMappingURL=QuotaTracker.js.map