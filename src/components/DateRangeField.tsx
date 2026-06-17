import { useEffect, useState } from 'react'
import { DatePicker, Radio, Space } from 'antd'
import type { RadioChangeEvent } from 'antd'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker

export type Range = [Dayjs, Dayjs] | null

// 快速區間(admin 歷史查詢:近一個月看近況、半年做回顧;其餘走自訂)
const presetDefs: { key: string; label: string; make: () => [Dayjs, Dayjs] }[] = [
  { key: '30d', label: '近30天', make: () => [dayjs().add(-30, 'd'), dayjs()] },
  { key: '6m', label: '近半年', make: () => [dayjs().add(-6, 'month'), dayjs()] },
]

type Mode = 'all' | '30d' | '6m' | 'custom'

// 由目前值反推模式(對不上任何快捷且有值=自訂)
function deriveMode(value: Range): Mode {
  if (!value) return 'all'
  for (const p of presetDefs) {
    const [f, t] = p.make()
    if (value[0].isSame(f, 'day') && value[1].isSame(t, 'day')) return p.key as Mode
  }
  return 'custom'
}

/** 日期區間欄位:Radio 快捷(不指定/近30天/近半年/自訂);選「自訂」才展開 RangePicker */
export default function DateRangeField({ value, onChange }: { value: Range; onChange: (v: Range) => void }) {
  const [mode, setMode] = useState<Mode>(deriveMode(value))

  // 外部值變動(如「清除」重置)時同步模式
  useEffect(() => {
    setMode(deriveMode(value))
  }, [value])

  const onRadio = (e: RadioChangeEvent) => {
    const k = e.target.value as Mode
    setMode(k)
    if (k === 'all') onChange(null)
    else if (k !== 'custom') {
      const p = presetDefs.find((x) => x.key === k)
      if (p) onChange(p.make())
    }
    // k === 'custom':保留現值,僅展開日曆讓使用者挑
  }

  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Radio.Group size="small" buttonStyle="solid" value={mode} onChange={onRadio}>
        <Radio.Button value="all">不指定</Radio.Button>
        <Radio.Button value="30d">近30天</Radio.Button>
        <Radio.Button value="6m">近半年</Radio.Button>
        <Radio.Button value="custom">自訂</Radio.Button>
      </Radio.Group>
      {mode === 'custom' && (
        <RangePicker
          value={value}
          onChange={(v) => onChange(v && v[0] && v[1] ? [v[0], v[1]] : null)}
          style={{ width: '100%' }}
        />
      )}
    </Space>
  )
}
