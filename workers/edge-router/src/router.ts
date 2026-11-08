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
  platformDomain: string; // e.g. "shopnest.com"
  superAdminHost: string; // e.g. "super.shopnest.com"
  tenantAdminHost: string; // e.g. "admin.shopnest.com"
}

export type RouteTargetType =
  | { type: 'super-admin' }
  | { type: 'tenant-admin' }
  | { type: 'api'; path: string }
  | { type: 'storefront'; tenant: ResolvedTenant }
  | { type: 'not-found'; hostname: string }
  | { type: 'suspended'; hostname: string; tenantName?: string };

export class EdgeTenantRouter {
  constructor(private readonly config: RouterConfig) {}

  /**
   * Cleans hostname from port and trailing dots
   */
  public cleanHostname(rawHost: string | null): string {
    if (!rawHost) return 'localhost';
    const noPort = rawHost.split(':')[0].trim().toLowerCase();
    return noPort.endsWith('.') ? noPort.slice(0, -1) : noPort;
  }

  /**
   * Extracts subdomain slug if request is from wildcard domain
   * e.g. "artisan.shopnest.com" with platformDomain "shopnest.com" returns "artisan"
   */
  public extractWildcardSlug(hostname: string): string | null {
    const platform = this.config.platformDomain.toLowerCase();
    if (hostname.endsWith(`.${platform}`)) {
      const prefix = hostname.substring(0, hostname.length - (platform.length + 1));
      // Exclude reserved subdomains
      if (['super', 'admin', 'api', 'assets', 'cdn', 'www'].includes(prefix)) {
        return null;
      }
      return prefix;
    }
    return null;
  }

  /**
   * Resolves target from hostname and KV lookup callback
   */
  public async resolveRoute(
    hostname: string,
    lookupDomainInKv: (host: string) => Promise<ResolvedTenant | null>,
    lookupTenantBySlug?: (slug: string) => Promise<ResolvedTenant | null>
  ): Promise<RouteTargetType> {
    const cleanHost = this.cleanHostname(hostname);

    // 1. Super Admin Gateway
    if (cleanHost === this.config.superAdminHost.toLowerCase()) {
      return { type: 'super-admin' };
    }

    // 2. Tenant Admin Gateway
    if (cleanHost === this.config.tenantAdminHost.toLowerCase()) {
      return { type: 'tenant-admin' };
    }

    // 3. Platform Root Domain
    if (cleanHost === this.config.platformDomain.toLowerCase() || cleanHost === `www.${this.config.platformDomain.toLowerCase()}`) {
      // Landing page or Super Admin
      return { type: 'super-admin' };
    }

    // 4. Wildcard Subdomain (e.g. artisan.shopnest.com)
    const wildcardSlug = this.extractWildcardSlug(cleanHost);
    if (wildcardSlug) {
      let tenant: ResolvedTenant | null = null;
      if (lookupTenantBySlug) {
        tenant = await lookupTenantBySlug(wildcardSlug);
      } else {
        // Fallback: check KV with synthesized host or slug
        tenant = await lookupDomainInKv(`${wildcardSlug}.${this.config.platformDomain}`);
      }

      if (!tenant) {
        return { type: 'not-found', hostname: cleanHost };
      }
      if (tenant.status === 'suspended') {
        return { type: 'suspended', hostname: cleanHost, tenantName: tenant.name };
      }
      return { type: 'storefront', tenant };
    }

    // 5. Custom Domain (e.g. artisan.com.bd)
    const customTenant = await lookupDomainInKv(cleanHost);
    if (!customTenant) {
      return { type: 'not-found', hostname: cleanHost };
    }
    if (customTenant.status === 'suspended') {
      return { type: 'suspended', hostname: cleanHost, tenantName: customTenant.name };
    }

    return { type: 'storefront', tenant: customTenant };
  }
}
