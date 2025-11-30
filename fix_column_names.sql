-- 修正欄位名稱
ALTER TABLE products 
RENAME COLUMN inventory_war_updated_at TO inventory_warehouse_updated_at;

-- 同時檢查 updated_by 欄位名稱是否正確 (第 14 行看起來也是 war)
ALTER TABLE products 
RENAME COLUMN inventory_war_updated_by TO inventory_warehouse_updated_by;
