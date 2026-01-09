import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Definición correcta para Next.js 15+ (params es una Promesa)
type RouteParams = {
  params: Promise<{ id: string }>;
};

// ----------------------------------------------------------------------
// GET: Obtener un producto por ID
// ----------------------------------------------------------------------
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // 1. Desempaquetar la promesa de params (CRÍTICO EN NEXT 15)
    const { id: idString } = await params;
    
    console.log(`🔍 [API GET] Recibido ID: "${idString}"`);

    // 2. Convertir a número
    const id = parseInt(idString);

    if (isNaN(id)) {
      console.error(`❌ [API GET] ID inválido (NaN): "${idString}"`);
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    // 3. Buscar en BD
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        marca: true,
        categoria: true,
        variantes: true, 
      },
    });

    if (!producto) {
      console.error(`❌ [API GET] Producto ID ${id} no encontrado en BD.`);
      return NextResponse.json(
        { ok: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    console.log(`✅ [API GET] Producto ID ${id} encontrado y enviado.`);
    return NextResponse.json({ ok: true, producto }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error CRÍTICO GET /api/productos/[id]:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// PUT: Actualizar un producto
// ----------------------------------------------------------------------
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);

    if (isNaN(id)) {
        return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    console.log(`📝 [API PUT] Actualizando Producto ID ${id}. Body recibido.`);

    // 1. Verificar existencia
    const productoExistente = await prisma.producto.findUnique({ where: { id } });
    if (!productoExistente) {
      return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
    }

    // 2. Preparar relaciones (Marca y Categoria)
    let marcaConnect: { connect: { id: number } } | undefined;
    let categoriaConnect: { connect: { id: number } } | undefined;

    if (body.marca) {
      const marca = await prisma.marca.findFirst({ where: { nombre: body.marca } });
      if (!marca) return NextResponse.json({ ok: false, error: `Marca ${body.marca} no encontrada` }, { status: 400 });
      marcaConnect = { connect: { id: marca.id } };
    }

    if (body.categoria) {
      const cat = await prisma.categoria.findFirst({ where: { nombre: body.categoria } });
      if (!cat) return NextResponse.json({ ok: false, error: `Categoría ${body.categoria} no encontrada` }, { status: 400 });
      categoriaConnect = { connect: { id: cat.id } };
    }

    // 3. Transacción (Borrar variantes viejas -> Actualizar Prod -> Crear variantes nuevas)
    const productoActualizado = await prisma.$transaction(async (tx) => {
      
      // A. Borrar variantes anteriores si se envían nuevas
      if (body.variantes) {
        await tx.variante.deleteMany({
          where: { productoId: id },
        });
      }

      // B. Update principal
      const producto = await tx.producto.update({
        where: { id },
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion,
          descripcion_html: body.descripcion_html_cruda, 
          precio: body.precio ? parseFloat(body.precio) : undefined,
          stock: body.stock ? parseInt(body.stock) : undefined,
          destacado: body.destacado,
          imagenes: body.imagenes, // Prisma maneja el array JSON

          // Relaciones
          marca: marcaConnect,
          categoria: categoriaConnect,

          // C. Crear variantes nuevas
          variantes: body.variantes ? {
            create: body.variantes.map((v: any) => ({
              color: v.color,
              imagen: v.imagen,
              tamano: v.tamaño, 
              tirador: v.tirador,
              precio_extra: parseFloat(v.precio_extra || 0),
            })),
          } : undefined,
        },
        include: {
          marca: true,
          categoria: true,
          variantes: true,
        },
      });

      return producto;
    });

    console.log(`✅ [API PUT] Producto ID ${id} actualizado correctamente.`);
    return NextResponse.json({ ok: true, producto: productoActualizado }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error PUT /api/productos/[id]:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// DELETE: Eliminar un producto
// ----------------------------------------------------------------------
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);

    if (isNaN(id)) return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });

    console.log(`🗑️ [API DELETE] Eliminando Producto ID ${id}...`);

    await prisma.producto.delete({
      where: { id },
    });

    console.log(`✅ [API DELETE] Producto ID ${id} eliminado.`);
    return NextResponse.json({ ok: true, message: "Producto eliminado correctamente" }, { status: 200 });
    
  } catch (error: any) {
    if (error.code === 'P2025') {
        return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
    }
    
    console.error("❌ Error DELETE /api/productos/[id]:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}