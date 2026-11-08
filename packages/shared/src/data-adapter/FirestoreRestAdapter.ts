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

export interface FirestoreRestConfig {
  projectId: string;
  apiKey?: string;
  authToken?: string; // Bearer token for service account or custom JWT
  databaseId?: string; // Defaults to '(default)'
}

export class FirestoreRestAdapter implements IDataAdapter {
  private baseUrl: string;
  private quotaTracker: QuotaTracker;

  constructor(
    public readonly tenantId: string,
    private readonly config: FirestoreRestConfig,
    public readonly isBlaze: boolean = false
  ) {
    const databaseId = config.databaseId || '(default)';
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents`;
    this.quotaTracker = new QuotaTracker(tenantId);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }
    return headers;
  }

  private getUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}/${path}`);
    if (this.config.apiKey && !this.config.authToken) {
      url.searchParams.set('key', this.config.apiKey);
    }
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }
    return url.toString();
  }

  // --- Firestore Value Encoder / Decoder ---
  public static toFirestoreValue(val: unknown): Record<string, unknown> {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map((v) => FirestoreRestAdapter.toFirestoreValue(v)) } };
    }
    if (typeof val === 'object') {
      const fields: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) {
        fields[k] = FirestoreRestAdapter.toFirestoreValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  public static fromFirestoreValue(val: Record<string, unknown>): unknown {
    if ('stringValue' in val) return val.stringValue;
    if ('integerValue' in val) return parseInt(val.integerValue as string, 10);
    if ('doubleValue' in val) return parseFloat(val.doubleValue as string);
    if ('booleanValue' in val) return val.booleanValue;
    if ('nullValue' in val) return null;
    if ('timestampValue' in val) return val.timestampValue;
    if ('arrayValue' in val) {
      const arr = (val.arrayValue as { values?: Record<string, unknown>[] })?.values || [];
      return arr.map(FirestoreRestAdapter.fromFirestoreValue);
    }
    if ('mapValue' in val) {
      const fields = (val.mapValue as { fields?: Record<string, Record<string, unknown>> })?.fields || {};
      const obj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(fields)) {
        obj[k] = FirestoreRestAdapter.fromFirestoreValue(v);
      }
      return obj;
    }
    return null;
  }

  public static documentToData<T>(doc: Record<string, unknown>): T {
    const fields = (doc.fields as Record<string, Record<string, unknown>>) || {};
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      result[k] = FirestoreRestAdapter.fromFirestoreValue(v);
    }
    if (doc.name) {
      const parts = (doc.name as string).split('/');
      result.id = parts[parts.length - 1];
    }
    return result as T;
  }

  public static dataToFields(data: Record<string, unknown>): Record<string, unknown> {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (k === 'id') continue;
      fields[k] = FirestoreRestAdapter.toFirestoreValue(v);
    }
    return fields;
  }

  async get<T>(collection: string, id: string, _options?: ReadOptions): Promise<T | null> {
    this.quotaTracker.recordReads(1);
    const url = this.getUrl(`${collection}/${id}`);
    const res = await fetch(url, { headers: this.getHeaders() });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Firestore REST get error (${res.status}): ${await res.text()}`);
    }
    const doc = (await res.json()) as Record<string, unknown>;
    return FirestoreRestAdapter.documentToData<T>(doc);
  }

  async set<T>(collection: string, id: string, data: T, options?: WriteOptions): Promise<void> {
    this.quotaTracker.recordWrites(1);
    const fields = FirestoreRestAdapter.dataToFields(data as Record<string, unknown>);
    const params: Record<string, string> = {};
    if (options?.merge) {
      for (const k of Object.keys(data as Record<string, unknown>)) {
        if (k !== 'id') {
          params['updateMask.fieldPaths'] = k;
        }
      }
    }
    const url = this.getUrl(`${collection}/${id}`, params);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      throw new Error(`Firestore REST set error (${res.status}): ${await res.text()}`);
    }
  }

  async update<T>(collection: string, id: string, data: Partial<T>, _options?: WriteOptions): Promise<void> {
    this.quotaTracker.recordWrites(1);
    const fields = FirestoreRestAdapter.dataToFields(data as Record<string, unknown>);
    const url = new URL(this.getUrl(`${collection}/${id}`));
    for (const key of Object.keys(data as Record<string, unknown>)) {
      if (key !== 'id') {
        url.searchParams.append('updateMask.fieldPaths', key);
      }
    }
    const res = await fetch(url.toString(), {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      throw new Error(`Firestore REST update error (${res.status}): ${await res.text()}`);
    }
  }

  async delete(collection: string, id: string, _options?: WriteOptions): Promise<void> {
    this.quotaTracker.recordDeletes(1);
    const url = this.getUrl(`${collection}/${id}`);
    const res = await fetch(url, { method: 'DELETE', headers: this.getHeaders() });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Firestore REST delete error (${res.status}): ${await res.text()}`);
    }
  }

  async query<T>(collection: string, queryDef?: QueryDefinition): Promise<T[]> {
    const runQueryUrl = `${this.baseUrl}:runQuery`;
    const structuredQuery: Record<string, unknown> = {
      from: [{ collectionId: collection.includes('/') ? collection.split('/').pop() : collection }],
    };

    if (queryDef?.limit) {
      structuredQuery.limit = queryDef.limit;
    }

    if (queryDef?.orderBy && queryDef.orderBy.length > 0) {
      structuredQuery.orderBy = queryDef.orderBy.map((ob) => ({
        field: { fieldPath: ob.field },
        direction: ob.direction === 'desc' ? 'DESCENDING' : 'ASCENDING',
      }));
    }

    const res = await fetch(runQueryUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ structuredQuery }),
    });

    if (!res.ok) {
      throw new Error(`Firestore REST query error (${res.status}): ${await res.text()}`);
    }

    const items = (await res.json()) as Array<{ document?: Record<string, unknown> }>;
    const results: T[] = [];
    for (const item of items) {
      if (item.document) {
        results.push(FirestoreRestAdapter.documentToData<T>(item.document));
      }
    }
    this.quotaTracker.recordReads(results.length || 1);
    return results;
  }

  async paginate<T>(collection: string, queryDef: PaginatedQueryDefinition): Promise<PaginatedResult<T>> {
    const items = await this.query<T & { id: string }>(collection, {
      filters: queryDef.filters,
      orderBy: queryDef.orderBy,
      limit: queryDef.limit + 1,
    });

    const hasMore = items.length > queryDef.limit;
    const paginatedItems = hasMore ? items.slice(0, queryDef.limit) : items;
    const nextCursor = hasMore && paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].id : null;

    return {
      items: paginatedItems as T[],
      nextCursor,
      hasMore,
    };
  }

  async count(collection: string, queryDef?: QueryDefinition): Promise<number> {
    // In Spark plan, native runAggregationQuery is available on Firestore REST API v1
    const aggUrl = `${this.baseUrl}:runAggregationQuery`;
    const structuredAggregationQuery = {
      structuredQuery: {
        from: [{ collectionId: collection.includes('/') ? collection.split('/').pop() : collection }],
      },
      aggregations: [
        {
          alias: 'total_count',
          count: {},
        },
      ],
    };

    this.quotaTracker.recordReads(1);
    try {
      const res = await fetch(aggUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ structuredAggregationQuery }),
      });
      if (res.ok) {
        const data = (await res.json()) as Array<{ result?: { aggregateFields?: { total_count?: { integerValue?: string } } } }>;
        const countVal = data[0]?.result?.aggregateFields?.total_count?.integerValue;
        if (countVal !== undefined) {
          return parseInt(countVal, 10);
        }
      }
    } catch {
      // Fallback
    }

    // Fallback count via query
    const results = await this.query(collection, queryDef);
    return results.length;
  }

  async runTransaction<R>(_updateFunction: (tx: ITransaction) => Promise<R>): Promise<R> {
    throw new Error('Firestore REST transactions require beginTransaction/commit. Use batch operations or WebAdapter for transactions.');
  }

  async batch(operations: BatchOperation[]): Promise<void> {
    const commitUrl = `${this.baseUrl}:commit`;
    const writes = operations.map((op) => {
      const docPath = `${this.baseUrl}/${op.collection}/${op.id}`;
      if (op.type === 'delete') {
        return { delete: docPath };
      }
      return {
        update: {
          name: docPath,
          fields: FirestoreRestAdapter.dataToFields(op.data),
        },
      };
    });

    this.quotaTracker.recordWrites(operations.length);
    const res = await fetch(commitUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ writes }),
    });

    if (!res.ok) {
      throw new Error(`Firestore REST batch commit error (${res.status}): ${await res.text()}`);
    }
  }

  getQuotaMetrics(): TenantQuotaMetrics {
    return this.quotaTracker.getMetrics();
  }

  onQuotaAlert(callback: (alert: QuotaAlert) => void): void {
    this.quotaTracker.addAlertListener(callback);
  }
}

