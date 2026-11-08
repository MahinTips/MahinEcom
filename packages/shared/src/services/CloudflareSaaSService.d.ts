/**
 * Cloudflare for SaaS - Custom Hostname API Client
 * Manages custom domains, SSL certificates, and DNS verification
 */
export interface CloudflareCustomHostnameConfig {
    accountId: string;
    zoneId: string;
    apiToken: string;
    cnameTarget: string;
}
export interface CustomHostnameResult {
    id: string;
    hostname: string;
    sslStatus: 'pending_validation' | 'active' | 'failed' | 'pending_deployment';
    verificationErrors?: string[];
    ownershipVerification?: {
        type: string;
        name: string;
        value: string;
    };
    sslVerification?: {
        type: string;
        cnameName?: string;
        cnameTarget?: string;
        txt_name?: string;
        txt_value?: string;
    };
}
export declare class CloudflareSaaSService {
    private readonly config;
    private baseUrl;
    constructor(config: CloudflareCustomHostnameConfig);
    private get headers();
    /**
     * Create a new Custom Hostname in Cloudflare for SaaS
     */
    createCustomHostname(hostname: string): Promise<CustomHostnameResult>;
    /**
     * Query status of an existing Custom Hostname
     */
    getCustomHostname(hostnameId: string): Promise<CustomHostnameResult>;
    /**
     * Delete custom hostname when client disconnects domain
     */
    deleteCustomHostname(hostnameId: string): Promise<void>;
    /**
     * Generate DNS CNAME setup instructions for merchants in Bengali & English
     */
    getDnsInstructions(hostname: string): {
        hostname: string;
        recordType: string;
        name: string;
        target: string;
        instructionsEn: string;
        instructionsBn: string;
    };
    private parseHostnameResponse;
}
//# sourceMappingURL=CloudflareSaaSService.d.ts.map