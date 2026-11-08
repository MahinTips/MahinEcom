import { IDataAdapter, QueryDefinition, PaginatedQueryDefinition, PaginatedResult, ReadOptions, WriteOptions, BatchOperation, ITransaction, QuotaAlert } from './IDataAdapter.js';
import { TenantQuotaMetrics } from '../types/index.js';
export interface FirestoreRestConfig {
    projectId: string;
    apiKey?: string;
    authToken?: string;
    databaseId?: string;
}
export declare class FirestoreRestAdapter implements IDataAdapter {
    readonly tenantId: string;
    private readonly config;
    readonly isBlaze: boolean;
    private baseUrl;
    private quotaTracker;
    constructor(tenantId: string, config: FirestoreRestConfig, isBlaze?: boolean);
    private getHeaders;
    private getUrl;
    static toFirestoreValue(val: unknown): Record<string, unknown>;
    static fromFirestoreValue(val: Record<string, unknown>): unknown;
    static documentToData<T>(doc: Record<string, unknown>): T;
    static dataToFields(data: Record<string, unknown>): Record<string, unknown>;
    get<T>(collection: string, id: string, _options?: ReadOptions): Promise<T | null>;
    set<T>(collection: string, id: string, data: T, options?: WriteOptions): Promise<void>;
    update<T>(collection: string, id: string, data: Partial<T>, _options?: WriteOptions): Promise<void>;
    delete(collection: string, id: string, _options?: WriteOptions): Promise<void>;
    query<T>(collection: string, queryDef?: QueryDefinition): Promise<T[]>;
    paginate<T>(collection: string, queryDef: PaginatedQueryDefinition): Promise<PaginatedResult<T>>;
    count(collection: string, queryDef?: QueryDefinition): Promise<number>;
    runTransaction<R>(_updateFunction: (tx: ITransaction) => Promise<R>): Promise<R>;
    batch(operations: BatchOperation[]): Promise<void>;
    getQuotaMetrics(): TenantQuotaMetrics;
    onQuotaAlert(callback: (alert: QuotaAlert) => void): void;
}
//# sourceMappingURL=FirestoreRestAdapter.d.ts.map