-- PostgreSQL Schema for Time-Bucket Snapshots
-- Table: snapshots
-- Partitioned by month for efficient retention management

CREATE TABLE snapshots (
    id UUID PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    state_payload JSONB NOT NULL, -- Full system state at this time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (snapshot_time);

-- Indexes
CREATE INDEX idx_snapshots_service_time ON snapshots (service_name, snapshot_time DESC);

-- Partitions (Example)
CREATE TABLE snapshots_2026_01 PARTITION OF snapshots
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE snapshots_2026_02 PARTITION OF snapshots
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
