import { QuotaTracker } from './QuotaTracker.js';
export class MockDataAdapter {
    tenantId;
    isBlaze;
    store = new Map();
    quotaTracker;
    constructor(tenantId, isBlaze = false, initialData) {
        this.tenantId = tenantId;
        this.isBlaze = isBlaze;
        this.quotaTracker = new QuotaTracker(tenantId);
        if (initialData) {
            for (const [col, docs] of Object.entries(initialData)) {
                const colMap = new Map();
                for (const [id, data] of Object.entries(docs)) {
                    colMap.set(id, { ...data, id });
                }
                this.store.set(col, colMap);
            }
        }
    }
    getCollectionMap(collection) {
        let col = this.store.get(collection);
        if (!col) {
            col = new Map();
            this.store.set(collection, col);
        }
        return col;
    }
    async get(collection, id, _options) {
        this.quotaTracker.recordReads(1);
        const col = this.getCollectionMap(collection);
        const data = col.get(id);
        return data ? structuredClone(data) : null;
    }
    async set(collection, id, data, options) {
        this.quotaTracker.recordWrites(1);
        const col = this.getCollectionMap(collection);
        const current = col.get(id) || {};
        const toSave = options?.merge
            ? { ...current, ...data, id }
            : { ...data, id };
        col.set(id, structuredClone(toSave));
    }
    async update(collection, id, data, _options) {
        this.quotaTracker.recordWrites(1);
        const col = this.getCollectionMap(collection);
        const current = col.get(id);
        if (!current) {
            throw new Error(`Document ${collection}/${id} does not exist to update.`);
        }
        const updated = { ...current, ...data, id };
        col.set(id, structuredClone(updated));
    }
    async delete(collection, id, _options) {
        this.quotaTracker.recordDeletes(1);
        const col = this.getCollectionMap(collection);
        col.delete(id);
    }
    async query(collection, queryDef) {
        const col = this.getCollectionMap(collection);
        let items = Array.from(col.values());
        if (queryDef?.filters && queryDef.filters.length > 0) {
            items = items.filter((doc) => {
                return queryDef.filters.every((f) => {
                    const val = doc[f.field];
                    switch (f.operator) {
                        case '==':
                            return val === f.value;
                        case '!=':
                            return val !== f.value;
                        case '<':
                            return val < f.value;
                        case '<=':
                            return val <= f.value;
                        case '>':
                            return val > f.value;
                        case '>=':
                            return val >= f.value;
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
                for (const order of queryDef.orderBy) {
                    const valA = a[order.field];
                    const valB = b[order.field];
                    const dir = order.direction === 'desc' ? -1 : 1;
                    if (valA < valB)
                        return -1 * dir;
                    if (valA > valB)
                        return 1 * dir;
                }
                return 0;
            });
        }
        if (queryDef?.limit && queryDef.limit > 0) {
            items = items.slice(0, queryDef.limit);
        }
        this.quotaTracker.recordReads(items.length || 1); // Firestore counts at least 1 read for empty queries in some pricing, or matched doc count
        return structuredClone(items);
    }
    async paginate(collection, queryDef) {
        const all = await this.query(collection, {
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
            items: sliced,
            nextCursor,
            hasMore,
            totalCount: all.length,
        };
    }
    async count(collection, queryDef) {
        // In Spark/Firestore, count() aggregate query charges 1 read per 1,000 index entries (minimum 1 read)
        this.quotaTracker.recordReads(1);
        const results = await this.query(collection, { filters: queryDef?.filters });
        return results.length;
    }
    async runTransaction(updateFunction) {
        const stagedWrites = [];
        const tx = {
            get: async (col, id) => {
                return this.get(col, id);
            },
            set: (col, id, data, options) => {
                stagedWrites.push(() => this.set(col, id, data, options));
            },
            update: (col, id, data) => {
                stagedWrites.push(() => this.update(col, id, data));
            },
            delete: (col, id) => {
                stagedWrites.push(() => this.delete(col, id));
            },
        };
        const result = await updateFunction(tx);
        for (const write of stagedWrites) {
            write();
        }
        return result;
    }
    async batch(operations) {
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
    getQuotaMetrics() {
        return this.quotaTracker.getMetrics();
    }
    onQuotaAlert(callback) {
        this.quotaTracker.addAlertListener(callback);
    }
}
//# sourceMappingURL=MockDataAdapter.js.map