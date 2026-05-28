import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1024mb', // 1 Go (très large pour les uploads)
    },
  },
  
  // AJOUTE CECI :
  async redirects() {
    return [
      {
        source: '/',           // Quand l'utilisateur arrive sur la racine
        destination: '/register', // Il est envoyé vers register
        permanent: true,       // Indique aux navigateurs que c'est une redirection définitive
      },
    ];
  },
};

export default nextConfig;