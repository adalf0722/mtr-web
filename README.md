# mtr-web

線上 MTR 封包掉失分析工具的前端網頁。使用者輸入目標主機，下載搭配的 [mtr-runner](https://github.com/adalf0722/mtr-runner) CLI 在自己電腦跑 traceroute，結果透過 URL 帶回網頁顯示——全程無後端，所有資料只存在分享網址裡。

## 部署網址

> _尚未填寫_——把你的部署網址（如 `https://mtr.example.com`）填到這裡。

設定方式：在前端首頁 `<input>` 中由使用者輸入目標時，產生的 CLI 指令會用瀏覽器當前 origin 作為 `--site` 參數，所以使用者用什麼網址打開網站，CLI 就會把結果送回那個網址。不需要在程式碼裡寫死。

## 功能

- **下載 CLI 依 OS 自動偵測**：macOS Apple Silicon / Intel / Linux / Windows，提供對應 binary 連結與解 quarantine 指令
- **手動貼 mtr 輸出**：支援 `mtr --report`、`mtr --json`、`mtr --csv` 三種格式
- **路徑健康分析**：針對中間 hop / 最後一跳的 loss 模式，區分「真實掉包」與「ICMP rate limit 假性掉包」並用不同顏色與訊息呈現
- **ASN / ISP 查詢**：每個 hop 的 IP 自動查 ipapi.co 顯示所屬 ASN
- **可分享結果**：URL 內含完整資料（gzip + base64url 編碼），複製貼給對方就能看到一樣的結果

## 使用流程

1. 到首頁輸入目標 IP / 域名
2. 下載對應平台的 mtr-runner CLI
3. 用顯示的指令在終端機執行（會自動開啟瀏覽器到結果頁）
4. 也可以手動貼 mtr 輸出文字直接分析

## 隱私

- 沒有後端 API、沒有資料庫、沒有 log
- 所有資料只存在分享 URL 內，不上傳任何伺服器
- 唯一的外部請求是 ASN 查詢（ipapi.co），不送 hop 完整資料、只送單一 IP

## 技術棧

Vite + React 19 + TypeScript + Tailwind CSS v3 + React Router v6

URL 編碼用瀏覽器原生 `CompressionStream` API（gzip）+ `base64url`，讓即使 30 個 hop 也能塞進可分享的網址裡。

## 本地開發

```bash
npm install
npm run dev          # 啟動 Vite dev server (http://localhost:5173)
npm test             # 跑 Vitest 單元測試
npm run build        # 建構靜態檔到 dist/
```

### 與 CLI 一起測試

啟動 dev server 後，在另一個 terminal：

```bash
mtr-runner --target 8.8.8.8 --site http://localhost:5173
```

完成後 CLI 會開啟 `http://localhost:5173/result?data=...`。

## 部署

`npm run build` 產出純靜態 `dist/`，丟到任何靜態主機（Cloudflare Pages、Vercel、Netlify、GitHub Pages、S3）即可。沒有環境變數、沒有 server-side render。

部署完後把網址填到本檔案開頭的「部署網址」段落。
