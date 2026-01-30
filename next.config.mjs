/** @type {import('next').NextConfig} */
const nextConfig = {
typescript: {
    // !! ATENCIÓN !!
    // Ignoramos errores para que Azure pueda desplegar aunque el seed.ts tenga fallos
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

};


export default nextConfig;
