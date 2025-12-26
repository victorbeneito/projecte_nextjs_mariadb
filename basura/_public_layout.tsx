// src/app/(public)/layout.tsx
import AppShell from "@/components/AppShell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}



// import type { Metadata } from "next";
// import "./globals.css";
// import AppShell from "@/components/AppShell";
// import { AuthProvider } from "@/context/AuthContext";

// export const metadata: Metadata = {
//   title: "Tenda Hogar",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="es">
//       <body>
//         <AuthProvider>
//           <AppShell>{children}</AppShell>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

