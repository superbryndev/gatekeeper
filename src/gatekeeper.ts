import { ClientDataCollector } from './ClientDataCollector';
import { ApiClient } from './utils/api-client';
import { FraudDetectionResponseInterface, FraudDetectionDataInterface } from './types';

export class GateKeeper {
  private apiKey: string;
  private collector: ClientDataCollector;

  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('GateKeeper: apiKey is required');
    }
    this.apiKey = apiKey;
    this.collector = new ClientDataCollector();
  }

  async checkPhoneNumber(phoneNumber: string): Promise<FraudDetectionResponseInterface> {
    try {
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        throw new Error('GateKeeper.checkPhoneNumber: phoneNumber is required and must be a string');
      }

      // Basic phone number validation
      const cleanPhone = phoneNumber.trim();
      if (cleanPhone.length === 0) {
        throw new Error('GateKeeper.checkPhoneNumber: phoneNumber cannot be empty');
      }

      const data = await this.collector.collect();
      return await this.makeApiCall({ phoneNumber: cleanPhone, data });
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw with context if it's already a proper error
        throw new Error(`GateKeeper.checkPhoneNumber failed: ${error.message}`);
      }
      throw new Error('GateKeeper.checkPhoneNumber failed: An unexpected error occurred');
    }
  }

  // Expose client data collection for debugging/testing and custom flows
  async collectClientData(): Promise<FraudDetectionDataInterface> {
    try {
      return await this.collector.collect();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GateKeeper.collectClientData failed: ${error.message}`);
      }
      throw new Error('GateKeeper.collectClientData failed: An unexpected error occurred');
    }
  }

  private async makeApiCall(payload: { phoneNumber: string; data: any }): Promise<FraudDetectionResponseInterface> {
    try {
      const client = new ApiClient({ apiKey: this.apiKey });
      return await client.phoneScore(payload.phoneNumber, payload.data);
    } catch (error) {
      if (error instanceof Error) {
        // API client errors are already well-formatted, just re-throw
        throw error;
      }
      throw new Error('GateKeeper API call failed: An unexpected error occurred');
    }
  }
}


