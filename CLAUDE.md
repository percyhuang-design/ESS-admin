# ESS 員工自助平台 — 專案指南 (CLAUDE.md)

> 跨 session 接續進度的主要依據。設計細節見 `DESIGN.md`。

## 1. 產品是什麼

**ESS (Employee Self Service) 員工自助平台**:員工在側欄自助維護個人資料項目,
送出後產生「資料更新申請單」,由負責該業務分類的 HR 審核(同意/拒絕,拒絕需填理由)後才生效。

**本次升級重點:HR Admin 審核功能**
- 負責 HR 進入「審核中心」只看到**自己負責分類**的待審申請單,審核同意/拒絕(理由必填)。
- **平台管理員**可見全部申請單,並可依業務分類篩選。
- 可查詢**已結案**(已核准/已退回)申請單。
- 與 ESS 整合方式:**同一平台,側欄依角色長出「HR 審核管理」群組**(非獨立系統),
  兩端共用 `ChangeRequest` 申請單實體。完整設計與權限矩陣見 `DESIGN.md`。

## 2. 技術棧(配合 Node 18 鎖版,勿任意升級)

- React 18 + TypeScript + Vite 5、Ant Design 5 + @ant-design/icons
- 亮色主題 + 藍主色 `#2563EB`、深色側欄;繁中 locale (`antd/locale/zh_TW`)
- **資料全為 mock**(`src/data/mock.ts`),尚未串接後端

```bash
npm install
npm run dev      # http://localhost:5174(與 Aligner 5173 錯開)
npm run build    # 改完務必跑;不要用 npx vite build(npx 可能抓到需 Node 20 的新版 Vite)
```

## 3. 結構與現況

- `App.tsx` — Demo 身分切換(Header 下拉:員工/兩位 HR/管理員)+ page 切換;正式版改由登入身分決定
- `layout/AppLayout.tsx` — 側欄:「員工自助」(首頁/6 項目/我的申請紀錄)+「HR 審核管理」(僅 hr/admin;審核中心含待審 badge、結案查詢)
- `data/mock.ts` — 型別與假資料:`ServiceItem`(項目,掛業務分類)、`ChangeRequest`(申請單,狀態機 pending→approved/rejected)、`DemoUser`
- `lib/permissions.ts` — `visibleCategories`(admin 全部/hr 負責分類)、`canReview`(預設僅負責 HR 可審,admin 代審待確認)
- `pages/ess/*`、`pages/admin/*` — **全部 Placeholder**(各頁列出後續預計內容);
  例外:審核中心/結案查詢的「可見分類 + 待審數」權限過濾已接通 mock 資料,切換身分可驗證

## 4. 導覽模型(已定案)

最上方 **App header** 用 `Segmented` 切換兩個工作區(`workspace` state in `App.tsx`):
- **ESS 員工自助**:側欄=我的首頁/6 自助項目/我的申請紀錄(全 placeholder)
- **Admin 管理後台**:側欄=審核中心/結案查詢(已實作);切換器只對 hr/admin 顯示、帶待審 badge
員工身分無此切換器;HR 本人也是員工,用切換器在「我的自助」與「審核工作」間切。

## 5. 進度

- ✅ 架構骨架:側欄 IA、ESS/Admin 工作區切換、角色權限模型、申請單型別/狀態機、build 通過
- ✅ **M1 審核中心(完成)**:真實列表(RBAC 分類過濾,多分類/管理員有分類 Segmented 篩選)、審核 **Modal**(`RequestReviewModal` 置中彈窗、異動前後對照,只顯示+發出意圖)、按「同意/拒絕」→ **關閉審核 Modal、彈出獨立確認 Modal**(`ConfirmActionModal`,**循序不堆疊**;核准=確認訊息+金流項目加警示、退回=理由必填且空白 disabled,**取消則返回審核 Modal**);**不用 Popconfirm 浮層、不疊第二層 Modal**;狀態以 `lib/useRequests.ts` 就地更新→待審 badge 連動、結案查詢即時反映。**管理員唯讀督導**(canReview=false,無 footer 僅 X 關閉,見 `lib/permissions.ts`)。曾比較 Drawer/push-panel/Modal,定案 **Modal**。
- ✅ **批次審核(完成)**:審核中心表格 `rowSelection`(僅負責 HR 出現勾選框,**管理員唯讀無勾選**;`getCheckboxProps` 擋非可審列)+ 選取工具列。**批次核准**(確認 Modal 列出選取清單;含薪轉帳戶 payroll 跳金流警示)、**批次退回**(理由必填、明示「套用到全部 N 筆」);`useRequests.approveMany/rejectMany` 一次更新(僅作用於 pending)。換篩選/換身分自動清空選取。**確認 Modal 內嵌異動內容**(每筆「欄位:原值→新值」,多欄位堆疊,`renderChanges`)——批次核准/退回前看得到實際變更,非閉眼全過;清單過長 `scroll.y` 捲動。批次語意取捨見 `DESIGN.md`。
- ✅ **結案查詢(M2 提前完成)**:真實表格 + 狀態/分類 Segmented + 關鍵字搜尋,明細抽屜唯讀含審核紀錄(審核人/時間/拒絕理由)。
- ⬜ M3 員工端:項目表單 → 送出產生申請單 + 我的申請紀錄 + 退回重送;M4 通知;M5 後端串接(見 `DESIGN.md` §7)

### 驗證帳號(Demo 身分切換)
王小明=員工(無後台) / 林雅婷=HR(人事資料,1 筆待審) / 張志豪=HR(薪酬+保險,2 筆) / 陳安琪=管理員(全部 4 筆,唯讀)
