import { useCallback, useState } from 'react'
import dayjs from 'dayjs'
import { changeRequests as seed, ChangeRequest } from '../data/mock'

const now = () => dayjs().format('YYYY-MM-DD HH:mm')

/**
 * 申請單狀態管理(架構期以前端 state 模擬;正式版改為 API 寫入 + 重新查詢)。
 * 核准/退回會就地更新單據,連動待審 badge 與結案查詢。
 */
export function useRequests() {
  const [requests, setRequests] = useState<ChangeRequest[]>(seed)

  const approve = useCallback((id: string, reviewerName: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved', reviewerName, reviewedAt: now() } : r)),
    )
  }, [])

  const reject = useCallback((id: string, reviewerName: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'rejected', reviewerName, reviewedAt: now(), rejectReason: reason } : r,
      ),
    )
  }, [])

  // 批次核准/退回:一次更新,僅作用於仍為 pending 的單據(避免重覆結案)
  const approveMany = useCallback((ids: string[], reviewerName: string) => {
    const set = new Set(ids)
    const at = now()
    setRequests((prev) =>
      prev.map((r) =>
        set.has(r.id) && r.status === 'pending'
          ? { ...r, status: 'approved', reviewerName, reviewedAt: at }
          : r,
      ),
    )
  }, [])

  const rejectMany = useCallback((ids: string[], reviewerName: string, reason: string) => {
    const set = new Set(ids)
    const at = now()
    setRequests((prev) =>
      prev.map((r) =>
        set.has(r.id) && r.status === 'pending'
          ? { ...r, status: 'rejected', reviewerName, reviewedAt: at, rejectReason: reason }
          : r,
      ),
    )
  }, [])

  return { requests, approve, reject, approveMany, rejectMany }
}
