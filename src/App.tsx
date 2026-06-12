import { useMemo, useState } from 'react'
import AppLayout, { Workspace } from './layout/AppLayout'
import { demoUsers, DemoUser } from './data/mock'
import { visibleCategories } from './lib/permissions'
import { useRequests } from './lib/useRequests'
import MyDashboard from './pages/ess/MyDashboard'
import ProfileBasic from './pages/ess/ProfileBasic'
import ContactInfo from './pages/ess/ContactInfo'
import EmergencyContact from './pages/ess/EmergencyContact'
import Dependents from './pages/ess/Dependents'
import BankAccount from './pages/ess/BankAccount'
import Education from './pages/ess/Education'
import MyRequests from './pages/ess/MyRequests'
import ReviewCenter from './pages/admin/ReviewCenter'
import ClosedRequests from './pages/admin/ClosedRequests'

// 自助項目 key → 頁面(每個項目獨立檔案,後續迭代各自填入真實表單)
const ITEM_PAGES: Record<string, JSX.Element> = {
  profile: <ProfileBasic />,
  contact: <ContactInfo />,
  emergency: <EmergencyContact />,
  dependents: <Dependents />,
  bank: <BankAccount />,
  education: <Education />,
}

export default function App() {
  // 架構期:Demo 身分切換;正式版改由登入身分(SSO / HR 系統角色)決定
  const [user, setUser] = useState<DemoUser>(demoUsers[0])
  // 工作區:ESS(員工自助)/ Admin(HR 後台),由最上方 App header 切換
  const [workspace, setWorkspace] = useState<Workspace>('ess')
  const [page, setPage] = useState('home')
  const { requests, approve, reject, approveMany, rejectMany } = useRequests()

  // 待審 badge:依目前身分可見分類過濾(切換器與 Admin 側欄共用)
  const pendingCount = useMemo(() => {
    const cats = visibleCategories(user)
    return requests.filter((r) => r.status === 'pending' && cats.includes(r.category)).length
  }, [user, requests])

  const switchWorkspace = (ws: Workspace) => {
    setWorkspace(ws)
    setPage(ws === 'admin' ? 'review' : 'home')
  }

  const switchUser = (id: string) => {
    const next = demoUsers.find((u) => u.id === id)
    if (!next) return
    setUser(next)
    // 切到無後台權限的身分時,退回 ESS 工作區
    if (next.role === 'employee' && workspace === 'admin') {
      setWorkspace('ess')
      setPage('home')
    }
  }

  let content: JSX.Element
  if (workspace === 'admin') {
    content =
      page === 'closed' ? (
        <ClosedRequests user={user} requests={requests} />
      ) : (
        <ReviewCenter
          user={user}
          requests={requests}
          onApprove={approve}
          onReject={reject}
          onApproveMany={approveMany}
          onRejectMany={rejectMany}
        />
      )
  } else if (page === 'myRequests') content = <MyRequests />
  else if (page.startsWith('item:')) content = ITEM_PAGES[page.slice(5)] ?? <MyDashboard />
  else content = <MyDashboard />

  return (
    <AppLayout
      user={user}
      workspace={workspace}
      page={page}
      pendingCount={pendingCount}
      onNavigate={setPage}
      onWorkspaceChange={switchWorkspace}
      onSwitchUser={switchUser}
    >
      {content}
    </AppLayout>
  )
}
