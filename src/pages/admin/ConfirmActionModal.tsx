import { useEffect, useState } from 'react'
import { Alert, Input, Modal, Typography } from 'antd'
import { ChangeRequest, changesOf, serviceItems } from '../../data/mock'
import ChangeLines from '../../components/ChangeLines'

const itemName = (key: string) => serviceItems.find((s) => s.key === key)?.name ?? key

interface Props {
  open: boolean
  request: ChangeRequest | null
  type: 'approve' | 'reject'
  onConfirm: (reason?: string) => void
  /** 取消:回到審核 Modal(由父層決定),非直接回清單 */
  onCancel: () => void
}

/**
 * 獨立確認 Modal — 由審核 Modal「結束後」彈出(循序、不堆疊)。
 * 核准:確認訊息(金流加警示);退回:理由必填。帶上「誰的哪個項目」避免失去脈絡。
 */
export default function ConfirmActionModal({ open, request, type, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState('')

  // 每次開啟(或換申請單)清空理由
  useEffect(() => {
    setReason('')
  }, [open, request?.id])

  const r = request
  const isApprove = type === 'approve'
  const sensitive = r?.category === 'payroll'
  const who = r ? (
    <>
      <b>{r.employeeName}</b> 的「{itemName(r.itemKey)}」變更
    </>
  ) : null

  const submit = () => {
    if (isApprove) {
      onConfirm()
    } else {
      if (!reason.trim()) return
      onConfirm(reason.trim())
    }
  }

  return (
    <Modal
      title={isApprove ? '確認核准' : '退回申請'}
      open={open}
      onCancel={onCancel}
      onOk={submit}
      okText={isApprove ? '確認核准' : '送出退回'}
      okButtonProps={isApprove ? { type: 'primary' } : { danger: true, type: 'primary', disabled: !reason.trim() }}
      cancelText="取消"
      width={460}
    >
      {r &&
        (isApprove ? (
          <>
            <Typography.Paragraph style={{ marginBottom: 8 }}>核准 {who}?</Typography.Paragraph>
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 12,
              }}
            >
              <ChangeLines changes={changesOf(r)} />
            </div>
            <Alert
              type={sensitive ? 'warning' : 'info'}
              showIcon
              message={
                sensitive
                  ? '此為薪轉帳戶(金流)變更,請確認帳號無誤。核准後寫回主檔並通知員工,且無法復原。'
                  : '核准後將寫回員工主檔並通知員工,且無法復原。'
              }
            />
          </>
        ) : (
          <>
            <Typography.Paragraph style={{ marginBottom: 8 }}>退回 {who},請填寫拒絕理由(必填):</Typography.Paragraph>
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 12,
              }}
            >
              <ChangeLines changes={changesOf(r)} />
            </div>
            <Input.TextArea
              autoFocus
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="向員工說明退回原因,例如:電話格式不完整、需補附證明文件…"
            />
          </>
        ))}
    </Modal>
  )
}
