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
  
  const apiKey = '96a4bfc75fc54a208b6f97a5515ed0f8';
  const apiSecret = 'ImkWN3EvY1FHB6H3Cl9HOKwOm9810euGp93VWx0w';
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  
  try {
    const response = await fetch(`https://api.wfxondemand.com/api/v1/${endpoint}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
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
