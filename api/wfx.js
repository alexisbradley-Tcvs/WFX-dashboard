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
    // Step 1: Get OAuth access token
    const tokenResponse = await fetch('https://api.wfxondemand.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`OAuth Token Error: ${tokenResponse.status} - ${errorText}`);
      return res.status(tokenResponse.status).json({ 
        error: `Failed to get OAuth token: ${tokenResponse.status}`,
        details: errorText
      });
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Step 2: Use access token to fetch data
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
