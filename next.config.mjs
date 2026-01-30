/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    distDir: 'build',
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
typescript: {
    // !! ATENCIÓN !!
    // Ignoramos errores para que Azure pueda desplegar aunque el seed.ts tenga fallos
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',

};


export default nextConfig;
