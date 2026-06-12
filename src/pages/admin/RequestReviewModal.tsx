import { Alert, Button, Descriptions, Modal, Space, Table, Tag, Typography } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { CATEGORY_LABEL, ChangeRequest, serviceItems, STATUS_META } from '../../data/mock'

interface Props {
  open: boolean
  request: ChangeRequest | null
  /** 目前身分是否可對此單審核;否則為唯讀檢視 */
  canReview: boolean
  /** 發出「要核准/退回」意圖:父層會關掉本 Modal、改開獨立確認 Modal */
  onApproveIntent?: (r: ChangeRequest) => void
  onRejectIntent?: (r: ChangeRequest) => void
  onClose: () => void
}

const itemName = (key: string) => serviceItems.find((s) => s.key === key)?.name ?? key

export default function RequestReviewModal({ open, request, canReview, onApproveIntent, onRejectIntent, onClose }: Props) {
  const r = request
  const actionable = !!r && r.status === 'pending' && canReview

  const footer = actionable ? (
    <Space>
      <Button danger onClick={() => onRejectIntent?.(r)}>
        拒絕
      </Button>
      <Button type="primary" onClick={() => onApproveIntent?.(r)}>
        同意
      </Button>
    </Space>
  ) : null

  return (
    <Modal title={r ? `申請單 ${r.requestNo}` : '申請單'} open={open} onCancel={onClose} width={600} footer={footer}>
      {r && (
        <>
          {r.status === 'pending' && !canReview && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="您可檢視督導,此申請的審核由負責該分類的 HR 進行。"
            />
          )}

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="員工">
              {r.employeeName}({r.employeeId})
            </Descriptions.Item>
            <Descriptions.Item label="部門">{r.department}</Descriptions.Item>
            <Descriptions.Item label="項目">{itemName(r.itemKey)}</Descriptions.Item>
            <Descriptions.Item label="分類">
              <Tag color="blue">{CATEGORY_LABEL[r.category]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="送出時間">{r.submittedAt}</Descriptions.Item>
          </Descriptions>

          <Typography.Title level={5} style={{ marginTop: 20 }}>
            異動內容
          </Typography.Title>
          <Table
            size="small"
            rowKey="field"
            pagination={false}
            dataSource={r.changes}
            columns={[
              { title: '欄位', dataIndex: 'field', width: 120 },
              {
                title: '原值',
                dataIndex: 'before',
                render: (v) => <span style={{ color: '#94A3B8' }}>{v}</span>,
              },
              { title: '', width: 28, align: 'center', render: () => <ArrowRightOutlined style={{ color: '#94A3B8' }} /> },
              {
                title: '新值',
                dataIndex: 'after',
                render: (v) => <span style={{ color: '#0F172A', fontWeight: 600 }}>{v}</span>,
              },
            ]}
          />

          {r.status !== 'pending' && (
            <>
              <Typography.Title level={5} style={{ marginTop: 20 }}>
                審核紀錄
              </Typography.Title>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="結果">
                  <Tag color={STATUS_META[r.status].color}>{STATUS_META[r.status].label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="審核人">{r.reviewerName}</Descriptions.Item>
                <Descriptions.Item label="審核時間">{r.reviewedAt}</Descriptions.Item>
                {r.status === 'rejected' && (
                  <Descriptions.Item label="拒絕理由">{r.rejectReason}</Descriptions.Item>
                )}
              </Descriptions>
            </>
          )}
        </>
      )}
    </Modal>
  )
}
