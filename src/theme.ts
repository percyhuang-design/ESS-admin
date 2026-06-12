import type { ThemeConfig } from 'antd'

// ESS 企業後台:亮色內容區 + 深色側欄 + 藍色主色
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#2563EB',
    borderRadius: 8,
    fontFamily: `-apple-system, 'Segoe UI', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif`,
  },
  components: {
    Layout: {
      siderBg: '#0F172A',
      headerBg: '#FFFFFF',
      bodyBg: '#F1F5F9',
    },
    Menu: {
      darkItemBg: '#0F172A',
      darkSubMenuItemBg: '#0F172A',
      darkItemSelectedBg: '#2563EB',
    },
  },
}
