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
    // Try Method 1: Standard OAuth with form data
    let tokenResponse = await fetch('https://api.wfxondemand.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    });
    
    // Try Method 2: OAuth with Basic Auth header
    if (!tokenResponse.ok) {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      tokenResponse = await fetch('https://api.wfxondemand.com/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });
    }
    
    // Try Method 3: OAuth with JSON body
    if (!tokenResponse.ok) {
      tokenResponse = await fetch('https://api.wfxondemand.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret
        })
      });
    }
    
    // Try Method 4: Different OAuth endpoint path
    if (!tokenResponse.ok) {
      tokenResponse = await fetch('https://api.wfxondemand.com/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
      });
    }
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`All OAuth methods failed: ${tokenResponse.status} - ${errorText}`);
      return res.status(tokenResponse.status).json({ 
        error: `Failed to get OAuth token after trying multiple methods: ${tokenResponse.status}`,
        details: errorText,
        hint: 'Please check WFX API documentation for correct OAuth endpoint and format'
      });
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      return res.status(500).json({
        error: 'No access token in response',
        tokenData: tokenData
      });
    }
    
    // Use access token to fetch data
    const response = await fetch(`https://api.wfxondemand.com/api/v1/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`WFX API Error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `WFX API returned ${response.status}`,
        details: errorText
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
