-- Fix missing timestamp column for warehouse inventory
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS inventory_warehouse_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure other timestamp columns exist as well
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS inventory_1f_updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS inventory_2f_updated_at TIMESTAMPTZ DEFAULT NOW();
