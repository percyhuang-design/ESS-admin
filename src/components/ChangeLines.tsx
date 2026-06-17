import { ArrowRightOutlined } from '@ant-design/icons'
import { FieldChange } from '../data/mock'

/** 異動的精簡內嵌呈現:每筆「欄位:原值 → 新值」,多欄位堆疊。列表欄與確認 Modal 共用。 */
export default function ChangeLines({ changes }: { changes: FieldChange[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {changes.map((c, i) => (
        <div key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
          <span style={{ color: '#64748B' }}>{c.field}:</span>{' '}
          <span style={{ color: '#94A3B8' }}>{c.before}</span>
          <ArrowRightOutlined style={{ color: '#94A3B8', margin: '0 4px', fontSize: 11 }} />
          <span style={{ color: '#0F172A', fontWeight: 600 }}>{c.after}</span>
        </div>
      ))}
    </div>
  )
}
