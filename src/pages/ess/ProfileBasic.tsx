import PlaceholderPage from '../../components/PlaceholderPage'

export default function ProfileBasic() {
  return (
    <PlaceholderPage
      title="基本資料"
      category="人事資料"
      description="檢視與申請更新個人基本資料;送出後產生申請單,由人事資料組 HR 審核。"
      planned={[
        '現有資料檢視(唯讀)',
        '欄位編輯表單 → 送出申請(產生異動前後對照)',
        '此項目進行中的申請提示(待審核期間鎖定重複申請)',
      ]}
    />
  )
}
