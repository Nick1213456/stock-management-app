-- 為 products 資料表添加操作人員欄位
-- 請在 Supabase SQL Editor 中執行此腳本

-- 添加操作人員欄位
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS inventory_1f_updated_by TEXT,
ADD COLUMN IF NOT EXISTS inventory_2f_updated_by TEXT,
ADD COLUMN IF NOT EXISTS inventory_war_updated_by TEXT;

-- 驗證欄位已添加
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE '%updated_by%';
