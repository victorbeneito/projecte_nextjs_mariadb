import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

// Definimos props para Next.js 15
type PageProps = {
  params: Promise<{ id: string }>;
};

// Helper para URL
const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// 1. Obtener el nombre de la categoría (Usando la API que creamos antes)
async function getCategoria(id: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/categorias/${id}`, { 
      cache: "no-store" 
    });
    const data = await res.json();
    return data.ok ? data.categoria : null;
  } catch (error) {
    console.error("Error cargando categoría:", error);
    return null;
  }
}

// 2. Obtener productos filtrados (Usando la API corregida con ?categoria=ID)
async function getProductos(id: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/productos?categoria=${id}`, { 
      cache: "no-store" 
    });
    const data = await res.json();
    return data.ok ? data.productos : [];
  } catch (error) {
    console.error("Error cargando productos:", error);
    return [];
  }
}

export default async function CategoryPage({ params }: PageProps) {
  // Desempaquetamos los params (Next 15)
  const { id } = await params;

  // Hacemos las dos peticiones a la vez (Paralelo)
  const [categoria, productos] = await Promise.all([
    getCategoria(id),
    getProductos(id)
  ]);

  // Si quieres que de 404 si la categoría no existe, descomenta esto:
  // if (!categoria) return notFound();

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">
        Productos categoría{" "}
        <span className="text-accent">
          {categoria ? categoria.nombre : "Sin nombre"}
        </span>
      </h1>

      {productos.length > 0 ? (
        // Usamos tu componente ProductGrid pasándole los datos
        <ProductGrid
          productosFiltrados={productos}
          busquedaActiva={true} // Forzamos mostrar grid
          productosDestacados={[]} 
        />
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">
            No hay productos en esta categoría actualmente.
          </p>
        </div>
      )}
    </main>
  );
}