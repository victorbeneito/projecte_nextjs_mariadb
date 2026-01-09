import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ----------------------------------------------------------------------
// GET /api/productos
// Obtener lista de productos con filtros (categoría, búsqueda, etc.)
// ----------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoriaParam = searchParams.get("categoria"); // Puede ser "5" (ID) o "Estores" (Nombre)
    const q = searchParams.get("q") || searchParams.get("search");
    const destacado = searchParams.get("destacado");

    // Construimos el filtro dinámicamente
    const whereClause: any = {};

    // 1. Lógica inteligente para Categoría (ID o Nombre)
    if (categoriaParam) {
      const catId = parseInt(categoriaParam);

      if (!isNaN(catId)) {
        // A) Es un número (ID de MariaDB) -> Filtramos por ID
        whereClause.categoriaId = catId;
      } else {
        // B) Es texto -> Filtramos por la relación de nombre (Legacy support)
        whereClause.categoria = {
          nombre: categoriaParam
        };
      }
    }

    // 2. Filtro por Buscador (q)
    if (q) {
      whereClause.OR = [
        { nombre: { contains: q } }, // Si usas Postgres: mode: 'insensitive'
        { descripcion: { contains: q } }
      ];
    }

    // 3. Filtro Destacados
    if (destacado === "true") {
      whereClause.destacado = true;
    }

    const productos = await prisma.producto.findMany({
      where: whereClause,
      include: {
        marca: true,     
        categoria: true, 
        variantes: true  
      },
      orderBy: {
        createdAt: 'desc' // Mostrar los más nuevos primero
      }
    });

    return NextResponse.json({ ok: true, productos }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error en GET /api/productos:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// POST /api/productos
// Crear un nuevo producto
// ----------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validar si existen Marca y Categoria
    // Buscamos por nombre exacto (asumiendo que el admin envía nombres)
    const marca = await prisma.marca.findFirst({
      where: { nombre: body.marca }
    });

    const categoria = await prisma.categoria.findFirst({
      where: { nombre: body.categoria }
    });

    if (!marca) {
      return NextResponse.json(
        { ok: false, error: `Marca "${body.marca}" no encontrada` },
        { status: 400 }
      );
    }

    if (!categoria) {
      return NextResponse.json(
        { ok: false, error: `Categoría "${body.categoria}" no encontrada` },
        { status: 400 }
      );
    }

    // 2. Crear el producto
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || "",
        descripcion_html: body.descripcion_html_cruda || "",
        precio: parseFloat(body.precio),
        stock: parseInt(body.stock),
        destacado: body.destacado || false,
        
        // Manejo de Imágenes (Array -> JSON)
        imagenes: body.imagenes || [], 

        // Conectar Relaciones por sus IDs encontrados arriba
        marca: {
          connect: { id: marca.id }
        },
        categoria: {
          connect: { id: categoria.id }
        },

        // Crear Variantes anidadas
        variantes: {
          create: body.variantes?.map((v: any) => ({
            color: v.color,
            imagen: v.imagen,
            tamano: v.tamaño, // 'tamano' sin ñ según tu schema
            tirador: v.tirador,
            precio_extra: parseFloat(v.precio_extra || 0)
          })) || []
        }
      },
      include: {
        marca: true,
        categoria: true,
        variantes: true
      }
    });

    return NextResponse.json(
      { ok: true, producto: nuevoProducto },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("❌ POST Error /api/productos:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }
}