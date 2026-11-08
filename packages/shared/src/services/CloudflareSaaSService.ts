/**
 * Cloudflare for SaaS - Custom Hostname API Client
 * Manages custom domains, SSL certificates, and DNS verification
 */

export interface CloudflareCustomHostnameConfig {
  accountId: string;
  zoneId: string;
  apiToken: string;
  cnameTarget: string; // e.g. "custom.shopnest.com"
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

export class CloudflareSaaSService {
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(private readonly config: CloudflareCustomHostnameConfig) {}

  private get headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a new Custom Hostname in Cloudflare for SaaS
   */
  async createCustomHostname(hostname: string): Promise<CustomHostnameResult> {
    const url = `${this.baseUrl}/zones/${this.config.zoneId}/custom_hostnames`;
    const payload = {
      hostname: hostname.toLowerCase(),
      ssl: {
        method: 'http',
        type: 'dv',
        settings: {
          min_tls_version: '1.2',
          http2: 'on',
        },
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudflare create custom hostname failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as { result: Record<string, unknown> };
    return this.parseHostnameResponse(data.result);
  }

  /**
   * Query status of an existing Custom Hostname
   */
  async getCustomHostname(hostnameId: string): Promise<CustomHostnameResult> {
    const url = `${this.baseUrl}/zones/${this.config.zoneId}/custom_hostnames/${hostnameId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });

    if (!res.ok) {
      throw new Error(`Cloudflare get custom hostname failed (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as { result: Record<string, unknown> };
    return this.parseHostnameResponse(data.result);
  }

  /**
   * Delete custom hostname when client disconnects domain
   */
  async deleteCustomHostname(hostnameId: string): Promise<void> {
    const url = `${this.baseUrl}/zones/${this.config.zoneId}/custom_hostnames/${hostnameId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`Cloudflare delete custom hostname failed (${res.status}): ${await res.text()}`);
    }
  }

  /**
   * Generate DNS CNAME setup instructions for merchants in Bengali & English
   */
  getDnsInstructions(hostname: string) {
    return {
      hostname,
      recordType: 'CNAME',
      name: hostname.startsWith('www.') ? 'www' : '@',
      target: this.config.cnameTarget,
      instructionsEn: `Add a CNAME record in your domain DNS provider pointing ${hostname} to "${this.config.cnameTarget}". SSL will be issued automatically within 10-15 minutes.`,
      instructionsBn: `আপনার ডোমেন ডিএনএস কন্ট্রোল প্যানেলে একটি CNAME রেকর্ড যোগ করুন। Name ঘরে "${hostname.startsWith('www.') ? 'www' : '@'}" এবং Target ঘরে "${this.config.cnameTarget}" দিন। ১০-১৫ মিনিটের মধ্যে স্বয়ংক্রিয়ভাবে ফ্রি SSL সার্টিফিকেট চালু হয়ে যাবে।`,
    };
  }

  private parseHostnameResponse(r: Record<string, unknown>): CustomHostnameResult {
    const ssl = (r.ssl as Record<string, unknown>) || {};
    const status = (ssl.status as string) || 'pending_validation';
    let sslStatus: CustomHostnameResult['sslStatus'] = 'pending_validation';

    if (status === 'active') sslStatus = 'active';
    else if (status.includes('fail')) sslStatus = 'failed';
    else if (status === 'pending_deployment') sslStatus = 'pending_deployment';

    return {
      id: r.id as string,
      hostname: r.hostname as string,
      sslStatus,
      verificationErrors: (ssl.validation_errors as string[]) || [],
      ownershipVerification: r.ownership_verification as CustomHostnameResult['ownershipVerification'],
      sslVerification: ssl.validation_records as CustomHostnameResult['sslVerification'],
    };
  }
}

