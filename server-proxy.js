require('dotenv').config();
const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// Environment variables for Elasticsearch
const ES_HOST = process.env.ES_HOST;
const ES_USERNAME = process.env.ES_USERNAME;
const ES_PASSWORD = process.env.ES_PASSWORD;

if (!ES_HOST) {
  console.error('ERROR: Missing ES_HOST environment variable for Elasticsearch proxy.');
  process.exit(1);
}
// Username and password can be optional depending on ES setup
if (!ES_USERNAME) {
  console.warn('WARNING: Missing ES_USERNAME environment variable. Proceeding without username for Elasticsearch.');
}
if (!ES_PASSWORD) {
  console.warn('WARNING: Missing ES_PASSWORD environment variable. Proceeding without password for Elasticsearch.');
}

const esClientConfig = {
  node: ES_HOST,
};

if (ES_USERNAME && ES_PASSWORD) {
  esClientConfig.auth = {
    username: ES_USERNAME,
    password: ES_PASSWORD,
  };
}

// Add TLS configuration if your ES instance uses HTTPS and requires specific CA or rejects unauthorized CAs
// For example, if your ES_HOST starts with https://
if (ES_HOST.startsWith('https://')) {
  esClientConfig.tls = {
    // Be cautious with rejectUnauthorized: false in production.
    // Prefer to use a proper CA certificate.
    rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true,
  };
}

const client = new Client(esClientConfig);

// Test Elasticsearch connection
client.ping()
  .then(() => console.log('Proxy server successfully connected to Elasticsearch'))
  .catch(e => console.error('Proxy server failed to connect to Elasticsearch:', e));

// Middleware
app.use(cors()); // Enable CORS for all routes - allows your frontend (localhost:5173) to call this proxy
app.use(express.json()); // Parse JSON request bodies

// Proxy route for Elasticsearch
app.post('/api/reports', async (req, res) => {
  try {
    const { index, query } = req.body;

    if (!index || !query) {
      return res.status(400).json({ error: 'Missing index or query in request body' });
    }

    console.log(`Proxying request to ES index: ${index}`);
    const esResponse = await client.search({
      index: index,
      body: { // Ensure the body structure matches what ES expects (query, sort, etc.)
        query: query.query,
        sort: query.sort,
        size: query.size // Pass size if provided by client
      }
    });

    // Send back the relevant part of the Elasticsearch response
    res.json({
      hits: {
        hits: esResponse.hits.hits,
        total: esResponse.hits.total
      }
    });
  } catch (error) {
    console.error('Elasticsearch proxy error:', error.meta ? error.meta.body : error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(error.statusCode || 500).json({
      error: 'Failed to fetch from Elasticsearch via proxy',
      message: errorMessage,
      details: error.meta ? error.meta.body : error.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`Elasticsearch proxy server running on http://localhost:${PORT}`);
});
