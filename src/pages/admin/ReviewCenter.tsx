import { useEffect, useMemo, useState } from 'react'
import { Alert, App, Button, Card, Input, Modal, Segmented, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { BizCategory, CATEGORY_LABEL, ChangeRequest, changesOf, DemoUser, serviceItems } from '../../data/mock'
import { canReview, visibleCategories } from '../../lib/permissions'
import ChangeLines from '../../components/ChangeLines'
import EmptyState from '../../components/EmptyState'
import RequestReviewModal from './RequestReviewModal'
import ConfirmActionModal from './ConfirmActionModal'

interface Props {
  user: DemoUser
  requests: ChangeRequest[]
  onApprove: (id: string, reviewerName: string) => void
  onReject: (id: string, reviewerName: string, reason: string) => void
  onApproveMany: (ids: string[], reviewerName: string) => void
  onRejectMany: (ids: string[], reviewerName: string, reason: string) => void
}

const itemName = (key: string) => serviceItems.find((s) => s.key === key)?.name ?? key

// 批次確認視窗清單:含異動內容,讓批次核准/退回前看得到實際變更
const summaryColumns: ColumnsType<ChangeRequest> = [
  { title: '員工', key: 'emp', width: 96, render: (_, r) => r.employeeName },
  { title: '項目', key: 'item', width: 92, render: (_, r) => itemName(r.itemKey) },
  { title: '異動內容', key: 'changes', render: (_, r) => <ChangeLines changes={changesOf(r)} /> },
]

export default function ReviewCenter({
  user,
  requests,
  onApprove,
  onReject,
  onApproveMany,
  onRejectMany,
}: Props) {
  const cats = visibleCategories(user)
  const [filter, setFilter] = useState<BizCategory | 'all'>('all')
  const [active, setActive] = useState<ChangeRequest | null>(null)
  // 單筆確認:審核 Modal 或列表 icon 觸發後彈出的獨立確認 Modal
  const [confirm, setConfirm] = useState<{ request: ChangeRequest; type: 'approve' | 'reject'; fromReview: boolean } | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [batchMode, setBatchMode] = useState<'approve' | 'reject' | null>(null)
  const [batchReason, setBatchReason] = useState('')
  const { message } = App.useApp()

  const pending = useMemo(
    () => requests.filter((r) => r.status === 'pending' && cats.includes(r.category)),
    [requests, cats],
  )
  const rows = filter === 'all' ? pending : pending.filter((r) => r.category === filter)

  // 換篩選或換身分時清空選取(避免選到看不見的單)
  useEffect(() => {
    setSelectedKeys([])
  }, [filter, user.id])

  // active 取自最新 requests,確保 Modal 內狀態隨核准/退回即時更新
  const activeReq = active ? requests.find((r) => r.id === active.id) ?? null : null

  // 僅「可審核且仍待審」的選取才有效
  const selectedReqs = requests.filter(
    (r) => selectedKeys.includes(r.id) && r.status === 'pending' && canReview(user, r),
  )
  const canBatch = rows.some((r) => canReview(user, r)) // 管理員唯讀 → 無勾選框
  const hasSensitive = selectedReqs.some((r) => r.category === 'payroll')

  // 審核 Modal / 列表 icon 發出意圖 → 關閉來源、開獨立確認 Modal
  const openConfirm = (r: ChangeRequest, type: 'approve' | 'reject', fromReview: boolean) => {
    setActive(null)
    setConfirm({ request: r, type, fromReview })
  }
  // 取消:從審核 Modal 來的回到審核 Modal,從列表 icon 來的直接關閉
  const cancelConfirm = () => {
    if (confirm?.fromReview) setActive(confirm.request)
    setConfirm(null)
  }
  const doConfirm = (reason?: string) => {
    if (!confirm) return
    const r = confirm.request
    if (confirm.type === 'approve') {
      onApprove(r.id, user.name)
      message.success(`已核准 ${r.requestNo}`)
    } else {
      onReject(r.id, user.name, reason ?? '')
      message.success(`已退回 ${r.requestNo}`)
    }
    setConfirm(null)
  }

  const doBatchApprove = () => {
    onApproveMany(selectedReqs.map((r) => r.id), user.name)
    message.success(`已核准 ${selectedReqs.length} 筆申請`)
    setSelectedKeys([])
    setBatchMode(null)
  }
  const doBatchReject = () => {
    if (!batchReason.trim()) return
    onRejectMany(selectedReqs.map((r) => r.id), user.name, batchReason.trim())
    message.success(`已退回 ${selectedReqs.length} 筆申請`)
    setSelectedKeys([])
    setBatchReason('')
    setBatchMode(null)
  }

  const columns: ColumnsType<ChangeRequest> = [
    { title: '單號', dataIndex: 'requestNo', key: 'requestNo' },
    { title: '員工', key: 'emp', render: (_, r) => `${r.employeeName}(${r.employeeId})` },
    { title: '部門', dataIndex: 'department', key: 'department' },
    { title: '項目', key: 'item', render: (_, r) => itemName(r.itemKey) },
    {
      title: '分類',
      key: 'category',
      render: (_, r) => <Tag color="blue">{CATEGORY_LABEL[r.category]}</Tag>,
    },
    { title: '異動內容', key: 'changes', width: 260, render: (_, r) => <ChangeLines changes={changesOf(r)} /> },
    { title: '送出時間', dataIndex: 'submittedAt', key: 'submittedAt', width: 132 },
    {
      title: '操作',
      key: 'action',
      width: 116,
      render: (_, r) => {
        const reviewable = canReview(user, r)
        return (
          <Space size={2}>
            <Tooltip title="看申請單">
              <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setActive(r)} />
            </Tooltip>
            {reviewable && (
              <>
                <Tooltip title="同意">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    style={{ color: '#16A34A' }}
                    onClick={() => openConfirm(r, 'approve', false)}
                  />
                </Tooltip>
                <Tooltip title="退回">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => openConfirm(r, 'reject', false)}
                  />
                </Tooltip>
              </>
            )}
          </Space>
        )
      },
    },
  ]

  const filterOptions = [
    { label: '全部', value: 'all' },
    ...cats.map((c) => ({ label: CATEGORY_LABEL[c], value: c })),
  ]

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }} align="start">
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            審核中心
            <Typography.Text type="secondary" style={{ fontSize: 14, fontWeight: 400, marginInlineStart: 8 }}>
              {pending.length} 張待審
            </Typography.Text>
          </Typography.Title>
          <Space size={4} wrap style={{ marginTop: 8 }}>
            <Typography.Text type="secondary">可審範圍:</Typography.Text>
            {cats.map((c) => (
              <Tag key={c} color="blue">
                {CATEGORY_LABEL[c]}
              </Tag>
            ))}
          </Space>
        </div>
        {cats.length > 1 && (
          <Segmented
            options={filterOptions}
            value={filter}
            onChange={(v) => setFilter(v as BizCategory | 'all')}
          />
        )}
      </Space>

      {selectedReqs.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 12px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Typography.Text strong>已選 {selectedReqs.length} 筆</Typography.Text>
          <Button type="primary" size="small" onClick={() => setBatchMode('approve')}>
            批次核准
          </Button>
          <Button danger size="small" onClick={() => setBatchMode('reject')}>
            批次退回
          </Button>
          <Button type="text" size="small" onClick={() => setSelectedKeys([])}>
            取消選取
          </Button>
        </div>
      )}

      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        pagination={false}
        rowSelection={
          canBatch
            ? {
                selectedRowKeys: selectedKeys,
                onChange: (keys) => setSelectedKeys(keys as string[]),
                getCheckboxProps: (r) => ({ disabled: !canReview(user, r) }),
              }
            : undefined
        }
        locale={{
          emptyText: (
            <EmptyState
              title="沒有待審的申請單"
              description="目前可審範圍內都處理完了,員工送出新申請後會出現在這裡。"
            />
          ),
        }}
      />

      <RequestReviewModal
        open={!!activeReq}
        request={activeReq}
        canReview={!!activeReq && canReview(user, activeReq)}
        onApproveIntent={(r) => openConfirm(r, 'approve', true)}
        onRejectIntent={(r) => openConfirm(r, 'reject', true)}
        onClose={() => setActive(null)}
      />

      <ConfirmActionModal
        open={!!confirm}
        request={confirm?.request ?? null}
        type={confirm?.type ?? 'approve'}
        onConfirm={doConfirm}
        onCancel={cancelConfirm}
      />

      <Modal
        title={`批次核准 ${selectedReqs.length} 筆申請`}
        open={batchMode === 'approve'}
        onCancel={() => setBatchMode(null)}
        onOk={doBatchApprove}
        okText={`確認核准 ${selectedReqs.length} 筆`}
        cancelText="取消"
        width={640}
      >
        {hasSensitive && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="含薪轉帳戶等金流相關變更,請確認逐筆無誤後再核准。"
          />
        )}
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          scroll={{ y: 360 }}
          columns={summaryColumns}
          dataSource={selectedReqs}
        />
      </Modal>

      <Modal
        title={`批次退回 ${selectedReqs.length} 筆申請`}
        open={batchMode === 'reject'}
        onCancel={() => {
          setBatchMode(null)
          setBatchReason('')
        }}
        onOk={doBatchReject}
        okText={`確認退回 ${selectedReqs.length} 筆`}
        okButtonProps={{ danger: true, disabled: !batchReason.trim() }}
        cancelText="取消"
        width={640}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message={`以下拒絕理由將套用到全部 ${selectedReqs.length} 筆申請,請確認理由對每一筆都適用。`}
        />
        <Input.TextArea
          rows={3}
          value={batchReason}
          onChange={(e) => setBatchReason(e.target.value)}
          placeholder="向員工說明退回原因(必填),例如:本次受理期間暫停,請於下週重新送出。"
        />
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          scroll={{ y: 300 }}
          style={{ marginTop: 12 }}
          columns={summaryColumns}
          dataSource={selectedReqs}
        />
      </Modal>
    </Card>
  )
}
