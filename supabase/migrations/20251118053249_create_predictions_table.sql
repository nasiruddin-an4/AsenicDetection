/*
  # Create predictions table for plant disease detection

  1. New Tables
    - `predictions`
      - `id` (uuid, primary key) - Unique identifier for each prediction
      - `image_path` (text) - Path/name of the uploaded image
      - `result` (text) - Prediction result (infected/not infected)
      - `confidence` (float) - Confidence score of the prediction (0-1)
      - `created_at` (timestamptz) - Timestamp when prediction was made
      - `user_id` (uuid, nullable) - Future support for user authentication

  2. Security
    - Enable RLS on `predictions` table
    - Add policy for public read access (for now, since auth isn't implemented)
    - Add policy for public insert access (for now, since auth isn't implemented)

  3. Indexes
    - Index on created_at for efficient sorting of recent predictions
*/

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_path text NOT NULL,
  result text NOT NULL,
  confidence float NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view predictions"
  ON predictions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert predictions"
  ON predictions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS predictions_created_at_idx ON predictions(created_at DESC);