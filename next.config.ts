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
            // 2. ⚠️ AJOUTEZ ICI LE(S) DOMAINE(S) DE VOTRE VRAIE API D'IA (par exemple, OpenAI, Google Cloud Storage, etc.)
            // Exemple : Si vos images sont hébergées sur un service d'IA qui utilise 'storage.ia.com'
            // {
            //     protocol: 'https',
            //     hostname: 'storage.ia.com',
            //     port: '',
            //     pathname: '/**',
            // },
        ],
    },
};

export default nextConfig;