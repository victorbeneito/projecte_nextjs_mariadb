import "./globals.css";
import { ClienteAuthProvider } from "@/context/ClienteAuthContext";
import { AuthProvider } from "@/context/AuthContext";
// 👇 1. Importamos el proveedor del tema (que creamos antes)
import { ThemeProvider } from "@/components/ThemeProvider"; 

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mi aplicación",
  description: "Proyecto Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* 👇 Añadimos transición y colores de texto para que se vea bien al cambiar */}
      <body className="bg-fondo dark:bg-darkBg text-secondary dark:text-darkNavText transition-colors duration-300">
        
        {/* 👇 2. IMPORTANTE: Envolver TODO con el ThemeProvider */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          <AuthProvider>
            <ClienteAuthProvider>
              {children}
            </ClienteAuthProvider>
          </AuthProvider>

        </ThemeProvider>
        
      </body>
    </html>
  );
}

// import "./globals.css";
// import { ClienteAuthProvider } from "@/context/ClienteAuthContext";
// import { AuthProvider } from "@/context/AuthContext";

// export const dynamic = "force-dynamic";

// export const metadata = {
//   title: "Mi aplicación",
//   description: "Proyecto Next.js",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="es" suppressHydrationWarning>
//       <body className="bg-fondo dark:bg-darkBg">
//         <AuthProvider>
//           <ClienteAuthProvider>{children}</ClienteAuthProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }


// import "./globals.css";
// import AppShell from "@/components/AppShell";
// import { ClienteAuthProvider } from "@/context/ClienteAuthContext";
// import { AuthProvider } from "@/context/AuthContext"; // 👈 añade esto

// export const metadata = {
//   title: "Mi aplicación",
//   description: "Proyecto Next.js",
// };

// export default async function RootLayout({ children }: { children: React.ReactNode }) {
//   let categorias: any[] = [];

//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/api/categorias`,
//       { next: { revalidate: 0 } }
//     );
//     const data = await res.json();
//     if (data.ok) categorias = data.categorias;
//   } catch (err) {
//     console.error("Error fetching categorías:", err);
//   }

//   return (
//     <html lang="es" suppressHydrationWarning>
//       <body className="bg-fondo dark:bg-darkBg">
//         {/* 👇 ahora ambos contextos están disponibles en toda la app */}
//         <AuthProvider>
//           <ClienteAuthProvider>
//             <AppShell categorias={categorias}>{children}</AppShell>
//           </ClienteAuthProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }


// import "./globals.css";
// import AppShell from "@/components/AppShell";
// import { ClienteAuthProvider } from "@/context/ClienteAuthContext";

// export const metadata = {
//   title: "Mi aplicación",
//   description: "Proyecto Next.js",
// };

// export default async function RootLayout({ children }: { children: React.ReactNode }) {
//   // 🔹 1. Fetch directo a tu propia API
//   let categorias: any[] = [];

//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/api/categorias`, {
//       next: { revalidate: 0 }, // Evita cachear en modo dev
//     });
//     const data = await res.json();
//     if (data.ok) categorias = data.categorias;
//   } catch (err) {
//     console.error("Error fetching categorías:", err);
//   }

//   // 🔹 2. Retornar layout completo
//   return (
//     <html lang="es" suppressHydrationWarning>
//       <body className="bg-fondo dark:bg-darkBg">
//         <ClienteAuthProvider>
//           <AppShell categorias={categorias}>{children}</AppShell>
//         </ClienteAuthProvider>
//       </body>
//     </html>
//   );
// }








// // src/app/layout.tsx
// import "./globals.css";
// import type { Metadata } from "next";
// import { Providers } from "./Providers";
// import AppShell from "@/components/AppShell";

// export const metadata: Metadata = {
//   title: "Tenda Hogar",
//   description: "Tu hogar, tu estilo",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="es">
//       <body>
//         <Providers>
//           <AppShell>{children}</AppShell>
//         </Providers>
//       </body>
//     </html>
//   );
// }



// // src/app/layout.tsx
// import "./globals.css";
// import type { Metadata } from "next";
// import { AuthProvider } from "@/context/AuthContext";
// import { ClienteAuthProvider } from "@/context/ClienteAuthContext";
// import { Toaster } from "react-hot-toast";
// import AppShell from "@/components/AppShell";

// export const metadata: Metadata = {
//   title: "Tenda Hogar",
//   description: "Tu hogar, tu estilo",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="es">
//       <body>
//         <AuthProvider>
//           <ClienteAuthProvider>
//             <AppShell>{children}</AppShell>

//             <Toaster
//               position="top-right"
//               toastOptions={{
//                 duration: 3000,
//                 style: { background: "#f9fafb", color: "#111827", border: "1px solid #e5e7eb" },
//                 success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
//                 error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
//               }}
//             />
//           </ClienteAuthProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
