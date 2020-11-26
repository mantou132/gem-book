import { createTheme, updateTheme } from '@mantou/gem/helper/theme';

export const defaultTheme = {
  font:
    '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif',
  sidebarWidth: '230px',
  mainWidth: '780px',
  headerHeight: '55px',
  backgroundColor: 'white',
  borderColor: '#eaeaea',
  textColorRGB: '40, 44, 52',
  textColor: 'rgb(40, 44, 52)',
  primaryColorRGB: '38, 192, 227',
  primaryColor: 'rgb(38, 192, 227)',
  inlineCodeBackground: '#ffe56433',
  tableHeaderColor: '#666',
  tableHeaderBackground: '#fafafa',
};

export type Theme = typeof defaultTheme;

export const theme = createTheme(defaultTheme);

export function changeTheme(newTheme?: Partial<typeof theme>) {
  updateTheme(theme, { ...newTheme });
}
