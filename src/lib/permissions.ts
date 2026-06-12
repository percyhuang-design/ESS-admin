import { BizCategory, CATEGORY_LABEL, ChangeRequest, DemoUser } from '../data/mock'

const ALL_CATEGORIES = Object.keys(CATEGORY_LABEL) as BizCategory[]

/** 此身分在 HR Admin 端可見的業務分類:admin 全部、hr 負責分類、員工無 */
export function visibleCategories(user: DemoUser): BizCategory[] {
  if (user.role === 'admin') return ALL_CATEGORIES
  if (user.role === 'hr') return user.categories ?? []
  return []
}

/** 此身分是否可在 HR Admin 端看到某張申請單 */
export function canSeeRequest(user: DemoUser, req: ChangeRequest): boolean {
  return visibleCategories(user).includes(req.category)
}

/**
 * 是否可審核(同意/拒絕)某張申請單。
 * 預設僅「負責該分類的 HR」可審;admin 是否可代審列為待確認決策(見 DESIGN.md §2)。
 */
export function canReview(user: DemoUser, req: ChangeRequest): boolean {
  return user.role === 'hr' && (user.categories ?? []).includes(req.category)
}
