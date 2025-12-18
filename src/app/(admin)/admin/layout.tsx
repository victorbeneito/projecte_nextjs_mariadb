// src/app/(admin)/layout.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login"); // o la ruta de login que tengas para admin
    }
  }, [user, router]);

  if (!user) {
    return <div className="p-8">Redirigiendo al login...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* aquí tu header propio del panel si quieres */}
      <main className="max-w-screen-2xl mx-auto py-8 px-4">{children}</main>
    </div>
  );
}


