
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Redirect legacy parent routes to home/login if someone hits them
      {
        source: '/dashboard/parent',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/',
        permanent: false,
      }
    ];
  },
};

module.exports = nextConfig;
