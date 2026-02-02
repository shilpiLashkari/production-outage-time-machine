const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Correlation ID & Logging
app.use((req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: 'api-gateway',
        message: 'Request received',
        correlationId: req.correlationId,
        method: req.method,
        url: req.url
    }));
    res.setHeader('x-correlation-id', req.correlationId);
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'api-gateway' });
});

// Auth Routes (Mock Proxy)
// app.use('/auth/v1', createProxyMiddleware({ target: 'http://localhost:3002/v1', changeOrigin: true }));

// Ingestion Routes (Mock Proxy)
// app.use('/ingest/v1', createProxyMiddleware({ target: 'http://localhost:3001/v1', changeOrigin: true }));

// Replay Routes (Mock Proxy)
// app.use('/replay/v1', createProxyMiddleware({ target: 'http://localhost:3003/v1', changeOrigin: true }));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        service: 'api-gateway',
        message: err.message,
        correlationId: req.correlationId,
        stack: err.stack
    }));

    res.status(500).json({
        error: {
            code: 'GATEWAY_ERROR',
            message: 'Gateway encountered an error',
            severity: 'ERROR',
            recoverable: true
        }
    });
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
