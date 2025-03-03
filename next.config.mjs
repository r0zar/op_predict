/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['placehold.co'],
    },
    transpilePackages: ['@op-predict/lib', '@op-predict/mcp'],
    experimental: {
        esmExternals: 'loose'
    }
};

export default nextConfig;
