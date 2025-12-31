import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categorias: any[] = [];

  try {
    // 🔹 Base URL válida en desarrollo y producción
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/categorias`, { cache: "no-store" });
    const data = await res.json();
    if (data.ok) categorias = data.categorias;
  } catch (err) {
    console.error("Error fetching categorías:", err);
  }

  return <AppShell categorias={categorias}>{children}</AppShell>;
}

