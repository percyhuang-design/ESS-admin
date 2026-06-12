import { Card, Empty, Tag, Typography } from 'antd'

interface Props {
  title: string
  /** 所屬業務分類名稱(自助項目用,標示由哪個 HR 單位審核) */
  category?: string
  description?: string
  /** 後續迭代預計實作的內容,先列出對齊認知 */
  planned?: string[]
}

export default function PlaceholderPage({ title, category, description, planned }: Props) {
  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {title} {category && <Tag color="blue">{category}</Tag>}
      </Typography.Title>
      {description && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
          {description}
        </Typography.Paragraph>
      )}
      {planned && planned.length > 0 && (
        <ul style={{ color: 'rgba(0,0,0,0.45)', lineHeight: 1.9 }}>
          {planned.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      <Empty description="頁面內容於後續迭代實作(Placeholder)" style={{ margin: '48px 0' }} />
    </Card>
  )
}
