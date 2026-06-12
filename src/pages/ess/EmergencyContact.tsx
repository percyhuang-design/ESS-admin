import PlaceholderPage from '../../components/PlaceholderPage'

export default function EmergencyContact() {
  return (
    <PlaceholderPage
      title="緊急聯絡人"
      category="人事資料"
      description="緊急聯絡人的新增、修改與刪除申請。"
      planned={['聯絡人清單檢視', '新增/修改/刪除 → 送出申請', '進行中的申請提示']}
    />
  )
}
