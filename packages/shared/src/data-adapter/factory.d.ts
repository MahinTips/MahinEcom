import { IDataAdapter } from './IDataAdapter.js';
import { FirestoreRestConfig } from './FirestoreRestAdapter.js';
import { FirebaseMode, PlanMode } from '../types/index.js';
export interface DataAdapterOptions {
    tenantId: string;
    firebaseMode?: FirebaseMode;
    planMode?: PlanMode;
    restConfig?: FirestoreRestConfig;
    useMock?: boolean;
    initialMockData?: Record<string, Record<string, Record<string, unknown>>>;
}
export declare function createDataAdapter(options: DataAdapterOptions): IDataAdapter;
//# sourceMappingURL=factory.d.ts.map