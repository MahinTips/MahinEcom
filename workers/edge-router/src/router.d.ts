import { FirebaseMode, PlanMode } from '@shopnest/shared';
export interface ResolvedTenant {
    tenantId: string;
    slug: string;
    name: string;
    status: 'active' | 'suspended' | 'trial';
    firebaseMode: FirebaseMode;
    planMode: PlanMode;
    isCustomDomain: boolean;
}
export interface RouterConfig {
    platformDomain: string;
    superAdminHost: string;
    tenantAdminHost: string;
}
export type RouteTargetType = {
    type: 'super-admin';
} | {
    type: 'tenant-admin';
} | {
    type: 'api';
    path: string;
} | {
    type: 'storefront';
    tenant: ResolvedTenant;
} | {
    type: 'not-found';
    hostname: string;
} | {
    type: 'suspended';
    hostname: string;
    tenantName?: string;
};
export declare class EdgeTenantRouter {
    private readonly config;
    constructor(config: RouterConfig);
    /**
     * Cleans hostname from port and trailing dots
     */
    cleanHostname(rawHost: string | null): string;
    /**
     * Extracts subdomain slug if request is from wildcard domain
     * e.g. "artisan.shopnest.com" with platformDomain "shopnest.com" returns "artisan"
     */
    extractWildcardSlug(hostname: string): string | null;
    /**
     * Resolves target from hostname and KV lookup callback
     */
    resolveRoute(hostname: string, lookupDomainInKv: (host: string) => Promise<ResolvedTenant | null>, lookupTenantBySlug?: (slug: string) => Promise<ResolvedTenant | null>): Promise<RouteTargetType>;
}
//# sourceMappingURL=router.d.ts.map