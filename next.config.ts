import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Match the API path
        destination: 'https://erp.addiwise.com/api/:path*'
        // destination: 'http://127.0.0.1:8000/api/:path*'
        // destination: 'http://frappe-bench.localhost/api/:path*',
      }
    ];
  }
};

export default nextConfig;
