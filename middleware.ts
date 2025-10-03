import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // 支持的语言列表
  locales: ['en', 'zh', 'es', 'fr', 'de', 'ja'],
  
  // 默认语言
  defaultLocale: 'en',
  
  // 始终使用语言前缀
  localePrefix: 'always'
});

export const config = {
  // 匹配除了特定路径之外的所有路径
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};