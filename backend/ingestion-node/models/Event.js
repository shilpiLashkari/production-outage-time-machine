const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
    type: {
        type: String,
        required: true,
        enum: ['DEPLOYMENT', 'CONFIG_CHANGE', 'FEATURE_FLAG', 'METRIC', 'AUTH_POLICY']
    },
    service: { type: String, required: true },
    timestamp: { type: Date, required: true, index: true },
    schemaVersion: { type: Number, default: 1 },
    actor: { type: String }, // e.g., "ci-pipeline", "john.doe"
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    metadata: { type: Map, of: String }
}, {
    timestamps: true,
    collection: 'events'
});

// TTL Index for Data Retention Policy (30 Days)
EventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Compound Index for Replay Queries
EventSchema.index({ service: 1, timestamp: 1 });

module.exports = mongoose.model('Event', EventSchema);
