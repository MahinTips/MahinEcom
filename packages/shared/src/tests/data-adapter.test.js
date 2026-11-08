import { describe, it, expect, vi } from 'vitest';
import { MockDataAdapter } from '../data-adapter/MockDataAdapter.js';
import { QuotaTracker } from '../data-adapter/QuotaTracker.js';
describe('DataAdapter & QuotaTracker Unit Tests', () => {
    it('should get, set, update, and delete documents correctly', async () => {
        const adapter = new MockDataAdapter('artisan-crafts');
        // 1. Set document
        await adapter.set('products', 'prod-1', {
            name: 'Handmade Clay Mug',
            price: 350,
            stock: 20,
        });
        const doc = await adapter.get('products', 'prod-1');
        expect(doc).toBeDefined();
        expect(doc?.name).toBe('Handmade Clay Mug');
        expect(doc?.price).toBe(350);
        // 2. Update document
        await adapter.update('products', 'prod-1', { price: 400 });
        const updatedDoc = await adapter.get('products', 'prod-1');
        expect(updatedDoc?.price).toBe(400);
        // 3. Delete document
        await adapter.delete('products', 'prod-1');
        const deletedDoc = await adapter.get('products', 'prod-1');
        expect(deletedDoc).toBeNull();
    });
    it('should paginate items with cursor and limit accurately', async () => {
        const adapter = new MockDataAdapter('demo-store');
        for (let i = 1; i <= 25; i++) {
            await adapter.set('products', `prod-${String(i).padStart(2, '0')}`, {
                name: `Product ${i}`,
                price: i * 10,
            });
        }
        // Page 1: limit 10
        const page1 = await adapter.paginate('products', {
            limit: 10,
        });
        expect(page1.items.length).toBe(10);
        expect(page1.hasMore).toBe(true);
        expect(page1.nextCursor).toBe('prod-10');
        // Page 2: limit 10 from cursor
        const page2 = await adapter.paginate('products', {
            limit: 10,
            cursor: page1.nextCursor,
        });
        expect(page2.items.length).toBe(10);
        expect(page2.hasMore).toBe(true);
        expect(page2.nextCursor).toBe('prod-20');
        // Page 3: remaining 5
        const page3 = await adapter.paginate('products', {
            limit: 10,
            cursor: page2.nextCursor,
        });
        expect(page3.items.length).toBe(5);
        expect(page3.hasMore).toBe(false);
    });
    it('should track quota and trigger warning at 70% and critical at 90%', () => {
        const tracker = new QuotaTracker('quota-test-tenant');
        const alertMock = vi.fn();
        tracker.addAlertListener(alertMock);
        // 69% of daily reads (34,500 reads) -> No alert
        tracker.recordReads(34_500);
        expect(alertMock).not.toHaveBeenCalled();
        // Reaching 70% (35,000 reads) -> Warning alert
        tracker.recordReads(500);
        expect(alertMock).toHaveBeenCalledTimes(1);
        expect(alertMock.mock.calls[0][0].level).toBe('warning');
        expect(alertMock.mock.calls[0][0].suggestBlaze).toBe(true);
        // Reaching 90% (45,000 reads) -> Critical alert
        tracker.recordReads(10_000);
        expect(alertMock).toHaveBeenCalledTimes(2);
        expect(alertMock.mock.calls[1][0].level).toBe('critical');
        const metrics = tracker.getMetrics();
        expect(metrics.firestoreReads).toBe(45_000);
    });
    it('should execute atomic transactions and rollback on error', async () => {
        const adapter = new MockDataAdapter('tx-tenant');
        await adapter.set('inventory', 'item-1', { stock: 10 });
        // Successful transaction
        await adapter.runTransaction(async (tx) => {
            const item = await tx.get('inventory', 'item-1');
            if (!item || item.stock < 2)
                throw new Error('Out of stock');
            tx.update('inventory', 'item-1', { stock: item.stock - 2 });
        });
        const itemAfter = await adapter.get('inventory', 'item-1');
        expect(itemAfter?.stock).toBe(8);
    });
});
//# sourceMappingURL=data-adapter.test.js.map