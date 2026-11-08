export interface Env {
    DOMAINS_KV: KVNamespace;
    PLATFORM_DOMAIN: string;
    ADMIN_SUBDOMAIN: string;
    SUPER_ADMIN_SUBDOMAIN: string;
    STOREFRONT_HOST?: string;
    SUPER_ADMIN_HOST?: string;
    TENANT_ADMIN_HOST?: string;
    FIREBASE_PROJECT_ID?: string;
}
declare const _default: {
    fetch(request: Request, env: Env): Promise<Response>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map