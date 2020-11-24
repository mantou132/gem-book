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
  linkColor: '#26c0e3',
  sidebarLinkArrowColor: '#999',
  tableHeaderColor: '#666',
  tableHeaderBackground: '#fafafa',
  inlineCodeColor: '#d23a3a',
  inlineCodeBackground: '#f6f6f6',
  codeBlockTextColor: 'black',
  codeBlockBackground: '#f6f6f6',
};

export type Theme = typeof defaultTheme;

export const theme = createTheme(defaultTheme);

export function changeTheme(newTheme?: Partial<typeof theme>) {
  updateTheme(theme, { ...newTheme });
}
