/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "node:http": false,
        "node:https": false,
      };
    }
    return config;
  },
};

export default nextConfig;
