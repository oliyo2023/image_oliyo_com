// next.config.js
const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置路径别名
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    return config;
  },
  // 构建时忽略 ESLint（最省事）
  eslint: {
    ignoreDuringBuilds: true
  },
  // 其他配置...
};

module.exports = withNextIntl(nextConfig);