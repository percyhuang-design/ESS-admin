import PlaceholderPage from '../../components/PlaceholderPage'

export default function MyDashboard() {
  return (
    <PlaceholderPage
      title="我的首頁"
      description="員工登入後的入口:申請進度一目瞭然,被退回的單據在這裡提醒。"
      planned={[
        '待辦與通知(被退回的申請、需補件提醒)',
        '各項申請進度摘要(待審核/已核准/已退回)',
        '常用自助項目捷徑',
      ]}
    />
  )
}
