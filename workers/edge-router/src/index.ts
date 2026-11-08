/**
 * ShopNest Edge Router Worker
 * Resolves incoming hostname -> tenantId + config via Cloudflare KV/Cache
 */

export interface Env {
  DOMAINS_KV: KVNamespace;
  PLATFORM_DOMAIN: string;
  ADMIN_SUBDOMAIN: string;
  SUPER_ADMIN_SUBDOMAIN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Super Admin Domain Resolution
    if (hostname === env.SUPER_ADMIN_SUBDOMAIN) {
      return new Response(`[ShopNest] Super Admin Gateway: ${hostname}`, {
        headers: { 'X-ShopNest-Target': 'super-admin' },
      });
    }

    // 2. Tenant Admin Domain Resolution
    if (hostname === env.ADMIN_SUBDOMAIN) {
      return new Response(`[ShopNest] Tenant Admin Gateway: ${hostname}`, {
        headers: { 'X-ShopNest-Target': 'tenant-admin' },
      });
    }

    // 3. Resolve Tenant Storefront via KV or Wildcard Subdomain
    return new Response(`[ShopNest] Storefront Gateway for: ${hostname}`, {
      headers: { 'X-ShopNest-Target': 'storefront' },
    });
  },
};

