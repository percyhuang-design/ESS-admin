import type { ReactNode } from 'react'
import { Empty } from 'antd'

interface Props {
  title: string
  description: ReactNode
  /** default=插圖、simple=簡約線框 */
  image?: 'default' | 'simple'
  /** 選用:下方動作(如「搜尋」鈕) */
  action?: ReactNode
}

/** 統一空狀態:標題(粗) + 說明(次要) + 選用動作 */
export default function EmptyState({ title, description, image = 'default', action }: Props) {
  return (
    <Empty
      image={image === 'simple' ? Empty.PRESENTED_IMAGE_SIMPLE : Empty.PRESENTED_IMAGE_DEFAULT}
      style={{ padding: '40px 0' }}
      description={
        <div>
          <div style={{ fontWeight: 600, color: '#475569', fontSize: 15, marginBottom: 4 }}>{title}</div>
          <div style={{ color: '#94A3B8', fontSize: 13 }}>{description}</div>
        </div>
      }
    >
      {action}
    </Empty>
  )
}
