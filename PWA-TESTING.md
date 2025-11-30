# PWA 功能測試指南

## ✅ 已實裝的 PWA 功能

### 1. **Service Worker 自動註冊**
- ✅ 自動更新機制
- ✅ 離線快取支援
- ✅ 版本更新提示

### 2. **離線支援**
- ✅ 靜態資源快取（HTML、CSS、JS、圖片）
- ✅ Supabase API 快取（NetworkFirst 策略）
- ✅ Google Fonts 快取（CacheFirst 策略）
- ✅ 離線狀態指示器

### 3. **安裝提示**
- ✅ 自訂 PWA 安裝提示
- ✅ 支援添加到主畫面
- ✅ 獨立視窗模式

### 4. **應用程式資訊**
- ✅ Web App Manifest
- ✅ 應用程式圖標（192x192 和 512x512）
- ✅ 主題顏色配置
- ✅ 啟動畫面配置

## 🧪 測試 PWA 功能

### 方法 1：使用開發伺服器（已啟用 PWA）
```bash
npm run dev
```
訪問 `http://localhost:5173`

**注意**：開發模式下 PWA 功能已啟用（devOptions.enabled: true），但某些功能可能有限制。

### 方法 2：使用生產建構（完整 PWA 功能）

1. **建構應用程式**
```bash
npm run build
```

2. **啟動生產伺服器**
```bash
npx serve dist -p 3000
```

3. **訪問應用程式**
打開瀏覽器訪問 `http://localhost:3000`

## 📱 測試項目清單

### ✅ 基本功能測試

1. **安裝提示**
   - [ ] 在 Chrome/Edge 中訪問應用程式
   - [ ] 查看是否出現自訂安裝提示（底部彈出）
   - [ ] 點擊「安裝」按鈕
   - [ ] 確認應用程式已添加到桌面/應用程式列表

2. **離線功能**
   - [ ] 正常訪問應用程式
   - [ ] 打開瀏覽器開發者工具（F12）
   - [ ] 切換到 Network 標籤
   - [ ] 勾選 "Offline" 選項
   - [ ] 重新整理頁面
   - [ ] 確認應用程式仍可正常顯示
   - [ ] 查看右上角是否顯示「離線模式」提示

3. **快取策略**
   - [ ] 打開開發者工具 > Application > Cache Storage
   - [ ] 查看以下快取：
     - `workbox-precache-v2` - 靜態資源
     - `supabase-api-cache` - API 回應
     - `google-fonts-cache` - Google Fonts
     - `gstatic-fonts-cache` - 字體檔案

4. **Service Worker**
   - [ ] 打開開發者工具 > Application > Service Workers
   - [ ] 確認 Service Worker 已註冊並運行
   - [ ] 狀態應為 "activated and is running"

5. **Manifest**
   - [ ] 打開開發者工具 > Application > Manifest
   - [ ] 確認以下資訊：
     - Name: 庫存管理系統
     - Short name: 庫存系統
     - Theme color: #4f46e5
     - Background color: #0f172a
     - Display: standalone
     - Icons: 192x192 和 512x512

### 📱 手機測試

1. **Android Chrome**
   - [ ] 訪問應用程式
   - [ ] 點擊瀏覽器選單 > "安裝應用程式" 或 "添加到主畫面"
   - [ ] 從主畫面啟動應用程式
   - [ ] 確認以全螢幕模式運行（無瀏覽器 UI）

2. **iOS Safari**
   - [ ] 訪問應用程式
   - [ ] 點擊分享按鈕
   - [ ] 選擇 "加入主畫面"
   - [ ] 從主畫面啟動應用程式

### 🔄 更新測試

1. **版本更新**
   - [ ] 修改應用程式代碼
   - [ ] 重新建構 `npm run build`
   - [ ] 重新整理瀏覽器
   - [ ] 確認出現「有新版本可用」提示
   - [ ] 點擊確定更新

## 🎯 PWA 評分

使用 Chrome Lighthouse 測試 PWA 品質：

1. 打開 Chrome 開發者工具
2. 切換到 "Lighthouse" 標籤
3. 選擇 "Progressive Web App"
4. 點擊 "Analyze page load"
5. 查看 PWA 評分（目標：90+）

## 📊 快取策略說明

### NetworkFirst（Supabase API）
- 優先嘗試網路請求
- 網路失敗時使用快取
- 適合需要最新資料的 API

### CacheFirst（字體）
- 優先使用快取
- 快取未命中時請求網路
- 適合不常變更的資源

### Precache（靜態資源）
- 安裝時預先快取
- 確保離線可用
- 包含 HTML、CSS、JS、圖片

## 🔧 進階配置

### 自訂快取時間
編輯 `vite.config.js` 中的 `workbox.runtimeCaching`：

```javascript
expiration: {
  maxEntries: 50,        // 最大快取數量
  maxAgeSeconds: 3600    // 快取時間（秒）
}
```

### 調整離線提示
編輯 `src/main.jsx` 中的 `registerSW` 配置。

## 📝 注意事項

1. **HTTPS 要求**：PWA 完整功能需要 HTTPS（localhost 除外）
2. **快取更新**：修改代碼後需要重新建構才能更新 Service Worker
3. **瀏覽器支援**：建議使用 Chrome、Edge、Safari 最新版本
4. **離線限制**：離線時無法創建新商品或更新庫存（需要網路連線）

## 🚀 部署建議

部署到支援 HTTPS 的平台以獲得完整 PWA 功能：
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- Cloudflare Pages

## 🆘 疑難排解

### Service Worker 未註冊
- 清除瀏覽器快取
- 確認使用 HTTPS 或 localhost
- 檢查控制台錯誤訊息

### 安裝提示未顯示
- 確認應用程式符合 PWA 標準
- 某些瀏覽器需要用戶互動後才顯示
- iOS Safari 不支援自動安裝提示

### 離線功能不工作
- 確認 Service Worker 已啟動
- 檢查 Cache Storage 是否有資料
- 嘗試重新整理頁面
