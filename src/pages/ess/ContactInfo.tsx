import PlaceholderPage from '../../components/PlaceholderPage'

export default function ContactInfo() {
  return (
    <PlaceholderPage
      title="聯絡資訊"
      category="人事資料"
      description="手機、電子郵件、通訊地址等聯絡方式的檢視與更新申請。"
      planned={['現有聯絡資訊檢視', '更新表單 → 送出申請', '進行中的申請提示']}
    />
  )
}
