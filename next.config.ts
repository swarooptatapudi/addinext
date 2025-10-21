import type { NextConfig } from 'next';
import { env } from 'process';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // destination: 'https://prderp.addiwise.com/api/:path*'
        destination: 'https://uaterp.addiwise.com/api/:path*'
        // destination: 'https://erp.addiwise.com/api/:path*'
      }
    ];
  },
  env: {
    NEXT_PUBLIC_HDFC_MERCHANT_ID: process.env.NEXT_PUBLIC_HDFC_MERCHANT_ID,
    NEXT_PUBLIC_HDFC_API_KEY: process.env.NEXT_PUBLIC_HDFC_API_KEY,
    HDFC_SECRET_KEY: process.env.HDFC_SECRET_KEY,
    NEXT_PUBLIC_HDFC_GATEWAY_URL: process.env.NEXT_PUBLIC_HDFC_GATEWAY_URL,
    NEXT_PUBLIC_HDFC_PAYMENT_CLIENT_ID: process.env.NEXT_PUBLIC_HDFC_PAYMENT_CLIENT_ID,
  },
  webpack: (config: { optimization: any; }) => {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxSize: 244 * 1024,
      }
    };
    return config;
  }
};

export default nextConfig;

// import type { NextConfig } from 'next';

// const nextConfig: NextConfig = {
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*', // Match the API path
//         // destination: 'https://erp.addiwise.com/api/:path*'
//           destination: 'http://147.93.96.6/api/:path*'
//         // destination: 'http://127.0.0.1:8000/api/:path*'
//         // destination: 'http://frappe-bench.localhost/api/:path*',
//       }
//     ];
//   }
// };

// export default nextConfig;
