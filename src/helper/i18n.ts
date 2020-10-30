import { I18n } from '@mantou/gem/helper/i18n';

export const Resources = {
  en: {
    editOnGithub: 'Edit this page on GitHub',
    footer: 'Generated by $1<gem-book>',
  },
  zh: {
    editOnGithub: '在 Github 编辑此页',
    footer: '通过 $1<gem-book> 生成',
  },
};

export const selfI18n = new I18n<typeof Resources.en>({
  fallbackLanguage: 'en',
  resources: Resources,
});