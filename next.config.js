/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/TechKids-BG-',
  assetPrefix: '/TechKids-BG-/',
  images: { unoptimized: true },
  trailingSlash: true,
}

module.exports = nextConfig
