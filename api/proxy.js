// File: api/proxy.js (for Vercel serverless functions)
export default async function handler(req, res) {
    const token = req.query.token;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing token parameter' });
    }
    
    try {
      const apiUrl = `https://task-management-backend-production-3436.up.railway.app/api/verify-email/${token}/`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      // Return the same status code and data from the original API
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Proxy error:', error);
      return res.status(500).json({ error: 'Error connecting to API server' });
    }
  }