import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductoPage({ params }: PageProps) {
  // 1. Obtener ID y convertir a número
  const { id } = await params;
  const idNumero = parseInt(id);

  if (isNaN(idNumero)) {
    return notFound();
  }

  // 2. Pedir datos a la BD
  const productoRaw = await prisma.producto.findUnique({
    where: { id: idNumero },
    include: {
      categoria: true,
      variantes: true,
      marca: true
    }
  });

  if (!productoRaw) {
    return notFound();
  }

  // 3. ADAPTACIÓN DE DATOS (Aquí estaba el error)
  // Como la BD no tiene campos de descuento, los forzamos a null para que no falle.
  const productoAdaptado = {
    ...productoRaw,
    
    // Convertimos precios a número estándar
    precio: Number(productoRaw.precio),

    // 🔥 FIX: Si la BD no tiene estas columnas, enviamos null o undefined
    // (Si alguna vez las añades a la BD, podrás cambiar esto)
    precio_descuento: null, 
    descuento_porcentaje: null, 

    // Convertimos imágenes de Json a Array
    imagenes: Array.isArray(productoRaw.imagenes) ? (productoRaw.imagenes as string[]) : [],
  };

  return <ProductDetail producto={productoAdaptado as any} />;
}