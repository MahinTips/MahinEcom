import { SPARK_LIMITS, QUOTA_ALERT_THRESHOLDS } from '../constants/index.js';
import { TenantQuotaMetrics } from '../types/index.js';
import { QuotaAlert } from './IDataAdapter.js';

export class QuotaTracker {
  private metrics: TenantQuotaMetrics;
  private alertListeners: ((alert: QuotaAlert) => void)[] = [];
  private lastAlertState: Record<string, 'none' | 'warning' | 'critical'> = {
    reads: 'none',
    writes: 'none',
    deletes: 'none',
  };

  constructor(
    public readonly tenantId: string,
    initialMetrics?: Partial<TenantQuotaMetrics>
  ) {
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

  private checkDateRollover(): void {
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

  public recordReads(count = 1): void {
    this.checkDateRollover();
    this.metrics.firestoreReads += count;
    this.evaluateQuota('reads', this.metrics.firestoreReads, SPARK_LIMITS.DAILY_READS);
  }

  public recordWrites(count = 1): void {
    this.checkDateRollover();
    this.metrics.firestoreWrites += count;
    this.evaluateQuota('writes', this.metrics.firestoreWrites, SPARK_LIMITS.DAILY_WRITES);
  }

  public recordDeletes(count = 1): void {
    this.checkDateRollover();
    this.metrics.firestoreDeletes += count;
    this.evaluateQuota('deletes', this.metrics.firestoreDeletes, SPARK_LIMITS.DAILY_DELETES);
  }

  public recordStorage(bytes: number): void {
    this.metrics.estimatedStorageBytes = Math.max(0, this.metrics.estimatedStorageBytes + bytes);
  }

  private evaluateQuota(metric: 'reads' | 'writes' | 'deletes', usage: number, limit: number): void {
    const ratio = usage / limit;
    let level: 'none' | 'warning' | 'critical' | 'exceeded' = 'none';

    if (ratio >= 1.0) {
      level = 'exceeded';
    } else if (ratio >= QUOTA_ALERT_THRESHOLDS.CRITICAL) {
      level = 'critical';
    } else if (ratio >= QUOTA_ALERT_THRESHOLDS.WARNING) {
      level = 'warning';
    }

    if (level !== 'none' && level !== this.lastAlertState[metric]) {
      this.lastAlertState[metric] = level === 'exceeded' ? 'critical' : level;
      const percentage = Math.round(ratio * 100);

      const alert: QuotaAlert = {
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
        } catch (err) {
          console.error('[QuotaTracker] Error in alert listener:', err);
        }
      }
    }
  }

  public getMetrics(): TenantQuotaMetrics {
    this.checkDateRollover();
    return { ...this.metrics };
  }

  public addAlertListener(callback: (alert: QuotaAlert) => void): void {
    this.alertListeners.push(callback);
  }

  public removeAlertListener(callback: (alert: QuotaAlert) => void): void {
    this.alertListeners = this.alertListeners.filter((cb) => cb !== callback);
  }
}

