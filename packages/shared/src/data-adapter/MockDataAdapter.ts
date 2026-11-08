import {
  IDataAdapter,
  QueryDefinition,
  PaginatedQueryDefinition,
  PaginatedResult,
  ReadOptions,
  WriteOptions,
  BatchOperation,
  ITransaction,
  QuotaAlert,
} from './IDataAdapter.js';
import { QuotaTracker } from './QuotaTracker.js';
import { TenantQuotaMetrics } from '../types/index.js';

export class MockDataAdapter implements IDataAdapter {
  private store: Map<string, Map<string, Record<string, unknown>>> = new Map();
  private quotaTracker: QuotaTracker;

  constructor(
    public readonly tenantId: string,
    public readonly isBlaze: boolean = false,
    initialData?: Record<string, Record<string, Record<string, unknown>>>
  ) {
    this.quotaTracker = new QuotaTracker(tenantId);
    if (initialData) {
      for (const [col, docs] of Object.entries(initialData)) {
        const colMap = new Map<string, Record<string, unknown>>();
        for (const [id, data] of Object.entries(docs)) {
          colMap.set(id, { ...data, id });
        }
        this.store.set(col, colMap);
      }
    }
  }

  private getCollectionMap(collection: string): Map<string, Record<string, unknown>> {
    let col = this.store.get(collection);
    if (!col) {
      col = new Map();
      this.store.set(collection, col);
    }
    return col;
  }

  async get<T>(collection: string, id: string, _options?: ReadOptions): Promise<T | null> {
    this.quotaTracker.recordReads(1);
    const col = this.getCollectionMap(collection);
    const data = col.get(id);
    return data ? (structuredClone(data) as T) : null;
  }

  async set<T>(collection: string, id: string, data: T, options?: WriteOptions): Promise<void> {
    this.quotaTracker.recordWrites(1);
    const col = this.getCollectionMap(collection);
    const current = col.get(id) || {};
    const toSave = options?.merge
      ? { ...current, ...(data as Record<string, unknown>), id }
      : { ...(data as Record<string, unknown>), id };
    col.set(id, structuredClone(toSave));
  }

  async update<T>(collection: string, id: string, data: Partial<T>, _options?: WriteOptions): Promise<void> {
    this.quotaTracker.recordWrites(1);
    const col = this.getCollectionMap(collection);
    const current = col.get(id);
    if (!current) {
      throw new Error(`Document ${collection}/${id} does not exist to update.`);
    }
    const updated = { ...current, ...data, id };
    col.set(id, structuredClone(updated));
  }

  async delete(collection: string, id: string, _options?: WriteOptions): Promise<void> {
    this.quotaTracker.recordDeletes(1);
    const col = this.getCollectionMap(collection);
    col.delete(id);
  }

  async query<T>(collection: string, queryDef?: QueryDefinition): Promise<T[]> {
    const col = this.getCollectionMap(collection);
    let items = Array.from(col.values());

    if (queryDef?.filters && queryDef.filters.length > 0) {
      items = items.filter((doc) => {
        return queryDef.filters!.every((f) => {
          const val = doc[f.field];
          switch (f.operator) {
            case '==':
              return val === f.value;
            case '!=':
              return val !== f.value;
            case '<':
              return (val as number) < (f.value as number);
            case '<=':
              return (val as number) <= (f.value as number);
            case '>':
              return (val as number) > (f.value as number);
            case '>=':
              return (val as number) >= (f.value as number);
            case 'array-contains':
              return Array.isArray(val) && val.includes(f.value);
            case 'in':
              return Array.isArray(f.value) && f.value.includes(val);
            default:
              return true;
          }
        });
      });
    }

    if (queryDef?.orderBy && queryDef.orderBy.length > 0) {
      items.sort((a, b) => {
        for (const order of queryDef.orderBy!) {
          const valA = a[order.field];
          const valB = b[order.field];
          const dir = order.direction === 'desc' ? -1 : 1;
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
        }
        return 0;
      });
    }

    if (queryDef?.limit && queryDef.limit > 0) {
      items = items.slice(0, queryDef.limit);
    }

    this.quotaTracker.recordReads(items.length || 1); // Firestore counts at least 1 read for empty queries in some pricing, or matched doc count
    return structuredClone(items) as T[];
  }

  async paginate<T>(collection: string, queryDef: PaginatedQueryDefinition): Promise<PaginatedResult<T>> {
    const all = await this.query<T & { id: string }>(collection, {
      filters: queryDef.filters,
      orderBy: queryDef.orderBy || [{ field: 'id', direction: 'asc' }],
    });

    let startIndex = 0;
    if (queryDef.cursor) {
      const idx = all.findIndex((i) => i.id === queryDef.cursor);
      if (idx !== -1) {
        startIndex = idx + 1;
      }
    }

    const sliced = all.slice(startIndex, startIndex + queryDef.limit);
    const hasMore = startIndex + queryDef.limit < all.length;
    const nextCursor = hasMore && sliced.length > 0 ? sliced[sliced.length - 1].id : null;

    return {
      items: sliced as T[],
      nextCursor,
      hasMore,
      totalCount: all.length,
    };
  }

  async count(collection: string, queryDef?: QueryDefinition): Promise<number> {
    // In Spark/Firestore, count() aggregate query charges 1 read per 1,000 index entries (minimum 1 read)
    this.quotaTracker.recordReads(1);
    const results = await this.query(collection, { filters: queryDef?.filters });
    return results.length;
  }

  async runTransaction<R>(updateFunction: (tx: ITransaction) => Promise<R>): Promise<R> {
    const stagedWrites: (() => void)[] = [];
    const tx: ITransaction = {
      get: async <T>(col: string, id: string): Promise<T | null> => {
        return this.get<T>(col, id);
      },
      set: <T>(col: string, id: string, data: T, options?: WriteOptions) => {
        stagedWrites.push(() => this.set(col, id, data, options));
      },
      update: <T>(col: string, id: string, data: Partial<T>) => {
        stagedWrites.push(() => this.update(col, id, data));
      },
      delete: (col: string, id: string) => {
        stagedWrites.push(() => this.delete(col, id));
      },
    };

    const result = await updateFunction(tx);
    for (const write of stagedWrites) {
      write();
    }
    return result;
  }

  async batch(operations: BatchOperation[]): Promise<void> {
    for (const op of operations) {
      switch (op.type) {
        case 'set':
          await this.set(op.collection, op.id, op.data, { merge: op.merge });
          break;
        case 'update':
          await this.update(op.collection, op.id, op.data);
          break;
        case 'delete':
          await this.delete(op.collection, op.id);
          break;
      }
    }
  }

  getQuotaMetrics(): TenantQuotaMetrics {
    return this.quotaTracker.getMetrics();
  }

  onQuotaAlert(callback: (alert: QuotaAlert) => void): void {
    this.quotaTracker.addAlertListener(callback);
  }
}

