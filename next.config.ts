import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            // 1. Domaine pour l'exemple initial (Placeholder)
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
                port: '',
                pathname: '/**',
            },
            // 2. DiceBear Avatars API - for AI character avatars
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
                port: '',
                pathname: '/**',
            },
            // 3. UI Avatars (legacy fallback)
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                port: '',
                pathname: '/**',
            },
            // 4. AliveAI API - for AI-generated character images
            {
                protocol: 'https',
                hostname: 'api.aliveai.app',
                port: '',
                pathname: '/**',
            },
            // 5. AliveAI CDN/Files - for AI-generated character images (AWS S3 signed URLs)
            {
                protocol: 'https',
                hostname: 'files.aliveai.app',
                port: '',
                pathname: '/**',
            },
            // 6. AliveAI CDN alternate domain (if any)
            {
                protocol: 'https',
                hostname: 'cdn.aliveai.app',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;