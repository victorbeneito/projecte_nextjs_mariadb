import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categorias: any[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/api/categorias`,
      { next: { revalidate: 0 } }
    );
    const data = await res.json();
    if (data.ok) categorias = data.categorias;
  } catch (err) {
    console.error("Error fetching categorías:", err);
  }

  return <AppShell categorias={categorias}>{children}</AppShell>;
}
