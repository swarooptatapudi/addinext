import type { NextConfig } from 'next';
import { env } from 'process';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://uaterp.addiwise.com/api/:path*'
        // destination: 'https://uaterp.addiwise.com/api/:path*'
        // destination: 'https://erp.addiwise.com/api/:path*'
      }
    ];
  },
  env:{
    NEXT_PUBLIC_RAZORPAY_KEY_ID:'rzp_test_46JKVeIJoXgPra',
    RAZORPAY_KEY_SECRET:'nyqmEQckDeosGzUua5uXnyzh'
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
