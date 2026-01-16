"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import AccountSidebar from "@/components/AccountSidebar";
import AppShell from "@/components/AppShell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { cliente, loading } = useClienteAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !cliente) {
      router.push("/auth");
    }
  }, [cliente, loading, router]);

  if (loading) {
    return (
      // 👇 FIX 1: Fondo oscuro también en la carga
      <div className="flex items-center justify-center min-h-screen bg-fondo dark:bg-darkBg">
        <p className="text-gray-500 dark:text-gray-300">Comprobando sesión...</p>
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <AppShell>
      {/* 👇 FIX 2: AQUÍ ESTABA EL PROBLEMA */}
      {/* Cambiamos bg-gray-50 por bg-fondo y añadimos dark:bg-darkBg */}
      <div className="flex min-h-screen bg-fondo dark:bg-darkBg transition-colors duration-300">
        
        {/* El Sidebar seguramente necesite revisión si tiene colores fijos, pero esto arregla el fondo general */}
        <AccountSidebar />
        
        <main className="flex-1 p-8 text-secondary dark:text-darkNavText">
            {children}
        </main>

      </div>
    </AppShell>
  );
}