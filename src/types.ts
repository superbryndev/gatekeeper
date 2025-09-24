export interface FraudDetectionDataInterface {
  timestampIso: string;
  timezone: string;
  userAgent: string;
  platform: string;
  deviceMemoryGb: number;
  hardwareConcurrency: number;
  language: string;
  languages: string[];
  touchSupport: boolean;
  webglRenderer?: string;
  canvasFingerprint?: string;
  signals: {
    navigatorWebdriver: boolean;
    uaContainsHeadless: boolean;
    chromeObject: boolean;
    permissionsQuery: boolean;
    pluginsLength: number;
  };
  screen: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  cookiesEnabled: boolean;
  storage: {
    localStorageEnabled: boolean;
    sessionStorageEnabled: boolean;
    indexedDbEnabled: boolean;
  };
  geolocation: {
    latitude: number;
    longitude: number;
  };
  timing: {
    pageLoadTime: number;
    domReadyTime: number;
    firstInteractionDelay?: number;
  };
  phoneNumber?: string;
}

export interface FraudDetectionResponseInterface {
  fraudScore: number; // 0-100
  isLikelyBot: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  action: 'allow' | 'challenge' | 'block';
  requestId: string;
}

export type ApiClientOptions = {
  apiUrl?: string;
};


