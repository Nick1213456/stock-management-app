-- Check if the user tracking columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN (
  'last_modified_by',
  'inventory_1f_updated_by',
  'inventory_2f_updated_by',
  'inventory_warehouse_updated_by'
);
