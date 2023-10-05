import { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    fontFamily: 'var(--font-family)',
    colorLink: '#0070c9', // $fusion-active-link-color
    borderRadius: 2,
    colorBgContainer: '#f2f2f2',
  },
  components: {
    Modal: {
      titleColor: '#333333', // $fusion-primary-text-color,
      contentBg: '#f2f2f2',
      headerBg: '#f2f2f2',
    },
    Table: {
      headerColor: '#8c8c8c', // $fusion-neutral-7
    },
    Menu: {
      darkItemBg: '#050a56',
      darkSubMenuItemBg: '#050a56',
    },
  },
  components: {
    Modal: {
      titleColor: '#333333', // $fusion-primary-text-color,
      contentBg: '#f2f2f2',
      headerBg: '#f2f2f2',
    },
    Table: {
      headerColor: '#8c8c8c', // $fusion-neutral-7
    },
  },
  hashed: false,
};
