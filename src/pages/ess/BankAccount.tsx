import PlaceholderPage from '../../components/PlaceholderPage'

export default function BankAccount() {
  return (
    <PlaceholderPage
      title="薪轉帳戶"
      category="薪酬作業"
      description="薪資轉帳帳戶的變更申請,由薪酬作業組 HR 審核(敏感欄位,顯示遮罩)。"
      planned={['現有帳戶檢視(帳號遮罩)', '變更帳戶表單 → 送出申請(可附存摺影本)', '進行中的申請提示']}
    />
  )
}
