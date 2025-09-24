import { useState } from 'react';
import { GateKeeper } from '../../src/index';

export default function App() {
  const [result, setResult] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>('+1234567890');

  const handleSubmit = async () => {
    // Enable debug mode for placeholder JWT, or print mode for debug output
    // @ts-ignore
    window.__GATEKEEPER_DEBUG__ = true;
    // @ts-ignore
    window.__GATEKEEPER_PRINT__ = true;
    // In debug mode, any string will be ignored and a placeholder JWT will be used
    const detector = new GateKeeper('any-string-will-be-ignored-in-debug-mode');
    setError(null);
    setResult(null);
    setClientData(null);
    try {
      const d = await detector.collectClientData();
      setClientData(d);
      const r = await detector.checkPhoneNumber(phone || '+1234567890');
      setResult(r);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  };

  return (
    <div>
      <h1>Gatekeeper React Example</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>
          Phone Number:&nbsp;
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15551234567" />
        </label>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
      <h3>Collected Client Data</h3>
      <pre>{JSON.stringify(clientData, null, 2)}</pre>
      <h3>API Result</h3>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}


