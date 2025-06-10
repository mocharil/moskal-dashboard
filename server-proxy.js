require('dotenv').config();
const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// Environment variables for APIs
const AUTH_API_BASE = process.env.VITE_AUTH_API_BASE;
const DATA_API_BASE = process.env.VITE_DATA_API_BASE;
const REPORT_API_BASE = process.env.VITE_REPORT_API_BASE;

// Environment variables for Elasticsearch
const ES_HOST = process.env.VITE_ES_HOST || process.env.ES_HOST; // Prioritize VITE_ES_HOST
const ES_USERNAME = process.env.VITE_ES_USERNAME || process.env.ES_USERNAME;
const ES_PASSWORD = process.env.VITE_ES_PASSWORD || process.env.ES_PASSWORD;

if (!AUTH_API_BASE) {
  console.error('ERROR: Missing VITE_AUTH_API_BASE environment variable.');
  // process.exit(1); // Decide if this is critical enough to stop the server
}
if (!DATA_API_BASE) {
  console.error('ERROR: Missing VITE_DATA_API_BASE environment variable.');
  // process.exit(1);
}
if (!REPORT_API_BASE) {
  console.error('ERROR: Missing VITE_REPORT_API_BASE environment variable.');
  // process.exit(1);
}

if (!ES_HOST) {
  console.error('ERROR: Missing ES_HOST or VITE_ES_HOST environment variable for Elasticsearch proxy.');
  process.exit(1);
}
if (!ES_USERNAME) {
  console.warn('WARNING: Missing ES_USERNAME or VITE_ES_USERNAME environment variable. Proceeding without username for Elasticsearch.');
}
if (!ES_PASSWORD) {
  console.warn('WARNING: Missing ES_PASSWORD or VITE_ES_PASSWORD environment variable. Proceeding without password for Elasticsearch.');
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

if (ES_HOST.startsWith('https://')) {
  esClientConfig.tls = {
    rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true,
  };
}

const client = new Client(esClientConfig);

client.ping()
  .then(() => console.log('Proxy server successfully connected to Elasticsearch'))
  .catch(e => console.error('Proxy server failed to connect to Elasticsearch:', e));

// Middleware
app.use(cors());
app.use(express.json());

// Proxy routes for different APIs
if (AUTH_API_BASE) {
  app.use('/auth-api', createProxyMiddleware({
    target: AUTH_API_BASE,
    changeOrigin: true,
    pathRewrite: {
      '^/auth-api': '', // remove /auth-api prefix
    },
    onProxyReq: (proxyReq, req, res) => {
      // console.log(`Proxying request to AUTH API: ${proxyReq.path}`);
    },
    onError: (err, req, res) => {
      console.error('Auth API Proxy Error:', err);
      res.status(500).send('Auth API Proxy Error');
    }
  }));
}

if (DATA_API_BASE) {
  app.use('/data-api', createProxyMiddleware({
    target: DATA_API_BASE,
    changeOrigin: true,
    pathRewrite: {
      '^/data-api': '', // remove /data-api prefix
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request to DATA API: ${proxyReq.path}`);
    },
    onError: (err, req, res) => {
      console.error('Data API Proxy Error:', err);
      res.status(500).send('Data API Proxy Error');
    }
  }));
}

if (REPORT_API_BASE) {
  app.use('/report-api', createProxyMiddleware({
    target: REPORT_API_BASE,
    changeOrigin: true,
    pathRewrite: {
      '^/report-api': '', // remove /report-api prefix
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request to REPORT API: ${proxyReq.path}`);
    },
    onError: (err, req, res) => {
      console.error('Report API Proxy Error:', err);
      res.status(500).send('Report API Proxy Error');
    }
  }));
}

// Proxy route for Elasticsearch (existing)
// Consider if the path '/api/reports' might conflict or if it's distinct enough.
// If it's meant for Elasticsearch only, it's fine.
app.post('/api/es/reports', async (req, res) => { // Changed path to /api/es/reports to be more specific
  try {
    const { index, query } = req.body;

    if (!index || !query) {
      return res.status(400).json({ error: 'Missing index or query in request body' });
    }

    console.log(`Proxying request to ES index: ${index}`);
    const esResponse = await client.search({
      index: index,
      body: {
        query: query.query,
        sort: query.sort,
        size: query.size
      }
    });

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

// app.listen(PORT, () => {
//   console.log(`API proxy server running on http://localhost:${PORT}`);
//   if (AUTH_API_BASE) console.log(`Proxying /auth-api to ${AUTH_API_BASE}`);
//   if (DATA_API_BASE) console.log(`Proxying /data-api to ${DATA_API_BASE}`);
//   if (REPORT_API_BASE) console.log(`Proxying /report-api to ${REPORT_API_BASE}`);
//   console.log(`Proxying Elasticsearch requests from /api/es/reports to ${ES_HOST}`);
// });
