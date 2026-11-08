import { MockDataAdapter } from '../packages/shared/src/data-adapter/MockDataAdapter.js';
import { seedPlatformDatabase } from './seed-platform.js';
async function main() {
    const adapter = new MockDataAdapter('platform-master');
    await seedPlatformDatabase(adapter);
    const metrics = adapter.getQuotaMetrics();
    console.log('📊 Seeding Operation Quota Summary:');
    console.log(`- Reads: ${metrics.firestoreReads}`);
    console.log(`- Writes: ${metrics.firestoreWrites}`);
    console.log(`- Deletes: ${metrics.firestoreDeletes}`);
}
main().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
//# sourceMappingURL=run-seed.js.map