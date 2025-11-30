-- ========================================
-- 完整診斷與修復 Supabase 權限問題
-- ========================================
-- 請在 Supabase SQL Editor 中逐步執行以下指令

-- 步驟 1: 檢查當前 RLS 狀態
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'products');

-- 步驟 2: 查看現有的政策
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('categories', 'products');

-- 步驟 3: 刪除所有現有的政策 (避免衝突)
DROP POLICY IF EXISTS "Enable all access for categories" ON categories;
DROP POLICY IF EXISTS "Enable all access for products" ON products;

-- 步驟 4: 重新創建正確的政策
-- Categories 表的完整權限
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users" ON categories
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON categories
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON categories
  FOR DELETE
  USING (true);

-- Products 表的完整權限
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users" ON products
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON products
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON products
  FOR DELETE
  USING (true);

-- 步驟 5: 確保 RLS 已啟用
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 步驟 6: 驗證設定
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('categories', 'products')
ORDER BY tablename, cmd;

-- 步驟 7: 測試插入 (應該成功)
INSERT INTO categories (name) VALUES ('測試分類');

-- 步驟 8: 查看結果
SELECT * FROM categories;

-- 步驟 9: 清理測試資料 (可選)
-- DELETE FROM categories WHERE name = '測試分類';
