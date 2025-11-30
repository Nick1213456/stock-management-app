-- 重新啟用 RLS 並設定正確的政策
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Products 表的政策
CREATE POLICY "Allow authenticated users to view products"
ON products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update products"
ON products FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete products"
ON products FOR DELETE
TO authenticated
USING (true);

-- Categories 表的政策
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
