-- 確保你的 Supabase 資料表結構如下：
-- 如果還沒創建，可以在 Supabase SQL Editor 中執行此腳本

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  inventory_1f INTEGER DEFAULT 0,
  inventory_2f INTEGER DEFAULT 0,
  inventory_warehouse INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建更新時間戳記的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 創建允許所有操作的政策（因為這是內部系統）
-- 注意：在生產環境中，你應該根據實際需求設置更嚴格的政策
CREATE POLICY "Enable all access for products" ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 創建分類資料表 (根據您的截圖，ID 為 UUID)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 Categories RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 創建 Categories 政策
CREATE POLICY "Enable all access for categories" ON categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 修改 products 資料表以包含分類 (使用 UUID 對應 categories.id)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
        ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id);
    END IF;
END $$;
