import { createTheme, updateTheme } from '@mantou/gem/helper/theme';

export const defaultTheme = {
  font: 'BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, sans-serif',
  codeFont: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace',
  sidebarWidth: '230px',
  mainWidth: '780px',
  headerHeight: '55px',
  backgroundColor: 'white',
  textColor: 'black',
  borderColor: '#eaeaea',
  linkColor: '#009688',
  sidebarLinkArrowColor: '#999',
  tableHeaderColor: '#666',
  tableHeaderBackground: '#fafafa',
  inlineCodeColor: 'rgb(116, 66, 16)',
  inlineCodeBackground: 'rgb(254, 252, 191)',
  codeBlockTextColor: 'white',
  codeBlockBackground: '#011627',
};

export type Theme = typeof defaultTheme;

export const theme = createTheme(defaultTheme);

export function changeTheme(newTheme?: Partial<typeof theme>) {
  updateTheme(theme, { ...newTheme });
}
