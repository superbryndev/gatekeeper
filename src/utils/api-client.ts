import { FraudDetectionDataInterface, FraudDetectionResponseInterface } from '../types';

export type ApiClientConfig = {
  apiKey: string;
};

export class ApiClient {
  private apiKey: string;

  constructor(config: ApiClientConfig) {
    this.apiKey = config.apiKey;
  }

  private looksLikeJwt(token: string): boolean {
    try {
      // Basic heuristic: three base64url sections separated by dots
      return typeof token === 'string' && token.split('.').length === 3;
    } catch {
      return false;
    }
  }

  private getApiBaseUrl(): string {
    try {
      const overridden = (window as any).__GATEKEEPER_API_URL__;
      if (typeof overridden === 'string' && overridden) return overridden.replace(/\/$/, '');
    } catch {}
    // Production backend URL - update this to your actual backend
    return 'https://gatekeeper-backend-58h2.onrender.com';
  }

  private isPrintMode(): boolean {
    try {
      return !!(window as any).__GATEKEEPER_PRINT__;
    } catch {
      return false;
    }
  }

  private isDebugMode(): boolean {
    try {
      return !!(window as any).__GATEKEEPER_DEBUG__;
    } catch {
      return false;
    }
  }

  private getDebugJWT(): string {
    // Placeholder JWT for testing - expires in 1 hour
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: 'test-user', 
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      scope: 'phone-check'
    }));
    const signature = 'debug-signature';
    return `${header}.${payload}.${signature}`;
  }

  async phoneScore(phoneNumber: string, data: FraudDetectionDataInterface): Promise<FraudDetectionResponseInterface> {
    if (this.isPrintMode()) {
      try {
        // eslint-disable-next-line no-console
        console.log('[gatekeeper] Debug print payload:', { phoneNumber, data });
      } catch {}
      return {
        fraudScore: 0,
        isLikelyBot: false,
        riskLevel: 'low',
        reasons: ['debug-print-mode'],
        action: 'allow',
        requestId: `dbg_${Math.random().toString(36).slice(2, 10)}`
      };
    }

    const url = `${this.getApiBaseUrl()}/api/fraud/phone-score`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    try {
      // Use debug JWT if debug mode is enabled, otherwise use provided apiKey
      const token = this.isDebugMode() ? this.getDebugJWT() : this.apiKey;
      if (!this.isDebugMode() && !this.looksLikeJwt(token)) {
        try { console.warn('[gatekeeper] Provided API key does not look like a JWT. Expecting a Bearer JWT.'); } catch {}
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phoneNumber, ...data }),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        const errorMessage = `Gatekeeper API error (${res.status}): ${errorText}`;
        
        // Provide specific error types for common HTTP status codes
        if (res.status === 401) {
          throw new Error(`${errorMessage}. Please check your API key.`);
        } else if (res.status === 403) {
          throw new Error(`${errorMessage}. Access forbidden - check your API key permissions.`);
        } else if (res.status === 429) {
          throw new Error(`${errorMessage}. Rate limit exceeded - please try again later.`);
        } else if (res.status >= 500) {
          throw new Error(`${errorMessage}. Server error - please try again later.`);
        }
        
        throw new Error(errorMessage);
      }

      const json = await res.json();
      
      // Validate the response structure
      if (!json || typeof json !== 'object') {
        throw new Error('Gatekeeper API returned invalid response format');
      }

      return json as FraudDetectionResponseInterface;
      
    } catch (error) {
      // Handle network errors and timeouts
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Gatekeeper API request timed out after 10 seconds');
        }
        if (error.message.includes('fetch')) {
          throw new Error(`Gatekeeper API network error: ${error.message}`);
        }
        // Re-throw our custom errors
        throw error;
      }
      
      // Fallback for unknown errors
      throw new Error('Gatekeeper API: An unexpected error occurred');
    } finally {
      clearTimeout(timeout);
    }
  }
}


