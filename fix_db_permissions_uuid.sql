-- 修復權限問題的腳本 (針對 UUID 架構)
-- 請在 Supabase SQL Editor 中執行此腳本

-- 1. 確保 Categories 的 RLS 政策正確 (允許所有操作)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for categories" ON categories;
CREATE POLICY "Enable all access for categories" ON categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. 確保 Products 的 RLS 政策正確
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for products" ON products;
CREATE POLICY "Enable all access for products" ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. 檢查 categories.id 是否有預設值 (gen_random_uuid)
-- 您的截圖顯示已經設定正確，這只是雙重確認
DO $$
BEGIN
  -- 如果 id 沒有預設值，則加上 gen_random_uuid()
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'id' AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE categories ALTER COLUMN id SET DEFAULT gen_random_uuid();
  END IF;
END $$;
