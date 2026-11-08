import { IDataAdapter, QueryDefinition, PaginatedQueryDefinition, PaginatedResult, ReadOptions, WriteOptions, BatchOperation, ITransaction, QuotaAlert } from './IDataAdapter.js';
import { TenantQuotaMetrics } from '../types/index.js';
export declare class MockDataAdapter implements IDataAdapter {
    readonly tenantId: string;
    readonly isBlaze: boolean;
    private store;
    private quotaTracker;
    constructor(tenantId: string, isBlaze?: boolean, initialData?: Record<string, Record<string, Record<string, unknown>>>);
    private getCollectionMap;
    get<T>(collection: string, id: string, _options?: ReadOptions): Promise<T | null>;
    set<T>(collection: string, id: string, data: T, options?: WriteOptions): Promise<void>;
    update<T>(collection: string, id: string, data: Partial<T>, _options?: WriteOptions): Promise<void>;
    delete(collection: string, id: string, _options?: WriteOptions): Promise<void>;
    query<T>(collection: string, queryDef?: QueryDefinition): Promise<T[]>;
    paginate<T>(collection: string, queryDef: PaginatedQueryDefinition): Promise<PaginatedResult<T>>;
    count(collection: string, queryDef?: QueryDefinition): Promise<number>;
    runTransaction<R>(updateFunction: (tx: ITransaction) => Promise<R>): Promise<R>;
    batch(operations: BatchOperation[]): Promise<void>;
    getQuotaMetrics(): TenantQuotaMetrics;
    onQuotaAlert(callback: (alert: QuotaAlert) => void): void;
}
//# sourceMappingURL=MockDataAdapter.d.ts.map