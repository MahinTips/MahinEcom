import { describe, it, expect } from 'vitest';
import { TenantCreateSchema, OrderCheckoutSchema, } from '../schemas/index.js';
class SecurityRulesSimulator {
    static canReadTenantDoc(path, request) {
        const isSuperAdmin = request.auth?.token.role === 'superadmin';
        const parts = path.split('/');
        // e.g. "tenants/{tenantId}"
        if (parts.length === 2 && parts[0] === 'tenants') {
            const tenantId = parts[1];
            return isSuperAdmin || request.auth?.token.tenantId === tenantId;
        }
        return false;
    }
    static canUpdateTenantDoc(path, currentData, updatedData, request) {
        const isSuperAdmin = request.auth?.token.role === 'superadmin';
        if (isSuperAdmin)
            return true;
        const parts = path.split('/');
        if (parts.length === 2 && parts[0] === 'tenants') {
            const tenantId = parts[1];
            const isOwner = request.auth?.token.tenantId === tenantId && request.auth?.token.role === 'owner';
            if (!isOwner)
                return false;
            // Rule: !request.resource.data.diff(resource.data).affectedKeys().hasAny(['planMode', 'firebaseMode', 'status', 'features', 'saasPlanId'])
            const restrictedKeys = ['planMode', 'firebaseMode', 'status', 'features', 'saasPlanId'];
            for (const key of restrictedKeys) {
                if (updatedData[key] !== currentData[key]) {
                    return false; // Forbidden field update
                }
            }
            return true;
        }
        return false;
    }
    static canReadProduct(path, productData, request) {
        const isSuperAdmin = request.auth?.token.role === 'superadmin';
        if (isSuperAdmin)
            return true;
        const parts = path.split('/'); // tenants/{tenantId}/products/{productId}
        const tenantId = parts[1];
        const isStaff = request.auth?.token.tenantId === tenantId &&
            ['owner', 'manager', 'staff'].includes(request.auth?.token.role || '');
        if (isStaff)
            return true;
        // Public read if published
        return productData.status === 'published';
    }
    static canReadOrder(path, orderData, request) {
        const isSuperAdmin = request.auth?.token.role === 'superadmin';
        if (isSuperAdmin)
            return true;
        const parts = path.split('/'); // tenants/{tenantId}/orders/{orderId}
        const tenantId = parts[1];
        const isStaff = request.auth?.token.tenantId === tenantId &&
            ['owner', 'manager', 'staff'].includes(request.auth?.token.role || '');
        if (isStaff)
            return true;
        // Customer can read own order
        if (request.auth && orderData.customerUid === request.auth.uid) {
            return true;
        }
        return false;
    }
    static canCreateOrder(path, orderData) {
        const parts = path.split('/'); // tenants/{tenantId}/orders/{orderId}
        const tenantId = parts[1];
        // Rule: request.resource.data.tenantId == tenantId && request.resource.data.status in ['pending', 'processing']
        return orderData.tenantId === tenantId && ['pending', 'processing'].includes(orderData.status);
    }
    static canWriteSettings(path, request) {
        const isSuperAdmin = request.auth?.token.role === 'superadmin';
        if (isSuperAdmin)
            return true;
        const parts = path.split('/'); // tenants/{tenantId}/settings/{settingDoc}
        const tenantId = parts[1];
        const isManagerOrOwner = request.auth?.token.tenantId === tenantId &&
            ['owner', 'manager'].includes(request.auth?.token.role || '');
        return isManagerOrOwner;
    }
}
describe('Firestore Security Rules Unit Tests', () => {
    const superAdminAuth = {
        uid: 'sa-001',
        token: { role: 'superadmin' },
    };
    const tenantOwnerA = {
        uid: 'owner-a',
        token: { tenantId: 'tenant-alpha', role: 'owner' },
    };
    const tenantStaffA = {
        uid: 'staff-a',
        token: { tenantId: 'tenant-alpha', role: 'staff' },
    };
    const tenantOwnerB = {
        uid: 'owner-b',
        token: { tenantId: 'tenant-beta', role: 'owner' },
    };
    it('SuperAdmin should be allowed access across all tenants', () => {
        expect(SecurityRulesSimulator.canReadTenantDoc('tenants/tenant-alpha', { auth: superAdminAuth })).toBe(true);
        expect(SecurityRulesSimulator.canReadTenantDoc('tenants/tenant-beta', { auth: superAdminAuth })).toBe(true);
    });
    it('Tenant A Owner should NOT be able to access Tenant B documents (Tenant Isolation)', () => {
        // Tenant A accessing Tenant A -> OK
        expect(SecurityRulesSimulator.canReadTenantDoc('tenants/tenant-alpha', { auth: tenantOwnerA })).toBe(true);
        // Tenant A accessing Tenant B -> DENIED
        expect(SecurityRulesSimulator.canReadTenantDoc('tenants/tenant-beta', { auth: tenantOwnerA })).toBe(false);
        // Tenant A reading Tenant B orders -> DENIED
        expect(SecurityRulesSimulator.canReadOrder('tenants/tenant-beta/orders/ord-99', {}, { auth: tenantOwnerA })).toBe(false);
    });
    it('Tenant Owner should NOT be allowed to tamper with Plan Mode or Status directly', () => {
        const currentDoc = {
            name: 'Alpha Store',
            planMode: 'spark',
            status: 'active',
        };
        // Owner trying to illegally upgrade to 'blaze' -> DENIED
        const illegalUpdate = {
            name: 'Alpha Store',
            planMode: 'blaze',
            status: 'active',
        };
        expect(SecurityRulesSimulator.canUpdateTenantDoc('tenants/tenant-alpha', currentDoc, illegalUpdate, {
            auth: tenantOwnerA,
        })).toBe(false);
        // Owner updating store name -> ALLOWED
        const validUpdate = {
            name: 'Alpha Store Updated',
            planMode: 'spark',
            status: 'active',
        };
        expect(SecurityRulesSimulator.canUpdateTenantDoc('tenants/tenant-alpha', currentDoc, validUpdate, {
            auth: tenantOwnerA,
        })).toBe(true);
    });
    it('Store staff should NOT be allowed to alter Store Settings (only Owner/Manager)', () => {
        // Staff updating settings -> DENIED
        expect(SecurityRulesSimulator.canWriteSettings('tenants/tenant-alpha/settings/theme', {
            auth: tenantStaffA,
        })).toBe(false);
        // Owner updating settings -> ALLOWED
        expect(SecurityRulesSimulator.canWriteSettings('tenants/tenant-alpha/settings/theme', {
            auth: tenantOwnerA,
        })).toBe(true);
    });
    it('Public storefront visitors can read published products, but not drafts', () => {
        const publishedProd = { status: 'published', name: 'Jamdani Saree' };
        const draftProd = { status: 'draft', name: 'Unfinished Product' };
        // Unauthenticated guest reading published product -> ALLOWED
        expect(SecurityRulesSimulator.canReadProduct('tenants/tenant-alpha/products/p1', publishedProd, {})).toBe(true);
        // Unauthenticated guest reading draft product -> DENIED
        expect(SecurityRulesSimulator.canReadProduct('tenants/tenant-alpha/products/p2', draftProd, {})).toBe(false);
        // Staff reading draft product -> ALLOWED
        expect(SecurityRulesSimulator.canReadProduct('tenants/tenant-alpha/products/p2', draftProd, {
            auth: tenantStaffA,
        })).toBe(true);
    });
    it('Public storefront visitors can create valid checkout orders', () => {
        // Valid order payload
        expect(SecurityRulesSimulator.canCreateOrder('tenants/tenant-alpha/orders/ord-101', {
            tenantId: 'tenant-alpha',
            status: 'pending',
        })).toBe(true);
        // Mismatched tenantId -> DENIED
        expect(SecurityRulesSimulator.canCreateOrder('tenants/tenant-alpha/orders/ord-101', {
            tenantId: 'tenant-beta',
            status: 'pending',
        })).toBe(false);
    });
});
describe('Zod Schema Validation Tests', () => {
    it('should validate tenant creation and reject invalid slugs', () => {
        const validTenant = {
            name: 'Aarong Crafts',
            slug: 'aarong-crafts',
            ownerEmail: 'owner@aarong.com',
            firebaseMode: 'shared',
            planMode: 'spark',
            saasPlanId: 'basic',
        };
        expect(TenantCreateSchema.safeParse(validTenant).success).toBe(true);
        // Invalid slug with uppercase and spaces
        const invalidSlugTenant = {
            ...validTenant,
            slug: 'Aarong Crafts!',
        };
        expect(TenantCreateSchema.safeParse(invalidSlugTenant).success).toBe(false);
    });
    it('should validate Bangladeshi customer phone numbers in order checkout', () => {
        const validOrder = {
            customer: {
                name: 'Tanvir Ahmed',
                phone: '01712345678',
                email: 'tanvir@gmail.com',
            },
            shippingAddress: {
                address: 'House 12, Road 5, Dhanmondi',
                city: 'Dhanmondi',
                district: 'Dhaka',
            },
            items: [
                {
                    productId: 'p-1',
                    productName: 'T-Shirt',
                    sku: 'TS-01',
                    price: 500,
                    quantity: 2,
                    total: 1000,
                },
            ],
            paymentMethod: 'cod',
        };
        expect(OrderCheckoutSchema.safeParse(validOrder).success).toBe(true);
        // Invalid phone number
        const invalidPhoneOrder = {
            ...validOrder,
            customer: { ...validOrder.customer, phone: '12345' },
        };
        expect(OrderCheckoutSchema.safeParse(invalidPhoneOrder).success).toBe(false);
    });
});
//# sourceMappingURL=rules.test.js.map