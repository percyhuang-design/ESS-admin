import { useMemo, useState } from 'react'
import { Button, Card, Divider, Input, Popover, Select, Space, Table, Tag, Typography } from 'antd'
import { DownOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
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
import DateRangeField, { Range } from '../../components/DateRangeField'
import EmptyState from '../../components/EmptyState'
import RequestReviewModal from './RequestReviewModal'

const itemName = (key: string) => serviceItems.find((s) => s.key === key)?.name ?? key

type StatusFilter = 'all' | RequestStatus

interface Filters {
  reqNo: string
  applicant: string
  status: StatusFilter
  category: BizCategory | 'all'
  reviewer: string
  submitted: Range
  reviewed: Range
}

const EMPTY: Filters = {
  reqNo: '',
  applicant: '',
  status: 'all',
  category: 'all',
  reviewer: 'all',
  submitted: null,
  reviewed: null,
}

const inRange = (dateStr: string | undefined, range: Range) => {
  if (!range) return true
  if (!dateStr) return false
  const t = dayjs(dateStr).valueOf()
  return t >= range[0].startOf('day').valueOf() && t <= range[1].endOf('day').valueOf()
}

const advActive = (f: Filters) =>
  f.category !== 'all' || f.reviewer !== 'all' || !!f.submitted || !!f.reviewed

export default function RequestRecords({ user, requests }: { user: DemoUser; requests: ChangeRequest[] }) {
  const cats = visibleCategories(user)

  // draft = 表單目前值;applied = 已套用到表格的條件(按「搜尋/套用」才同步)
  const [draft, setDraft] = useState<Filters>(EMPTY)
  const [applied, setApplied] = useState<Filters>(EMPTY)
  const [advOpen, setAdvOpen] = useState(false)
  const [active, setActive] = useState<ChangeRequest | null>(null)
  // 初始狀態:尚未搜尋過,下方不顯示資料(按「搜尋」才查)
  const [searched, setSearched] = useState(false)

  const patch = (p: Partial<Filters>) => setDraft((d) => ({ ...d, ...p }))

  const search = () => {
    setApplied(draft)
    setSearched(true)
    setAdvOpen(false)
  }
  const clearAll = () => {
    setDraft(EMPTY)
    setApplied(EMPTY)
    setSearched(false) // 回到初始空狀態,需再次搜尋
    setAdvOpen(false)
  }
  const resetAdvanced = () =>
    patch({ category: 'all', reviewer: 'all', submitted: null, reviewed: null })

  // 可選審核人:目前可見資料中出現過的審核人
  const reviewers = Array.from(
    new Set(requests.filter((r) => cats.includes(r.category) && r.reviewerName).map((r) => r.reviewerName as string)),
  )

  const rows = useMemo(() => {
    const f = applied
    const no = f.reqNo.trim().toLowerCase()
    const ap = f.applicant.trim()
    return requests.filter((r) => {
      if (!cats.includes(r.category)) return false // RBAC:只看負責分類
      if (f.status !== 'all' && r.status !== f.status) return false
      if (f.category !== 'all' && r.category !== f.category) return false
      if (f.reviewer !== 'all' && r.reviewerName !== f.reviewer) return false
      if (no && !r.requestNo.toLowerCase().includes(no)) return false
      if (ap && !`${r.employeeName}${r.employeeId}`.includes(ap)) return false
      if (!inRange(r.submittedAt, f.submitted)) return false
      if (f.reviewed && !inRange(r.reviewedAt, f.reviewed)) return false
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, user.id, applied])

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
    { title: '送出時間', dataIndex: 'submittedAt', key: 'submittedAt', width: 132 },
    { title: '審核人', key: 'reviewerName', render: (_, r) => r.reviewerName ?? '—' },
    { title: '審核時間', key: 'reviewedAt', width: 132, render: (_, r) => r.reviewedAt ?? '—' },
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

  // 進階面板(Popover 內容):垂直堆疊,直欄式標籤
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 4, color: '#64748B', fontSize: 13 }
  const advancedPanel = (
    <div style={{ width: 360 }}>
      {cats.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <span style={labelStyle}>分類</span>
          <Select
            value={draft.category}
            onChange={(v) => patch({ category: v as BizCategory | 'all' })}
            style={{ width: '100%' }}
            options={[
              { label: '全部分類', value: 'all' },
              ...cats.map((c) => ({ label: CATEGORY_LABEL[c], value: c })),
            ]}
          />
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <span style={labelStyle}>審核人</span>
        <Select
          value={draft.reviewer}
          onChange={(v) => patch({ reviewer: v })}
          style={{ width: '100%' }}
          options={[{ label: '全部', value: 'all' }, ...reviewers.map((r) => ({ label: r, value: r }))]}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <span style={labelStyle}>申請區間</span>
        <DateRangeField value={draft.submitted} onChange={(v) => patch({ submitted: v })} />
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={labelStyle}>審核區間</span>
        <DateRangeField value={draft.reviewed} onChange={(v) => patch({ reviewed: v })} />
      </div>
      <Divider style={{ margin: '12px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button type="text" onClick={resetAdvanced}>
          重置進階
        </Button>
        <Button type="primary" onClick={search}>
          套用
        </Button>
      </div>
    </div>
  )

  return (
    <Card>
      <div style={{ marginBottom: 12 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          全部申請紀錄
          {searched && (
            <Typography.Text type="secondary" style={{ fontSize: 14, fontWeight: 400, marginInlineStart: 8 }}>
              共 {rows.length} 筆
            </Typography.Text>
          )}
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

      {/* 主要條件(草稿)+ 進階 Popover;按搜尋才套用 */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          allowClear
          placeholder="申請單號"
          style={{ width: 180 }}
          value={draft.reqNo}
          onChange={(e) => patch({ reqNo: e.target.value })}
          onPressEnter={search}
        />
        <Input
          allowClear
          placeholder="申請人(姓名/工號)"
          style={{ width: 180 }}
          value={draft.applicant}
          onChange={(e) => patch({ applicant: e.target.value })}
          onPressEnter={search}
        />
        <Select
          value={draft.status}
          onChange={(v) => patch({ status: v })}
          style={{ width: 130 }}
          options={[
            { label: '全部狀態', value: 'all' },
            { label: '待審核', value: 'pending' },
            { label: '已核准', value: 'approved' },
            { label: '已退回', value: 'rejected' },
          ]}
        />
        <Popover
          open={advOpen}
          trigger={[]}
          placement="bottomLeft"
          content={advancedPanel}
          onOpenChange={setAdvOpen}
        >
          <Button icon={<FilterOutlined />} onClick={() => setAdvOpen((o) => !o)}>
            進階選項{advActive(applied) ? ' •' : ''}
            <DownOutlined style={{ fontSize: 10, marginInlineStart: 2 }} />
          </Button>
        </Popover>
        <Button type="primary" icon={<SearchOutlined />} onClick={search}>
          搜尋
        </Button>
        <Button type="text" onClick={clearAll}>
          清除
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={searched ? rows : []}
        pagination={false}
        locale={{
          emptyText: searched ? (
            <EmptyState
              title="找不到符合的申請紀錄"
              description="沒有符合目前篩選條件的申請單,試著放寬條件或按「清除」重新查詢。"
            />
          ) : (
            <EmptyState
              image="simple"
              title="開始查詢申請紀錄"
              description="設定上方條件後按「搜尋」,符合的紀錄會顯示在這裡。"
              action={
                <Button type="primary" icon={<SearchOutlined />} onClick={search}>
                  搜尋
                </Button>
              }
            />
          ),
        }}
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
