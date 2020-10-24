import { createTheme, updateTheme } from '@mantou/gem/helper/theme';

export const defaultTheme = {
  font:
    '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
  sidebarWidth: '230px',
  mainWidth: '780px',
  headerHeight: '55px',
  textColor: '#000',
  borderColor: '#eaeaea',
  linkColor: '#009688',
  sidebarLinkArrowColor: '#999',
  codeFont: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace',
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
