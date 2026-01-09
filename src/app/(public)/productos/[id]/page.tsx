import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

// 1. Definimos los props para Next.js 15+ (params es una Promise)
type PageProps = {
  params: Promise<{ id: string }>;
};

// 2. Función helper para obtener la URL base
// Esto evita errores cuando fetch se ejecuta en el servidor
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://localhost:3000"; // Fallback por defecto para local
};

async function getProducto(id: string) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/productos/${id}`;

  console.log(`📡 [Page] Buscando producto ID: ${id} en URL: ${url}`);

  try {
    const res = await fetch(url, {
      cache: "no-store", // Evitamos caché antigua
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      console.error(`❌ [Page] La API devolvió error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    
    // Verificación extra por si la API devuelve ok:true pero sin producto
    if (!data || !data.producto) {
        console.error("❌ [Page] Datos vacíos recibidos:", data);
        return null;
    }

    return data.producto;

  } catch (error) {
    console.error("❌ [Page] Error crítico de conexión:", error);
    return null;
  }
}

export default async function ProductoPage({ params }: PageProps) {
  // 3. Desempaquetamos la promesa de los params (Obligatorio en Next 15)
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 4. Intentamos obtener el producto
  const producto = await getProducto(id);

  // 5. Si no hay producto, mostramos la página 404 de Next.js
  if (!producto) {
    notFound(); 
  }

  // 6. Si todo va bien, mostramos el componente cliente
  return <ProductDetail producto={producto} />;
}