import { useMemo, useState } from 'react'
import { Button, Card, Empty, Input, Segmented, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  BizCategory,
  CATEGORY_LABEL,
  ChangeRequest,
  DemoUser,
  RequestStatus,
  serviceItems,
  STATUS_META,
} from '../../data/mock'
import { visibleCategories } from '../../lib/permissions'
import RequestReviewModal from './RequestReviewModal'

const itemName = (key: string) => serviceItems.find((s) => s.key === key)?.name ?? key

type StatusFilter = 'all' | Extract<RequestStatus, 'approved' | 'rejected'>

export default function ClosedRequests({ user, requests }: { user: DemoUser; requests: ChangeRequest[] }) {
  const cats = visibleCategories(user)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<BizCategory | 'all'>('all')
  const [keyword, setKeyword] = useState('')
  const [active, setActive] = useState<ChangeRequest | null>(null)

  const rows = useMemo(() => {
    const kw = keyword.trim()
    return requests.filter((r) => {
      if (r.status === 'pending') return false // 結案查詢只看已核准/已退回
      if (!cats.includes(r.category)) return false
      if (status !== 'all' && r.status !== status) return false
      if (category !== 'all' && r.category !== category) return false
      if (kw && !`${r.employeeName}${r.employeeId}${r.requestNo}`.includes(kw)) return false
      return true
    })
  }, [requests, cats, status, category, keyword])

  const activeReq = active ? requests.find((r) => r.id === active.id) ?? null : null

  const columns: ColumnsType<ChangeRequest> = [
    { title: '單號', dataIndex: 'requestNo', key: 'requestNo' },
    { title: '員工', key: 'emp', render: (_, r) => `${r.employeeName}(${r.employeeId})` },
    { title: '項目', key: 'item', render: (_, r) => itemName(r.itemKey) },
    {
      title: '分類',
      key: 'category',
      render: (_, r) => <Tag color="blue">{CATEGORY_LABEL[r.category]}</Tag>,
    },
    {
      title: '狀態',
      key: 'status',
      render: (_, r) => <Tag color={STATUS_META[r.status].color}>{STATUS_META[r.status].label}</Tag>,
    },
    { title: '審核人', dataIndex: 'reviewerName', key: 'reviewerName' },
    { title: '審核時間', dataIndex: 'reviewedAt', key: 'reviewedAt' },
    {
      title: '操作',
      key: 'action',
      width: 70,
      render: (_, r) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setActive(r)}>
          檢視
        </Button>
      ),
    },
  ]

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }} align="start" wrap>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            結案查詢
          </Typography.Title>
          <Space size={4} wrap style={{ marginTop: 8 }}>
            <Typography.Text type="secondary">可查範圍:</Typography.Text>
            {cats.map((c) => (
              <Tag key={c} color="blue">
                {CATEGORY_LABEL[c]}
              </Tag>
            ))}
          </Space>
        </div>
        <Space wrap>
          <Segmented
            value={status}
            onChange={(v) => setStatus(v as StatusFilter)}
            options={[
              { label: '全部', value: 'all' },
              { label: '已核准', value: 'approved' },
              { label: '已退回', value: 'rejected' },
            ]}
          />
          {cats.length > 1 && (
            <Segmented
              value={category}
              onChange={(v) => setCategory(v as BizCategory | 'all')}
              options={[
                { label: '全部分類', value: 'all' },
                ...cats.map((c) => ({ label: CATEGORY_LABEL[c], value: c })),
              ]}
            />
          )}
          <Input.Search
            allowClear
            placeholder="員工姓名 / 工號 / 單號"
            style={{ width: 200 }}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </Space>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: <Empty description="沒有符合條件的結案申請單" /> }}
      />

      <RequestReviewModal
        open={!!activeReq}
        request={activeReq}
        canReview={false}
        onClose={() => setActive(null)}
      />
    </Card>
  )
}
