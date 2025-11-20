-- Create database (run this as superuser)
CREATE DATABASE plant_detection;

-- Connect to the plant_detection database and create the table
\c plant_detection;

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    image_path VARCHAR(255) NOT NULL,
    result VARCHAR(50) NOT NULL CHECK (result IN ('infected', 'not infected')),
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on timestamp for better query performance
CREATE INDEX idx_predictions_timestamp ON predictions(timestamp DESC);

-- Sample data (optional)
INSERT INTO predictions (image_path, result, confidence) VALUES
('sample1.jpg', 'infected', 0.85),
('sample2.jpg', 'not infected', 0.92),
('sample3.jpg', 'infected', 0.78);