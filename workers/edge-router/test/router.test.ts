import { describe, it, expect } from 'vitest';
import { EdgeTenantRouter, ResolvedTenant } from '../src/router.js';

describe('Edge Tenant Router Unit Tests', () => {
  const router = new EdgeTenantRouter({
    platformDomain: 'shopnest.com',
    superAdminHost: 'super.shopnest.com',
    tenantAdminHost: 'admin.shopnest.com',
  });

  const mockKvStore = new Map<string, ResolvedTenant>();

  const activeTenant: ResolvedTenant = {
    tenantId: 'artisan-bd',
    slug: 'artisan-bd',
    name: 'Artisan Bangladesh',
    status: 'active',
    firebaseMode: 'shared',
    planMode: 'spark',
    isCustomDomain: false,
  };

  const suspendedTenant: ResolvedTenant = {
    tenantId: 'suspended-store',
    slug: 'suspended-store',
    name: 'Suspended Store',
    status: 'suspended',
    firebaseMode: 'shared',
    planMode: 'spark',
    isCustomDomain: false,
  };

  // Seed mock KV
  mockKvStore.set('slug:artisan-bd', activeTenant);
  mockKvStore.set('artisan.com.bd', { ...activeTenant, isCustomDomain: true });
  mockKvStore.set('slug:suspended-store', suspendedTenant);

  const lookupDomainInKv = async (host: string) => mockKvStore.get(host) || null;
  const lookupTenantBySlug = async (slug: string) => mockKvStore.get(`slug:${slug}`) || null;

  it('should clean hostname from port and whitespace', () => {
    expect(router.cleanHostname('Super.ShopNest.COM:8787')).toBe('super.shopnest.com');
    expect(router.cleanHostname(' artisan.com.bd. ')).toBe('artisan.com.bd');
  });

  it('should route to Super Admin for super.shopnest.com', async () => {
    const route = await router.resolveRoute('super.shopnest.com:443', lookupDomainInKv, lookupTenantBySlug);
    expect(route.type).toBe('super-admin');
  });

  it('should route to Tenant Admin for admin.shopnest.com', async () => {
    const route = await router.resolveRoute('ADMIN.SHOPNEST.COM', lookupDomainInKv, lookupTenantBySlug);
    expect(route.type).toBe('tenant-admin');
  });

  it('should route to Storefront for valid wildcard subdomain (artisan-bd.shopnest.com)', async () => {
    const route = await router.resolveRoute('artisan-bd.shopnest.com', lookupDomainInKv, lookupTenantBySlug);
    expect(route.type).toBe('storefront');
    if (route.type === 'storefront') {
      expect(route.tenant.tenantId).toBe('artisan-bd');
      expect(route.tenant.planMode).toBe('spark');
    }
  });

  it('should route to Storefront for registered custom domain (artisan.com.bd)', async () => {
    const route = await router.resolveRoute('artisan.com.bd', lookupDomainInKv, lookupTenantBySlug);
    expect(route.type).toBe('storefront');
    if (route.type === 'storefront') {
      expect(route.tenant.tenantId).toBe('artisan-bd');
      expect(route.tenant.isCustomDomain).toBe(true);
    }
  });

  it('should return suspended for suspended tenant store', async () => {
    const route = await router.resolveRoute('suspended-store.shopnest.com', lookupDomainInKv, lookupTenantBySlug);
    expect(route.type).toBe('suspended');
    if (route.type === 'suspended') {
      expect(route.tenantName).toBe('Suspended Store');
    }
  });

  it('should return not-found for unregistered domain or wildcard', async () => {
    const route = await router.resolveRoute('unknown-store.shopnest.com', lookupDomainInKv, lookupTenantBySlug);
    expect(route.type).toBe('not-found');
    if (route.type === 'not-found') {
      expect(route.hostname).toBe('unknown-store.shopnest.com');
    }
  });
});

