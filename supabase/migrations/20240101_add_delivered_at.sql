-- Add delivered_at column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Update existing delivered orders
UPDATE orders SET delivered_at = updated_at WHERE status = 'delivered' AND delivered_at IS NULL;
