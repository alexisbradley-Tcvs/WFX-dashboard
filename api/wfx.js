module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { endpoint } = req.query;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint parameter required' });
  }
  
  const clientId = 'd68bfec110e04f0b9119bda5dda8e0e7';
  const clientSecret = 'tmu8oqSEFCftE6ovWoW2XZFB0yTWIXxwGPeMC1pa';
  
  try {
    // Method 1: Try as query parameters
    let url = `https://api.wfxondemand.com/api/v1/${endpoint}?client_id=${clientId}&client_secret=${clientSecret}`;
    let response = await fetch(url);
    
    // Method 2: Try with Basic Auth using client credentials
    if (!response.ok) {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      response = await fetch(`https://api.wfxondemand.com/api/v1/${endpoint}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Method 3: Try with API key header
    if (!response.ok) {
      response = await fetch(`https://api.wfxondemand.com/api/v1/${endpoint}`, {
        headers: {
          'X-API-Key': clientId,
          'X-API-Secret': clientSecret,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Method 4: Try with custom WFX headers
    if (!response.ok) {
      response = await fetch(`https://api.wfxondemand.com/api/v1/${endpoint}`, {
        headers: {
          'client-id': clientId,
          'client-secret': clientSecret,
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`All methods failed: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `All authentication methods failed: ${response.status}`,
        details: errorText,
        hint: 'Need to check Parabola settings to see exact authentication method'
      });
    }
    
    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
};
