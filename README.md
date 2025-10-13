# Gatekeeper

🛡️ **Client-side bot and fraud detection for voice AI applications**

Gatekeeper is a powerful, lightweight library that helps protect your voice AI applications from bots and fraudulent activities. It collects comprehensive client-side fingerprinting data and analyzes phone numbers to provide real-time fraud detection.

## Features

- 🤖 **Bot Detection**: Advanced client-side bot detection using multiple signals
- 📱 **Phone Validation**: Real-time phone number fraud scoring
- 🔍 **Device Fingerprinting**: Comprehensive browser and device analysis
- ⚡ **Lightning Fast**: Optimized for minimal performance impact
- 🔧 **Easy Integration**: Works with React, vanilla JS, and any web framework
- 🛡️ **Privacy Focused**: No invasive tracking, respects user privacy
- 📦 **Zero Dependencies**: Lightweight with no external dependencies

## Installation

[![Integrating gatekeeper to your outbound agent](https://img.youtube.com/vi/49zP7QRdQhQ/maxresdefault.jpg)](https://www.youtube.com/watch?v=49zP7QRdQhQ)


### NPM Package (Recommended)

```bash
npm install @superbryn/gatekeeper
```

### CDN/Script Tag (Vanilla JS)

```html
<script src="https://unpkg.com/@superbryn/gatekeeper@latest/dist/gatekeeper-script.js"></script>
```

## Quick Start

### React/Modern JavaScript

```javascript
import { GateKeeper } from '@superbryn/gatekeeper';

// Initialize with your API key
const gatekeeper = new GateKeeper('your-api-key-here');

// Check a phone number for fraud
async function checkPhone(phoneNumber) {
  const result = await gatekeeper.checkPhoneNumber(phoneNumber);
  
  console.log('Fraud Score:', result.fraudScore); // 0-100
  console.log('Risk Level:', result.riskLevel);   // low, medium, high, critical
  console.log('Action:', result.action);         // allow, challenge, block
  
  if (result.action === 'block') {
    alert('This phone number has been flagged as high risk');
    return false;
  }
  
  return true;
}

// Usage in your app
const phoneNumber = '+1234567890';
const isPhoneSafe = await checkPhone(phoneNumber);
```

### Vanilla JavaScript (Script Tag)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/@superbryn/gatekeeper@latest/dist/gatekeeper-script.js"></script>
</head>
<body>
  <script>
    // Initialize Gatekeeper
    const gatekeeper = new Gatekeeper.GateKeeper('your-api-key-here');
    
    // Function to check phone number
    async function checkPhoneNumber() {
      const phoneInput = document.getElementById('phone');
      const phoneNumber = phoneInput.value;
      
      try {
        const result = await gatekeeper.checkPhoneNumber(phoneNumber);
        
        // Handle the result
        if (result.action === 'allow') {
          console.log('✅ Phone number verified - proceeding with call');
          // Proceed with your voice AI call
        } else if (result.action === 'challenge') {
          console.log('⚠️ Additional verification needed');
          // Show additional verification step
        } else if (result.action === 'block') {
          console.log('❌ Phone number blocked due to high fraud risk');
          alert('Unable to place call - high fraud risk detected');
          return;
        }
        
      } catch (error) {
        console.error('Fraud check error:', error.message);
        // Decide whether to fail open or closed
        console.log('⚠️ Proceeding despite error (fail open)');
      }
    }
    
    // Attach to your call button
    document.getElementById('call-button').addEventListener('click', checkPhoneNumber);
  </script>
  
  <input type="tel" id="phone" placeholder="Enter phone number">
  <button id="call-button">Make Call</button>
</body>
</html>
```

### Node.js/Server-side (for testing)

```javascript
// Note: This is primarily a client-side library
// Server-side usage is limited due to browser-specific fingerprinting
const { GateKeeper } = require('@superbryn/gatekeeper');

const gatekeeper = new GateKeeper('your-api-key-here');

// You can only collect basic data server-side
async function checkPhone(phoneNumber) {
  try {
    // This will work but with limited fingerprinting data
    const result = await gatekeeper.checkPhoneNumber(phoneNumber);
    return result;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}
```

## API Reference

### `new GateKeeper(apiKey)`

Creates a new Gatekeeper instance.

**Parameters:**
- `apiKey` (string): Your Gatekeeper API key

**Throws:**
- `Error`: If apiKey is missing or invalid

### `checkPhoneNumber(phoneNumber)`

Analyzes a phone number for fraud indicators.

**Parameters:**
- `phoneNumber` (string): The phone number to check (any format)

**Returns:**
- `Promise<FraudDetectionResponseInterface>`: Fraud analysis result

**Example Response:**
```javascript
{
  fraudScore: 25,           // 0-100 (higher = more suspicious)
  isLikelyBot: false,       // Boolean bot detection result
  riskLevel: 'low',         // 'low' | 'medium' | 'high' | 'critical'
  reasons: [                // Array of detection reasons
    'clean_device_fingerprint',
    'valid_phone_format'
  ],
  action: 'allow',          // 'allow' | 'challenge' | 'block'
  requestId: 'req_abc123'   // Unique request identifier
}
```

### `collectClientData()`

Collects browser fingerprinting data without making an API call.

**Returns:**
- `Promise<FraudDetectionDataInterface>`: Raw fingerprinting data

**Use Cases:**
- Debugging
- Custom fraud logic
- Data analysis

## Configuration

### Environment Variables

You can override the API endpoint for testing:

```javascript
// Set before loading the library
window.__GATEKEEPER_API_URL__ = 'https://your-custom-api.com';

// Enable debug mode (uses mock responses)
window.__GATEKEEPER_DEBUG__ = true;

// Enable request logging
window.__GATEKEEPER_PRINT__ = true;
```

### Error Handling Best Practices

```javascript
async function safePhoneCheck(phoneNumber) {
  try {
    const result = await gatekeeper.checkPhoneNumber(phoneNumber);
    
    // Always check the action field
    switch (result.action) {
      case 'allow':
        return { allowed: true, result };
      
      case 'challenge':
        // Implement additional verification
        return { allowed: false, requiresChallenge: true, result };
      
      case 'block':
        return { allowed: false, blocked: true, result };
      
      default:
        // Unknown action - fail safely
        console.warn('Unknown action:', result.action);
        return { allowed: true, result }; // Fail open
    }
    
  } catch (error) {
    console.error('Gatekeeper error:', error.message);
    
    // Decide your fail-safe behavior
    if (error.message.includes('network') || error.message.includes('timeout')) {
      // Network issues - maybe retry or fail open
      return { allowed: true, error: error.message };
    } else if (error.message.includes('API key')) {
      // Configuration issue - fail closed for security
      return { allowed: false, error: error.message };
    } else {
      // Unknown error - your choice
      return { allowed: true, error: error.message };
    }
  }
}
```


## Data Collection

Gatekeeper collects the following client-side data for fraud analysis:

### Device Information
- User agent and platform
- Device memory and hardware concurrency
- Screen and viewport dimensions
- Touch support capability

### Browser Signals
- WebGL renderer information
- Canvas fingerprinting
- Navigator.webdriver detection
- Plugin information
- Storage capabilities

### Behavioral Data
- Page load timing
- Geolocation (with permission)
- Language preferences
- Timezone information

### Privacy Notes
- All data collection is transparent and documented
- No persistent tracking across sessions
- Geolocation requires explicit user permission
- No personal information is collected beyond what's provided

## Troubleshooting

### Common Issues

**"API key does not look like a JWT"**
- Ensure you're using a valid JWT token from your Gatekeeper dashboard
- Check that the API key isn't truncated or corrupted

**"Network error" or timeouts**
- Check your internet connection
- Verify the API endpoint is accessible
- Consider implementing retry logic for network issues


**CORS errors**
- Ensure your domain is whitelisted in your Gatekeeper dashboard
- Check that you're using the correct API endpoint

### Debug Mode

Enable debug mode for testing:

```javascript
// Enable debug mode before creating GateKeeper instance
window.__GATEKEEPER_DEBUG__ = true;
window.__GATEKEEPER_PRINT__ = true;

const gatekeeper = new GateKeeper('any-string-in-debug-mode');
```

In debug mode:
- API calls return mock responses
- All requests are logged to console
- No actual API key validation occurs

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## TypeScript Support

Full TypeScript support is included:

```typescript
import { GateKeeper, FraudDetectionResponseInterface } from '@superbryn/gatekeeper';

const gatekeeper = new GateKeeper('your-api-key');

async function checkPhone(phone: string): Promise<FraudDetectionResponseInterface> {
  return await gatekeeper.checkPhoneNumber(phone);
}
```

## Integration Examples

### VAPI Integration

```javascript
import { GateKeeper } from '@superbryn/gatekeeper';
import Vapi from '@vapi-ai/web-sdk';

const gatekeeper = new GateKeeper('gk-YOUR-API-KEY');
const vapi = new Vapi('vapi-YOUR-API-KEY');

async function makeProtectedCall(phoneNumber, assistantId) {
  const fraudCheck = await gatekeeper.checkPhoneNumber(phoneNumber);
  
  if (fraudCheck.action === 'challenge') {
    console.log('Additional verification required');
  }
  
  const call = await vapi.call({
    phoneNumber,
    assistantId,
    metadata: {
      fraudScore: fraudCheck.fraudScore,
      riskLevel: fraudCheck.riskLevel
    }
  });
  
  return call;
}
```

### LiveKit Integration

```javascript
import { GateKeeper } from '@superbryn/gatekeeper';
import { OutboundCall } from '@livekit/outbound';

const gatekeeper = new GateKeeper('gk-YOUR-API-KEY');
const outboundCall = new OutboundCall({
  apiKey: 'lk-YOUR-API-KEY',
  apiSecret: 'lk-YOUR-SECRET',
  livekitUrl: 'wss://your-livekit-server.com'
});

async function makeOutboundCall(phoneNumber, agentConfig) {
  const fraudCheck = await gatekeeper.checkPhoneNumber(phoneNumber);
  
  const call = await outboundCall.createCall({
    phoneNumber,
    agentConfig: {
      ...agentConfig,
      metadata: {
        fraudScore: fraudCheck.fraudScore,
        riskLevel: fraudCheck.riskLevel
      }
    }
  });
  
  return call;
}
```

### Retell Integration

```javascript
import { GateKeeper } from '@superbryn/gatekeeper';

const gatekeeper = new GateKeeper('gk-YOUR-API-KEY');

async function makeRetellCall(phoneNumber, agentId) {
  const fraudCheck = await gatekeeper.checkPhoneNumber(phoneNumber);
  
  const response = await fetch('https://api.retellai.com/create-phone-call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      agent_id: agentId,
      metadata: {
        fraudScore: fraudCheck.fraudScore,
        riskLevel: fraudCheck.riskLevel
      }
    })
  });
  
  return response.json();
}
```

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

MIT License - see LICENSE file for details.

---

**Made with ❤️ for the voice AI community**
