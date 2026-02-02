const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Standard Middleware: Correlation ID, Logging (To be moved to a shared lib or duplicated for now)
app.use((req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Request received',
        correlationId: req.correlationId,
        method: req.method,
        url: req.url
    }));
    res.setHeader('x-correlation-id', req.correlationId);
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'replay-engine' });
});

// RBAC Middleware (Data-Level Access Control)
const checkRole = (requiredRole) => (req, res, next) => {
    // Mock Token Decoding (In prod: verify JWT)
    const authHeader = req.headers['authorization'];
    const mockRole = authHeader === 'Bearer admin-token' ? 'admin' : 'viewer';

    if (requiredRole === 'admin' && mockRole !== 'admin') {
        return res.status(403).json({
            error: {
                code: 'ACCESS_DENIED',
                message: 'Insufficient permissions for full replay',
                severity: 'ERROR',
                recoverable: false
            }
        });
    }
    next();
};

// Apply RBAC to sensitive replay endpoint
app.use('/v1/replay', checkRole('viewer')); // Basic access

// Upcasting Logic (Schema Migration)
const upcastEvent = (event) => {
    // Example: V1 -> V2 (JWT_EXPIRY renamed to SESSION_TIMEOUT)
    if (event.schemaVersion === 1 && event.type === 'CONFIG_CHANGE' && event.payload.key === 'JWT_EXPIRY') {
        return {
            ...event,
            schemaVersion: 2,
            payload: {
                ...event.payload,
                key: 'SESSION_TIMEOUT' // New standard
            }
        };
    }
    return event;
}

// Replay Endpoint
app.get('/v1/replay/state', (req, res) => {
    const { timestamp, service, env } = req.query;

    if (!timestamp || !service) {
        return res.status(400).json({
            error: {
                code: 'INVALID_REQUEST',
                message: 'Timestamp and service are required',
                severity: 'ERROR',
                recoverable: false
            }
        });
    }

    // --- DETECTABLE DETERMINISTIC REPLAY LOGIC ---

    try {
        const { getMockSnapshot, getMockEvents } = require('./mockData');

        // 1. Load Latest Snapshot (Mock)
        // In prod: const snapshot = await db.snapshots.findOne({ service, timestamp: { $lte: targetTime } });
        const snapshot = getMockSnapshot(timestamp);

        // 2. Load Events (Mock)
        // In prod: const events = await db.events.find({ service, timestamp: { $gt: snapshot.time, $lte: targetTime } }).sort({ timestamp: 1 });
        let events = getMockEvents(timestamp);

        // 3. Upcasting (Schema Migration)
        events = events.map(upcastEvent);

        // 4. Apply Reducers (The Core)
        const applyReducer = (currentState, event) => {
            const newState = JSON.parse(JSON.stringify(currentState)); // Deep copy for immutability

            switch (event.type) {
                case 'CONFIG_CHANGE':
                    newState.config[event.payload.key] = event.payload.value;
                    break;
                case 'FEATURE_FLAG':
                    newState.flags[event.payload.flag] = event.payload.enabled;
                    break;
                // Add more reducers here
            }
            return newState;
        };

        const finalState = events.reduce(applyReducer, snapshot.state);

        // 5. Attach Metrics (Mock)
        const metrics = {
            latency_p95: 2300,
            errors: 18,
            timestamp: timestamp
        };

        // 6. Calculate Confidence
        // In prod: based on data completeness
        const confidence = 0.95;

        res.json({
            state: finalState,
            metrics,
            confidence,
            meta: {
                snapshotTime: snapshot.time,
                eventCount: events.length
            }
        });

    } catch (error) {
        next(error);
    }
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: err.message,
        correlationId: req.correlationId,
        stack: err.stack
    }));
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            severity: 'ERROR',
            recoverable: true
        }
    });
});

app.listen(PORT, () => {
    console.log(`Replay Engine running on port ${PORT}`);
});
