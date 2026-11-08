import { QuotaTracker } from './QuotaTracker.js';
export class FirestoreRestAdapter {
    tenantId;
    config;
    isBlaze;
    baseUrl;
    quotaTracker;
    constructor(tenantId, config, isBlaze = false) {
        this.tenantId = tenantId;
        this.config = config;
        this.isBlaze = isBlaze;
        const databaseId = config.databaseId || '(default)';
        this.baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents`;
        this.quotaTracker = new QuotaTracker(tenantId);
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.config.authToken) {
            headers['Authorization'] = `Bearer ${this.config.authToken}`;
        }
        return headers;
    }
    getUrl(path, params) {
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
    static toFirestoreValue(val) {
        if (val === null || val === undefined)
            return { nullValue: null };
        if (typeof val === 'boolean')
            return { booleanValue: val };
        if (typeof val === 'number') {
            return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
        }
        if (typeof val === 'string')
            return { stringValue: val };
        if (Array.isArray(val)) {
            return { arrayValue: { values: val.map((v) => FirestoreRestAdapter.toFirestoreValue(v)) } };
        }
        if (typeof val === 'object') {
            const fields = {};
            for (const [k, v] of Object.entries(val)) {
                fields[k] = FirestoreRestAdapter.toFirestoreValue(v);
            }
            return { mapValue: { fields } };
        }
        return { stringValue: String(val) };
    }
    static fromFirestoreValue(val) {
        if ('stringValue' in val)
            return val.stringValue;
        if ('integerValue' in val)
            return parseInt(val.integerValue, 10);
        if ('doubleValue' in val)
            return parseFloat(val.doubleValue);
        if ('booleanValue' in val)
            return val.booleanValue;
        if ('nullValue' in val)
            return null;
        if ('timestampValue' in val)
            return val.timestampValue;
        if ('arrayValue' in val) {
            const arr = val.arrayValue?.values || [];
            return arr.map(FirestoreRestAdapter.fromFirestoreValue);
        }
        if ('mapValue' in val) {
            const fields = val.mapValue?.fields || {};
            const obj = {};
            for (const [k, v] of Object.entries(fields)) {
                obj[k] = FirestoreRestAdapter.fromFirestoreValue(v);
            }
            return obj;
        }
        return null;
    }
    static documentToData(doc) {
        const fields = doc.fields || {};
        const result = {};
        for (const [k, v] of Object.entries(fields)) {
            result[k] = FirestoreRestAdapter.fromFirestoreValue(v);
        }
        if (doc.name) {
            const parts = doc.name.split('/');
            result.id = parts[parts.length - 1];
        }
        return result;
    }
    static dataToFields(data) {
        const fields = {};
        for (const [k, v] of Object.entries(data)) {
            if (k === 'id')
                continue;
            fields[k] = FirestoreRestAdapter.toFirestoreValue(v);
        }
        return fields;
    }
    async get(collection, id, _options) {
        this.quotaTracker.recordReads(1);
        const url = this.getUrl(`${collection}/${id}`);
        const res = await fetch(url, { headers: this.getHeaders() });
        if (res.status === 404)
            return null;
        if (!res.ok) {
            throw new Error(`Firestore REST get error (${res.status}): ${await res.text()}`);
        }
        const doc = (await res.json());
        return FirestoreRestAdapter.documentToData(doc);
    }
    async set(collection, id, data, options) {
        this.quotaTracker.recordWrites(1);
        const fields = FirestoreRestAdapter.dataToFields(data);
        const params = {};
        if (options?.merge) {
            for (const k of Object.keys(data)) {
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
    async update(collection, id, data, _options) {
        this.quotaTracker.recordWrites(1);
        const fields = FirestoreRestAdapter.dataToFields(data);
        const url = new URL(this.getUrl(`${collection}/${id}`));
        for (const key of Object.keys(data)) {
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
    async delete(collection, id, _options) {
        this.quotaTracker.recordDeletes(1);
        const url = this.getUrl(`${collection}/${id}`);
        const res = await fetch(url, { method: 'DELETE', headers: this.getHeaders() });
        if (!res.ok && res.status !== 404) {
            throw new Error(`Firestore REST delete error (${res.status}): ${await res.text()}`);
        }
    }
    async query(collection, queryDef) {
        const runQueryUrl = `${this.baseUrl}:runQuery`;
        const structuredQuery = {
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
        const items = (await res.json());
        const results = [];
        for (const item of items) {
            if (item.document) {
                results.push(FirestoreRestAdapter.documentToData(item.document));
            }
        }
        this.quotaTracker.recordReads(results.length || 1);
        return results;
    }
    async paginate(collection, queryDef) {
        const items = await this.query(collection, {
            filters: queryDef.filters,
            orderBy: queryDef.orderBy,
            limit: queryDef.limit + 1,
        });
        const hasMore = items.length > queryDef.limit;
        const paginatedItems = hasMore ? items.slice(0, queryDef.limit) : items;
        const nextCursor = hasMore && paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].id : null;
        return {
            items: paginatedItems,
            nextCursor,
            hasMore,
        };
    }
    async count(collection, queryDef) {
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
                const data = (await res.json());
                const countVal = data[0]?.result?.aggregateFields?.total_count?.integerValue;
                if (countVal !== undefined) {
                    return parseInt(countVal, 10);
                }
            }
        }
        catch {
            // Fallback
        }
        // Fallback count via query
        const results = await this.query(collection, queryDef);
        return results.length;
    }
    async runTransaction(_updateFunction) {
        throw new Error('Firestore REST transactions require beginTransaction/commit. Use batch operations or WebAdapter for transactions.');
    }
    async batch(operations) {
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
    getQuotaMetrics() {
        return this.quotaTracker.getMetrics();
    }
    onQuotaAlert(callback) {
        this.quotaTracker.addAlertListener(callback);
    }
}
//# sourceMappingURL=FirestoreRestAdapter.js.map