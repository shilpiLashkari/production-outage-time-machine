const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Middleware: Correlation ID & Logging
app.use((req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: 'ingestion-node',
        message: 'Request received',
        correlationId: req.correlationId,
        method: req.method,
        url: req.url
    }));
    res.setHeader('x-correlation-id', req.correlationId);
    next();
});

// Mock Rate Limiter (Token Bucket)
const rateLimits = {}; // In-memory for now (Would be Redis)
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 1000;

const rateLimiter = (req, res, next) => {
    const service = req.body.service || 'unknown';
    const now = Date.now();

    if (!rateLimits[service]) {
        rateLimits[service] = { count: 0, reset: now + RATE_LIMIT_WINDOW };
    }

    if (now > rateLimits[service].reset) {
        rateLimits[service] = { count: 0, reset: now + RATE_LIMIT_WINDOW };
    }

    rateLimits[service].count++;

    if (rateLimits[service].count > MAX_REQUESTS) {
        return res.status(429).json({
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Ingestion rate limit exceeded for service',
                severity: 'WARNING',
                recoverable: true
            }
        });
    }
    next();
};

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'ingestion-node' });
});

app.post('/v1/events', rateLimiter, (req, res) => {
    const { type, service, timestamp, payload } = req.body;

    // Multi-Region Clock Skew Handling (Lamport Logical Clock)
    // We increment a logical counter for strict ordering even if loose clock sync exists
    const logicalTimestamp = Date.now() + Math.random(); // Simulation of monotonic counter

    // 1. Schema Validation (Simplified)
    if (!type || !service || !timestamp || !payload) {
        return res.status(400).json({
            error: {
                code: 'INVALID_SCHEMA',
                message: 'Missing required event fields',
                severity: 'ERROR',
                recoverable: false
            }
        });
    }

    // 2. Async Processing (Async Queue Pattern)
    // In prod: await messageBroker.send('snapshot-queue', { type, service, timestamp, payload });
    // Simulation:
    setTimeout(() => {
        console.log(`[Async Worker] Processing snapshot update for service: ${service}`);
        // Logic: Check if snapshot count > 1000 -> Trigger snapshot build
    }, 100);

    // 3. Append-only Storage (Mock)
    console.log(`[DB] Event stored (Append-Only): ${type} | TraceID: ${req.correlationId}`);

    res.status(202).json({
        status: 'ACCEPTED',
        traceId: req.correlationId
    });
});

app.listen(PORT, () => {
    console.log(`Ingestion Service running on port ${PORT}`);
});
