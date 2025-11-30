-- Add columns to track who modified the records
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS last_modified_by TEXT,
ADD COLUMN IF NOT EXISTS inventory_1f_updated_by TEXT,
ADD COLUMN IF NOT EXISTS inventory_2f_updated_by TEXT,
ADD COLUMN IF NOT EXISTS inventory_warehouse_updated_by TEXT;

-- Update RLS policies to allow authenticated users to read/write
-- (Assuming we want to allow any logged-in user to edit for now, based on "convenient permission setting")
-- You might want to restrict this later, but for now we ensure authenticated users can access.

-- Enable RLS if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy for viewing products (allow authenticated users)
CREATE POLICY "Allow authenticated users to view products"
ON products FOR SELECT
TO authenticated
USING (true);

-- Policy for inserting products (allow authenticated users)
CREATE POLICY "Allow authenticated users to insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating products (allow authenticated users)
CREATE POLICY "Allow authenticated users to update products"
ON products FOR UPDATE
TO authenticated
USING (true);

-- Policy for deleting products (allow authenticated users)
CREATE POLICY "Allow authenticated users to delete products"
ON products FOR DELETE
TO authenticated
USING (true);

-- Repeat for categories
CREATE POLICY "Allow authenticated users to view categories"
ON categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categories"
ON categories FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete categories"
ON categories FOR DELETE
TO authenticated
USING (true);
