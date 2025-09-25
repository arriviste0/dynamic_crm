import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-specific modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "mongodb": false,
        "child_process": false,
        "dns": false,
        "net": false,
        "tls": false,
        "fs": false,
        "stream": false,
        "crypto": false,
        "process": false,
        "path": false,
        "os": false,
        "zlib": false,
        "fs/promises": false,
        "timers/promises": false,
        "http": false,
        "https": false,
        "url": false,
        "util": false,
        "assert": false,
        "buffer": false,
      };

      // Ignore all mongodb related modules on client side
      config.module.rules.push({
        test: /mongodb.*|dns|net|tls|fs|child_process|crypto|buffer/,
        use: 'null-loader'
      });

      // Ensure mongodb is not included in client bundles
      config.resolve.alias = {
        ...config.resolve.alias,
        'mongodb': false,
        'mongodb-client-encryption': false,
        'bson': false
      };
    }
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
