import { MockDataAdapter } from './MockDataAdapter.js';
import { FirestoreRestAdapter } from './FirestoreRestAdapter.js';
import { PLAN_MODES } from '../constants/index.js';
export function createDataAdapter(options) {
    const isBlaze = options.planMode === PLAN_MODES.BLAZE;
    if (options.useMock || !options.restConfig) {
        return new MockDataAdapter(options.tenantId, isBlaze, options.initialMockData);
    }
    return new FirestoreRestAdapter(options.tenantId, options.restConfig, isBlaze);
}
//# sourceMappingURL=factory.js.map