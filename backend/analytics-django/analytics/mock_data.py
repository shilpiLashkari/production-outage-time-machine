MOCK_CANDIDATES = [
    {
        "type": "CONFIG_CHANGE",
        "key": "JWT_EXPIRY",
        "delta": "15m -> 5ms",
        "time_diff_seconds": 120,
        "confidence": 0.85
    },
    {
        "type": "DEPLOYMENT",
        "version": "v1.4.2",
        "actor": "ci-bot",
        "time_diff_seconds": 300,
        "confidence": 0.60
    },
    {
        "type": "FEATURE_FLAG",
        "flag": "new-auth-flow",
        "state": "ON",
        "time_diff_seconds": 1800,
        "confidence": 0.35
    }
]
