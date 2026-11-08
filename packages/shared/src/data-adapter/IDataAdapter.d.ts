import { TenantQuotaMetrics } from '../types/index.js';
export type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any';
export interface QueryFilter {
    field: string;
    operator: WhereFilterOp;
    value: unknown;
}
export interface QueryOrderBy {
    field: string;
    direction?: 'asc' | 'desc';
}
export interface QueryDefinition {
    filters?: QueryFilter[];
    orderBy?: QueryOrderBy[];
    limit?: number;
}
export interface PaginatedQueryDefinition extends QueryDefinition {
    limit: number;
    cursor?: string | null;
}
export interface PaginatedResult<T> {
    items: T[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount?: number;
}
export interface ReadOptions {
    bypassCache?: boolean;
    cacheTtlSeconds?: number;
}
export interface WriteOptions {
    merge?: boolean;
}
export type BatchOperation = {
    type: 'set';
    collection: string;
    id: string;
    data: Record<string, unknown>;
    merge?: boolean;
} | {
    type: 'update';
    collection: string;
    id: string;
    data: Record<string, unknown>;
} | {
    type: 'delete';
    collection: string;
    id: string;
};
export interface ITransaction {
    get<T>(collection: string, id: string): Promise<T | null>;
    set<T>(collection: string, id: string, data: T, options?: WriteOptions): void;
    update<T>(collection: string, id: string, data: Partial<T>): void;
    delete(collection: string, id: string): void;
}
export interface QuotaAlert {
    tenantId: string;
    level: 'warning' | 'critical' | 'exceeded';
    metric: 'reads' | 'writes' | 'deletes';
    currentUsage: number;
    limit: number;
    percentage: number;
    message: string;
    suggestBlaze: boolean;
}
export interface IDataAdapter {
    readonly tenantId: string;
    readonly isBlaze: boolean;
    get<T>(collection: string, id: string, options?: ReadOptions): Promise<T | null>;
    set<T>(collection: string, id: string, data: T, options?: WriteOptions): Promise<void>;
    update<T>(collection: string, id: string, data: Partial<T>, options?: WriteOptions): Promise<void>;
    delete(collection: string, id: string, options?: WriteOptions): Promise<void>;
    query<T>(collection: string, queryDef?: QueryDefinition): Promise<T[]>;
    paginate<T>(collection: string, queryDef: PaginatedQueryDefinition): Promise<PaginatedResult<T>>;
    count(collection: string, queryDef?: QueryDefinition): Promise<number>;
    runTransaction<R>(updateFunction: (tx: ITransaction) => Promise<R>): Promise<R>;
    batch(operations: BatchOperation[]): Promise<void>;
    getQuotaMetrics(): TenantQuotaMetrics;
    onQuotaAlert(callback: (alert: QuotaAlert) => void): void;
}
//# sourceMappingURL=IDataAdapter.d.ts.map