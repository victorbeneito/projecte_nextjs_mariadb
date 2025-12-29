"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";


interface TokenPayload {
  id: string;
  email: string;
  rol?: string;
  exp?: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [autenticado, setAutenticado] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);

      // Comprobamos si el token expiró
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("adminToken");
        router.replace("/admin/login");
        return;
      }

      // Verificamos que tenga rol admin
      if (decoded.rol !== "admin") {
        router.replace("/admin/login");
        return;
      }

      // Guardamos el correo para mostrarlo en el panel
      setAdminEmail(decoded.email);
      setAutenticado(true);
    } catch (error) {
      console.error("Token inválido o corrupto", error);
      localStorage.removeItem("adminToken");
      router.replace("/admin/login");
    }
  }, [router]);

  if (!autenticado) {
    return (
      <div className="p-8 text-center">
        Verificando acceso al panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Panel de Administración
        </h1>
        {adminEmail && (
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{adminEmail}</span>
            <button
              onClick={() => {
                localStorage.removeItem("adminToken");
                router.replace("/admin/login");
              }}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <main className="p-8">{children}</main>
    </div>
  );
}



// 'use client';
// export const dynamic = 'force-dynamic';

// import { AuthProvider } from '@/context/AuthContext';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // 🧩 Evita ejecución durante el build (SSR)
//   if (typeof window === 'undefined') return null;

//   const { user } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) router.replace('/login');
//   }, [user, router]);

//   if (!user) {
//     return <div className="p-8">Redirigiendo al login...</div>;
//   }

//   return (
//     <AuthProvider>
//       <div className="min-h-screen bg-gray-100">
//         <main className="max-w-screen-2xl mx-auto py-8 px-4">{children}</main>
//       </div>
//     </AuthProvider>
//   );
// }


// "use client";
// export const dynamic = "force-dynamic";

// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // evita ejecución durante el SSR (build)
//   if (typeof window === "undefined") {
//     return null;
//   }

//   const { user } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) {
//       router.replace("/login");
//     }
//   }, [user, router]);

//   if (!user) {
//     return <div className="p-8">Redirigiendo al login...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <main className="max-w-screen-2xl mx-auto py-8 px-4">{children}</main>
//     </div>
//   );
// }


// // src/app/(admin)/layout.tsx
// "use client";
// export const dynamic = "force-dynamic";

// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) {
//       router.replace("/login"); // o la ruta de login que tengas para admin
//     }
//   }, [user, router]);

//   if (!user) {
//     return <div className="p-8">Redirigiendo al login...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* aquí tu header propio del panel si quieres */}
//       <main className="max-w-screen-2xl mx-auto py-8 px-4">{children}</main>
//     </div>
//   );
// }


