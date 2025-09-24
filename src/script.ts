// Standalone script version for non-React/non-bundler environments
import { GateKeeper } from './gatekeeper';
import type { FraudDetectionResponseInterface, FraudDetectionDataInterface } from './types';

// Global interface for the script version
interface GatekeeperGlobal {
  GateKeeper: typeof GateKeeper;
  FraudDetectionResponseInterface?: FraudDetectionResponseInterface;
  FraudDetectionDataInterface?: FraudDetectionDataInterface;
}

// Create a global namespace
const GatekeeperScript: GatekeeperGlobal = {
  GateKeeper
};

// Add to global scope for script usage
if (typeof window !== 'undefined') {
  (window as any).Gatekeeper = GatekeeperScript;
}

// Also support CommonJS/module environments
declare const module: any;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GatekeeperScript;
}

// Export for ES modules
export default GatekeeperScript;
export { GateKeeper };
export type { FraudDetectionResponseInterface, FraudDetectionDataInterface };
