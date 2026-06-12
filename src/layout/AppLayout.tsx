import type { ReactNode } from 'react'
import { Avatar, Badge, Layout, Menu, Segmented, Select, Space, Tag, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  HomeOutlined,
  IdcardOutlined,
  PhoneOutlined,
  ReadOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import { demoUsers, DemoUser, ROLE_LABEL, serviceItems } from '../data/mock'

export type Workspace = 'ess' | 'admin'

const ITEM_ICON: Record<string, ReactNode> = {
  profile: <IdcardOutlined />,
  contact: <PhoneOutlined />,
  emergency: <TeamOutlined />,
  dependents: <UsergroupAddOutlined />,
  bank: <BankOutlined />,
  education: <ReadOutlined />,
}

interface Props {
  user: DemoUser
  workspace: Workspace
  page: string
  /** 目前身分可見的待審申請單數(Admin 工作區側欄 + 切換器 badge) */
  pendingCount: number
  onNavigate: (key: string) => void
  onWorkspaceChange: (ws: Workspace) => void
  onSwitchUser: (id: string) => void
  children: ReactNode
}

export default function AppLayout({
  user,
  workspace,
  page,
  pendingCount,
  onNavigate,
  onWorkspaceChange,
  onSwitchUser,
  children,
}: Props) {
  const canAdmin = user.role === 'hr' || user.role === 'admin'

  // 側欄選單依「目前工作區」切換,而非把兩種混在一起
  const essMenu: MenuProps['items'] = [
    { key: 'home', icon: <HomeOutlined />, label: '我的首頁' },
    ...serviceItems.map((it) => ({ key: `item:${it.key}`, icon: ITEM_ICON[it.key], label: it.name })),
    { key: 'myRequests', icon: <FileTextOutlined />, label: '我的申請紀錄' },
  ]
  const adminMenu: MenuProps['items'] = [
    {
      key: 'review',
      icon: <AuditOutlined />,
      label: (
        <Badge count={pendingCount} size="small" offset={[10, 0]}>
          審核中心
        </Badge>
      ),
    },
    { key: 'closed', icon: <FileSearchOutlined />, label: '結案查詢' },
  ]
  const menuItems = workspace === 'admin' ? adminMenu : essMenu

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 最上方 App header:品牌 + ESS/Admin 工作區切換 + 身分 */}
      <Layout.Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: '0 20px',
          background: '#0B1220',
          height: 56,
          lineHeight: '56px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', minWidth: 200 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            E
          </div>
          <span style={{ fontWeight: 600 }}>ESS 員工自助平台</span>
        </div>

        {canAdmin && (
          <Segmented
            value={workspace}
            onChange={(v) => onWorkspaceChange(v as Workspace)}
            options={[
              { value: 'ess', icon: <AppstoreOutlined />, label: 'ESS 員工自助' },
              {
                value: 'admin',
                icon: <AuditOutlined />,
                label: (
                  <Badge count={pendingCount} size="small" offset={[8, -2]}>
                    <span>Admin 管理後台</span>
                  </Badge>
                ),
              },
            ]}
          />
        )}

        <Space size={12} style={{ marginInlineStart: 'auto' }}>
          <Select
            value={user.id}
            onChange={onSwitchUser}
            variant="borderless"
            popupMatchSelectWidth={false}
            style={{ width: 280 }}
            className="ess-header-select"
            options={demoUsers.map((u) => ({
              value: u.id,
              label: `${u.name}(${ROLE_LABEL[u.role]}${
                u.role === 'hr' && u.categories ? ':' + u.categories.join('/') : ''
              })`,
            }))}
          />
          <Avatar style={{ background: '#2563EB' }}>{user.name[0]}</Avatar>
          <Tag color={user.role === 'admin' ? 'purple' : user.role === 'hr' ? 'blue' : 'default'}>
            {ROLE_LABEL[user.role]}
          </Tag>
        </Space>
      </Layout.Header>

      <Layout>
        <Layout.Sider width={232} theme="dark">
          <div
            style={{
              padding: '14px 20px 6px',
              color: 'rgba(255,255,255,0.45)',
              fontSize: 12,
              letterSpacing: 1,
            }}
          >
            {workspace === 'admin' ? 'HR 審核管理' : '員工自助'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[page]}
            items={menuItems}
            onClick={(e) => onNavigate(e.key)}
          />
        </Layout.Sider>
        <Layout.Content style={{ padding: 24, background: '#F1F5F9' }}>
          {workspace === 'admin' && (
            <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
              管理後台 · 審核員工提出的資料更新申請
            </Typography.Paragraph>
          )}
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
