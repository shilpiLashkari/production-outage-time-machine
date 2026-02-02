const getMockSnapshot = (timestamp) => ({
    time: new Date(new Date(timestamp).getTime() - 3600000).toISOString(), // 1 hour ago
    state: {
        config: { JWT_EXPIRY: '15m' }, // Initial state
        flags: { 'new-auth-flow': false }
    }
});

const getMockEvents = (timestamp) => [
    {
        type: 'CONFIG_CHANGE',
        timestamp: new Date(new Date(timestamp).getTime() - 1800000).toISOString(),
        schemaVersion: 1,
        payload: { key: 'JWT_EXPIRY', value: '5m' }
    },
    {
        type: 'FEATURE_FLAG',
        timestamp: new Date(new Date(timestamp).getTime() - 900000).toISOString(),
        schemaVersion: 1,
        payload: { flag: 'new-auth-flow', enabled: true }
    }
];

module.exports = {
    getMockSnapshot,
    getMockEvents
};
