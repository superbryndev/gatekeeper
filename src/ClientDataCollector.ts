import { FraudDetectionDataInterface } from './types';

function safeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function getCanvasFingerprint(): string | undefined {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = '#069';
    ctx.fillText('gatekeeper::canvas', 2, 2);
    ctx.strokeStyle = '#ff0';
    ctx.arc(100, 25, 20, 0, Math.PI);
    ctx.stroke();
    const dataUrl = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < dataUrl.length; i++) {
      hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
      hash |= 0;
    }
    return `c_${Math.abs(hash)}`;
  } catch {
    return undefined;
  }
}

function getWebglRenderer(): string | undefined {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return undefined;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info') as unknown as { UNMASKED_RENDERER_WEBGL?: number } | null;
    const param = debugInfo?.UNMASKED_RENDERER_WEBGL;
    const renderer = typeof param === 'number' ? gl.getParameter(param) : undefined;
    return typeof renderer === 'string' ? renderer : undefined;
  } catch {
    return undefined;
  }
}

async function getGeolocation(timeoutMs = 5000): Promise<{ latitude: number; longitude: number }> {
  try {
    if (!('geolocation' in navigator) || !navigator.geolocation) {
      return { latitude: 0, longitude: 0 };
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60000 });
    }).catch(() => undefined);
    clearTimeout(timeout);
    if (!position) return { latitude: 0, longitude: 0 };
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    return { latitude: 0, longitude: 0 };
  }
}

function getTiming(): FraudDetectionDataInterface['timing'] {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      const pageLoadTime = Math.max(0, nav.loadEventEnd - nav.startTime);
      const domReadyTime = Math.max(0, nav.domContentLoadedEventEnd - nav.startTime);
      return { pageLoadTime, domReadyTime };
    }
    const t = (performance as any).timing as PerformanceTiming | undefined;
    if (t) {
      const pageLoadTime = Math.max(0, t.loadEventEnd - t.navigationStart);
      const domReadyTime = Math.max(0, t.domContentLoadedEventEnd - t.navigationStart);
      return { pageLoadTime, domReadyTime };
    }
    return { pageLoadTime: 0, domReadyTime: 0 };
  } catch {
    return { pageLoadTime: 0, domReadyTime: 0 };
  }
}

export class ClientDataCollector {
  async collect(): Promise<FraudDetectionDataInterface> {
    const timestampIso = new Date().toISOString();
    const timezone = getTimezone();

    const userAgent = (() => { try { return navigator.userAgent || ''; } catch { return ''; } })();
    const platform = (() => { try { return navigator.platform || ''; } catch { return ''; } })();
    const deviceMemoryGb = (() => { try { return safeNumber((navigator as any).deviceMemory, 0); } catch { return 0; } })();
    const hardwareConcurrency = (() => { try { return safeNumber(navigator.hardwareConcurrency, 0); } catch { return 0; } })();
    const language = (() => { try { return navigator.language || ''; } catch { return ''; } })();
    const languages = (() => { try { return Array.isArray(navigator.languages) ? navigator.languages.slice(0, 8) : []; } catch { return []; } })();
    const touchSupport = (() => { try { return 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0; } catch { return false; } })();

    const webglRenderer = getWebglRenderer();
    const canvasFingerprint = getCanvasFingerprint();

    const signals = {
      navigatorWebdriver: (() => { try { return safeBoolean((navigator as any).webdriver, false); } catch { return false; } })(),
      uaContainsHeadless: (() => { try { return /headless|puppeteer|playwright|phantom/i.test(userAgent); } catch { return false; } })(),
      chromeObject: (() => { try { return typeof (window as any).chrome !== 'undefined'; } catch { return false; } })(),
      permissionsQuery: (() => { try { return typeof (navigator as any).permissions?.query === 'function'; } catch { return false; } })(),
      pluginsLength: (() => { try { return safeNumber(navigator.plugins?.length, 0); } catch { return 0; } })()
    };

    const screenInfo = {
      width: (() => { try { return safeNumber(screen.width, 0); } catch { return 0; } })(),
      height: (() => { try { return safeNumber(screen.height, 0); } catch { return 0; } })()
    };

    const viewport = {
      width: (() => { try { return safeNumber(window.innerWidth, 0); } catch { return 0; } })(),
      height: (() => { try { return safeNumber(window.innerHeight, 0); } catch { return 0; } })()
    };

    const cookiesEnabled = (() => { try { return safeBoolean(navigator.cookieEnabled, false); } catch { return false; } })();

    // Non-invasive capability checks (no write attempts)
    const localStorageEnabled = (() => { try { return typeof window.localStorage !== 'undefined'; } catch { return false; } })();
    const sessionStorageEnabled = (() => { try { return typeof window.sessionStorage !== 'undefined'; } catch { return false; } })();
    const indexedDbEnabled = (() => { try { return 'indexedDB' in window && !!window.indexedDB; } catch { return false; } })();

    const storage = { localStorageEnabled, sessionStorageEnabled, indexedDbEnabled };

    const [geolocation, timing] = await Promise.all([
      getGeolocation(5000),
      Promise.resolve(getTiming())
    ]);

    const data: FraudDetectionDataInterface = {
      timestampIso,
      timezone,
      userAgent,
      platform,
      deviceMemoryGb,
      hardwareConcurrency,
      language,
      languages,
      touchSupport,
      webglRenderer,
      canvasFingerprint,
      signals,
      screen: screenInfo,
      viewport,
      cookiesEnabled,
      storage,
      geolocation,
      timing
    };

    return data;
  }
}


