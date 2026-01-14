CREATE TABLE IF NOT EXISTS uce_tracking (
    id UUID PRIMARY KEY,
    driver_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
