// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";           // Para ADMIN panel
import { ClienteAuthProvider } from "@/context/ClienteAuthContext"; // Para CLIENTES tienda

export const metadata: Metadata = {
  title: "Tenda Hogar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* Provider ADMIN (tu sistema actual - NO SE ROMPE) */}
        <AuthProvider>
          {/* Provider CLIENTES (nuevo - para tienda pública) */}
          <ClienteAuthProvider>
            {children}
          </ClienteAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
