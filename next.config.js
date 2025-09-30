// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置路径别名
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    return config;
  },
  // 其他配置...
};

module.exports = nextConfig;