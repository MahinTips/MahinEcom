import { IDataAdapter } from './IDataAdapter.js';
import { MockDataAdapter } from './MockDataAdapter.js';
import { FirestoreRestAdapter, FirestoreRestConfig } from './FirestoreRestAdapter.js';
import { FIREBASE_MODES, PLAN_MODES } from '../constants/index.js';
import { FirebaseMode, PlanMode } from '../types/index.js';

export interface DataAdapterOptions {
  tenantId: string;
  firebaseMode?: FirebaseMode;
  planMode?: PlanMode;
  restConfig?: FirestoreRestConfig;
  useMock?: boolean;
  initialMockData?: Record<string, Record<string, Record<string, unknown>>>;
}

export function createDataAdapter(options: DataAdapterOptions): IDataAdapter {
  const isBlaze = options.planMode === PLAN_MODES.BLAZE;

  if (options.useMock || !options.restConfig) {
    return new MockDataAdapter(options.tenantId, isBlaze, options.initialMockData);
  }

  return new FirestoreRestAdapter(options.tenantId, options.restConfig, isBlaze);
}

