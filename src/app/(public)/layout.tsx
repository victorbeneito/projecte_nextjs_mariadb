import "./globals.css";
// 👇 1. Importa el proveedor que acabamos de crear
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClienteAuthProvider } from "@/context/ClienteAuthContext";
import { AuthProvider } from "@/context/AuthContext";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "El Hogar de tus Sueños",
  description: "Textil hogar y decoración",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* 👇 Añade suppressHydrationWarning al html para evitar errores de tema */}
      <body className="bg-fondo dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        {/* 👇 2. Envuelve TODO con el ThemeProvider */}
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