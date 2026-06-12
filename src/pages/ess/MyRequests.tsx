import PlaceholderPage from '../../components/PlaceholderPage'

export default function MyRequests() {
  return (
    <PlaceholderPage
      title="我的申請紀錄"
      description="員工端對申請單的唯一視角:追蹤狀態、查看退回理由、修改後重送。"
      planned={[
        '我的申請單列表(待審核/已核准/已退回)',
        '已退回單據顯示 HR 填寫的拒絕理由',
        '由退回單一鍵帶入原內容,修改後重送(resubmitOf 鏈結原單)',
        '撤回尚未審核的申請(待確認是否開放)',
      ]}
    />
  )
}
