-- 建立設定表來儲存系統說明文字
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- 插入預設的說明文字
INSERT INTO settings (key, value, updated_by)
VALUES ('inventory_description', '這是千奇庫存管理系統的使用說明。您可以在此處查看和編輯系統說明。', 'system')
ON CONFLICT (key) DO NOTHING;

-- 啟用 RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 建立 RLS 政策：允許所有已認證使用者讀取
CREATE POLICY "Allow authenticated users to read settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (true);

-- 建立 RLS 政策：允許所有已認證使用者更新
CREATE POLICY "Allow authenticated users to update settings"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 建立 RLS 政策：允許所有已認證使用者插入
CREATE POLICY "Allow authenticated users to insert settings"
  ON settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
