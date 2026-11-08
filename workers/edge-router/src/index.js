import { EdgeTenantRouter } from './router.js';
import { renderTenantNotFoundHtml, renderTenantSuspendedHtml } from './pages/error-pages.js';
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const rawHostname = request.headers.get('Host') || url.hostname;
        // Health check endpoint
        if (url.pathname === '/_health' || url.pathname === '/api/health') {
            return new Response(JSON.stringify({
                status: 'healthy',
                service: 'shopnest-edge-router',
                timestamp: new Date().toISOString(),
            }), { headers: { 'Content-Type': 'application/json' } });
        }
        const router = new EdgeTenantRouter({
            platformDomain: env.PLATFORM_DOMAIN || 'shopnest.com',
            superAdminHost: env.SUPER_ADMIN_SUBDOMAIN || 'super.shopnest.com',
            tenantAdminHost: env.ADMIN_SUBDOMAIN || 'admin.shopnest.com',
        });
        const route = await router.resolveRoute(rawHostname, async (host) => {
            // 1. Look up in Cloudflare KV (Zero latency, no Firestore reads)
            const cached = await env.DOMAINS_KV.get(host, 'json');
            if (cached)
                return cached;
            // 2. Fallback to Firestore REST API if not cached in KV yet
            if (env.FIREBASE_PROJECT_ID) {
                try {
                    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/domains/${encodeURIComponent(host)}`;
                    const res = await fetch(firestoreUrl);
                    if (res.ok) {
                        const doc = (await res.json());
                        const tenantId = doc.fields?.tenantId?.stringValue;
                        if (tenantId) {
                            // Fetch tenant details
                            const tenantRes = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/tenants/${tenantId}`);
                            if (tenantRes.ok) {
                                const tDoc = (await tenantRes.json());
                                const resolved = {
                                    tenantId,
                                    slug: tDoc.fields?.slug?.stringValue || tenantId,
                                    name: tDoc.fields?.name?.stringValue || tenantId,
                                    status: tDoc.fields?.status?.stringValue || 'active',
                                    firebaseMode: tDoc.fields?.firebaseMode?.stringValue || 'shared',
                                    planMode: tDoc.fields?.planMode?.stringValue || 'spark',
                                    isCustomDomain: true,
                                };
                                // Cache in KV for 1 hour (3600 seconds) to protect Spark Quota!
                                await env.DOMAINS_KV.put(host, JSON.stringify(resolved), { expirationTtl: 3600 });
                                return resolved;
                            }
                        }
                    }
                }
                catch (err) {
                    console.error('[EdgeRouter] Firestore fallback error:', err);
                }
            }
            return null;
        }, async (slug) => {
            // Wildcard lookup by slug in KV
            return await env.DOMAINS_KV.get(`slug:${slug}`, 'json');
        });
        // Route Actions
        switch (route.type) {
            case 'super-admin': {
                const newHeaders = new Headers(request.headers);
                newHeaders.set('X-ShopNest-Target', 'super-admin');
                return new Response(`[ShopNest Edge] Routed to Super Admin SPA`, {
                    status: 200,
                    headers: newHeaders,
                });
            }
            case 'tenant-admin': {
                const newHeaders = new Headers(request.headers);
                newHeaders.set('X-ShopNest-Target', 'tenant-admin');
                return new Response(`[ShopNest Edge] Routed to Tenant Admin SPA`, {
                    status: 200,
                    headers: newHeaders,
                });
            }
            case 'suspended': {
                return new Response(renderTenantSuspendedHtml(route.hostname, route.tenantName), {
                    status: 503,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                });
            }
            case 'not-found': {
                return new Response(renderTenantNotFoundHtml(route.hostname), {
                    status: 404,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                });
            }
            case 'storefront': {
                const { tenant } = route;
                const newHeaders = new Headers(request.headers);
                newHeaders.set('X-ShopNest-Target', 'storefront');
                newHeaders.set('X-ShopNest-Tenant-Id', tenant.tenantId);
                newHeaders.set('X-ShopNest-Tenant-Slug', tenant.slug);
                newHeaders.set('X-ShopNest-Firebase-Mode', tenant.firebaseMode);
                newHeaders.set('X-ShopNest-Plan-Mode', tenant.planMode);
                return new Response(JSON.stringify({
                    message: `[ShopNest Edge] Successfully routed to Storefront for ${tenant.name}`,
                    tenant: {
                        id: tenant.tenantId,
                        slug: tenant.slug,
                        name: tenant.name,
                        firebaseMode: tenant.firebaseMode,
                        planMode: tenant.planMode,
                    },
                }), {
                    status: 200,
                    headers: {
                        ...Object.fromEntries(newHeaders.entries()),
                        'Content-Type': 'application/json',
                    },
                });
            }
        }
    },
};
//# sourceMappingURL=index.js.map