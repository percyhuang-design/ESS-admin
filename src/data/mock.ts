// ============================================================
// ESS 員工自助平台 — 核心型別與 Mock 資料
// 架構期:所有資料皆為前端假資料,後續迭代再串接後端
// ============================================================

/** 登入身分角色 */
export type Role = 'employee' | 'hr' | 'admin'

/** 業務分類:自助項目的歸屬,同時是 HR 審核權限的劃分單位 */
export type BizCategory = 'personal' | 'payroll' | 'insurance' | 'development'

export const CATEGORY_LABEL: Record<BizCategory, string> = {
  personal: '人事資料',
  payroll: '薪酬作業',
  insurance: '保險福利',
  development: '學習發展',
}

/** 側欄可自助維護的項目;category 決定申請單由哪個 HR 單位審核 */
export interface ServiceItem {
  key: string
  name: string
  category: BizCategory
}

export const serviceItems: ServiceItem[] = [
  { key: 'profile', name: '基本資料', category: 'personal' },
  { key: 'contact', name: '聯絡資訊', category: 'personal' },
  { key: 'emergency', name: '緊急聯絡人', category: 'personal' },
  { key: 'dependents', name: '眷屬資料', category: 'insurance' },
  { key: 'bank', name: '薪轉帳戶', category: 'payroll' },
  { key: 'education', name: '學歷與證照', category: 'development' },
]

/** 申請單狀態機:pending → approved / rejected(理由必填);approved 與 rejected 即為結案 */
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export const STATUS_META: Record<RequestStatus, { label: string; color: string }> = {
  pending: { label: '待審核', color: 'gold' },
  approved: { label: '已核准', color: 'green' },
  rejected: { label: '已退回', color: 'red' },
}

/** 單一欄位異動(申請單核心:異動前後對照) */
export interface FieldChange {
  field: string
  before: string
  after: string
}

/** 員工資料更新申請單 — ESS 員工端與 HR Admin 兩端共用的核心實體 */
export interface ChangeRequest {
  id: string
  requestNo: string
  employeeId: string
  employeeName: string
  department: string
  itemKey: string // 對應 ServiceItem.key
  category: BizCategory // 提交時由項目帶入;審核權限與分類篩選依據
  changes: FieldChange[]
  status: RequestStatus
  submittedAt: string
  reviewedAt?: string
  reviewerName?: string
  rejectReason?: string // status = rejected 時必填
  resubmitOf?: string // 退回後重送時鏈結原申請單(設計保留欄位)
}

/** Demo 身分(架構期用 Header 下拉切換驗證權限;正式版由登入身分決定) */
export interface DemoUser {
  id: string
  name: string
  role: Role
  /** hr 角色:負責審核的業務分類;admin 可見全部不需此欄 */
  categories?: BizCategory[]
}

export const ROLE_LABEL: Record<Role, string> = {
  employee: '員工',
  hr: 'HR 審核人員',
  admin: '平台管理員',
}

export const demoUsers: DemoUser[] = [
  { id: 'emp-001', name: '王小明', role: 'employee' },
  { id: 'hr-personal', name: '林雅婷', role: 'hr', categories: ['personal'] },
  { id: 'hr-pay-ins', name: '張志豪', role: 'hr', categories: ['payroll', 'insurance'] },
  { id: 'admin-001', name: '陳安琪', role: 'admin' },
]

export const changeRequests: ChangeRequest[] = [
  {
    id: 'r1',
    requestNo: 'ESS-2026-0610-001',
    employeeId: 'emp-001',
    employeeName: '王小明',
    department: '研發部',
    itemKey: 'contact',
    category: 'personal',
    changes: [{ field: '手機號碼', before: '0912-345-678', after: '0987-654-321' }],
    status: 'pending',
    submittedAt: '2026-06-10 09:32',
  },
  {
    id: 'r2',
    requestNo: 'ESS-2026-0610-002',
    employeeId: 'emp-014',
    employeeName: '李美玲',
    department: '行銷部',
    itemKey: 'bank',
    category: 'payroll',
    changes: [
      { field: '銀行', before: '812 台新銀行', after: '822 中國信託' },
      { field: '帳號', before: '****5678', after: '****1234' },
    ],
    status: 'pending',
    submittedAt: '2026-06-10 14:05',
  },
  {
    id: 'r3',
    requestNo: 'ESS-2026-0611-001',
    employeeId: 'emp-027',
    employeeName: '周建宏',
    department: '財務部',
    itemKey: 'education',
    category: 'development',
    changes: [{ field: '新增證照', before: '—', after: 'PMP 國際專案管理師(2026/05 取得)' }],
    status: 'pending',
    submittedAt: '2026-06-11 08:50',
  },
  {
    id: 'r4',
    requestNo: 'ESS-2026-0611-002',
    employeeId: 'emp-001',
    employeeName: '王小明',
    department: '研發部',
    itemKey: 'dependents',
    category: 'insurance',
    changes: [{ field: '新增眷屬', before: '—', after: '王小寶(子女,2026/04/12 出生),申請加入眷屬保險' }],
    status: 'pending',
    submittedAt: '2026-06-11 10:21',
  },
  {
    id: 'r5',
    requestNo: 'ESS-2026-0602-003',
    employeeId: 'emp-033',
    employeeName: '陳怡君',
    department: '人資部',
    itemKey: 'profile',
    category: 'personal',
    changes: [{ field: '通訊地址', before: '台北市信義區…', after: '新北市板橋區…' }],
    status: 'approved',
    submittedAt: '2026-06-02 11:18',
    reviewedAt: '2026-06-03 09:02',
    reviewerName: '林雅婷',
  },
  {
    id: 'r6',
    requestNo: 'ESS-2026-0529-001',
    employeeId: 'emp-041',
    employeeName: '黃國倫',
    department: '業務部',
    itemKey: 'bank',
    category: 'payroll',
    changes: [{ field: '帳號', before: '****9012', after: '****3456' }],
    status: 'approved',
    submittedAt: '2026-05-29 16:40',
    reviewedAt: '2026-05-30 10:15',
    reviewerName: '張志豪',
  },
  {
    id: 'r7',
    requestNo: 'ESS-2026-0605-002',
    employeeId: 'emp-001',
    employeeName: '王小明',
    department: '研發部',
    itemKey: 'emergency',
    category: 'personal',
    changes: [{ field: '緊急聯絡人電話', before: '02-2712-3456', after: '0911-222' }],
    status: 'rejected',
    submittedAt: '2026-06-05 13:27',
    reviewedAt: '2026-06-05 15:44',
    reviewerName: '林雅婷',
    rejectReason: '聯絡人電話格式不完整(0911-222),請確認後重新送出。',
  },
  {
    id: 'r8',
    requestNo: 'ESS-2026-0606-001',
    employeeId: 'emp-014',
    employeeName: '李美玲',
    department: '行銷部',
    itemKey: 'education',
    category: 'development',
    changes: [{ field: '新增學歷', before: '—', after: '國立台灣大學 EMBA(2026/06 畢業)' }],
    status: 'rejected',
    submittedAt: '2026-06-06 09:10',
    reviewedAt: '2026-06-08 11:30',
    reviewerName: '吳淑芬',
    rejectReason: '畢業證書影本未附上,請補件後重新送出。',
  },
]
