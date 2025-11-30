-- 修改庫存欄位類型從整數改為數值（支援小數點）
-- 使用 NUMERIC(10, 1) 表示最多 10 位數，其中 1 位小數

ALTER TABLE products
  ALTER COLUMN inventory_1f TYPE NUMERIC(10, 1),
  ALTER COLUMN inventory_2f TYPE NUMERIC(10, 1),
  ALTER COLUMN inventory_warehouse TYPE NUMERIC(10, 1);
