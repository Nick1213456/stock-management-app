# 庫存管理系統

一個使用 React + Supabase + PWA 構建的簡易庫存管理系統。

## 功能特色

✨ **核心功能**
- 創建商品（包含 SKU 編號）
- 顯示商品在三個位置的庫存數量：
  - 📍 1F（一樓）
  - 📍 2F（二樓）
  - 🏭 倉庫
- 點擊庫存數量即可編輯
- 即時同步到 Supabase 資料庫

🎨 **設計特色**
- 現代化深色主題
- 漸層色彩與流暢動畫
- 響應式設計，支援手機和桌面
- PWA 支援，可安裝到手機主畫面

📱 **PWA 功能**
- ✅ **離線支援** - 無網路時仍可查看已快取的資料
- ✅ **安裝提示** - 可安裝到桌面或手機主畫面
- ✅ **自動更新** - 有新版本時自動提示更新
- ✅ **離線指示器** - 即時顯示網路連線狀態
- ✅ **智慧快取** - API 和靜態資源快取策略
- ✅ **獨立視窗** - 安裝後以獨立應用程式運行

## 技術棧

- **前端框架**: React 18
- **建構工具**: Vite
- **資料庫**: Supabase (PostgreSQL)
- **PWA**: vite-plugin-pwa
- **圖標**: lucide-react
- **樣式**: 原生 CSS（深色主題 + 漸層）

## 安裝與運行

### 1. 安裝依賴
```bash
npm install
```

### 2. 配置 Supabase

已配置的資料庫：
- URL: `https://jxorhxagdxrmjyxfobqt.supabase.co`
- Key: 已設定

確保在 Supabase 中執行 `supabase-schema.sql` 來創建資料表。

### 3. 啟動開發伺服器
```bash
npm run dev
```

訪問 `http://localhost:5173`

### 4. 建構生產版本
```bash
npm run build
```

## 使用說明

### 創建商品
1. 點擊右上角「新增商品」按鈕
2. 輸入商品名稱
3. 點擊「創建」

### 編輯庫存數量
1. 在商品卡片中，點擊任一位置的庫存數量
2. 輸入新的數量
3. 點擊「✓」保存，或點擊「✗」取消

### PWA 安裝
在支援的瀏覽器中（Chrome、Edge、Safari 等）：
1. 訪問網站
2. 點擊瀏覽器的「安裝」提示
3. 應用程式將添加到主畫面

## 資料表結構

```sql
products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  inventory_1f INTEGER DEFAULT 0,
  inventory_2f INTEGER DEFAULT 0,
  inventory_warehouse INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 專案結構

```
進銷存/
├── public/              # 靜態資源
│   ├── pwa-192x192.png # PWA 圖標
│   └── pwa-512x512.png # PWA 圖標
├── src/
│   ├── App.jsx         # 主應用程式組件
│   ├── main.jsx        # 應用程式入口
│   ├── index.css       # 全局樣式
│   └── supabaseClient.js # Supabase 客戶端配置
├── index.html          # HTML 模板
├── vite.config.js      # Vite 配置（含 PWA）
└── package.json        # 專案依賴
```

## 📱 PWA 安裝與測試

### 開發模式測試
PWA 功能在開發模式下已啟用：
```bash
npm run dev
```
訪問 `http://localhost:5173` 即可測試 PWA 功能。

### 生產建構測試
要測試完整的 PWA 功能，建議使用生產建構：

1. **建構應用程式**
```bash
npm run build
```

2. **預覽生產版本**
```bash
npx serve dist -p 3000
```

3. **訪問並測試**
打開 `http://localhost:3000` 進行測試。

### 安裝到裝置

**桌面（Chrome/Edge）**
1. 訪問應用程式
2. 點擊地址欄右側的「安裝」圖標
3. 或使用底部彈出的安裝提示

**Android**
1. 在 Chrome 中訪問應用程式
2. 點擊選單 > "安裝應用程式"
3. 從主畫面啟動

**iOS**
1. 在 Safari 中訪問應用程式
2. 點擊分享按鈕
3. 選擇「加入主畫面」

### PWA 功能檢查
詳細的 PWA 測試指南請參閱 [PWA-TESTING.md](./PWA-TESTING.md)

## 開發注意事項

- 所有庫存數量必須為非負整數
- 資料即時同步到 Supabase
- PWA 功能在生產建構後才能完整測試
- 建議在 HTTPS 環境下使用以獲得完整 PWA 功能

## 授權

MIT License
