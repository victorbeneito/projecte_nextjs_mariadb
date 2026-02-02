import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);

    if (isNaN(id)) {
        return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    // 1. Buscar usando nombres del Schema (Mayúsculas)
    const pedidoRaw = await prisma.pedido.findUnique({
      where: { id },
      include: {
        PedidoProducto: true, // ✅ Corregido
        Cliente: true         // ✅ Corregido
      }
    });

    if (!pedidoRaw) {
      return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
    }

    // 2. Mapear para el frontend
    const pedido = {
        ...pedidoRaw,
        cliente: pedidoRaw.Cliente,          // Adaptador para el frontend
        productos: pedidoRaw.PedidoProducto  // Adaptador para el frontend
    };

    return NextResponse.json({ ok: true, pedido });
  } catch (error: any) {
    console.error("Error GET pedido:", error);
    return NextResponse.json({ ok: false, error: "Error de servidor", detalle: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const data = await req.json();

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
         estado: data.estado 
      }
    });

    return NextResponse.json({ ok: true, pedido });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// interface RouteParams {
//   params: Promise<{ id: string }>;
// }

// export async function GET(req: NextRequest, { params }: RouteParams) {
//   try {
//     const { id: idString } = await params;
//     const id = parseInt(idString);

//     if (isNaN(id)) {
//         return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
//     }

//     const pedido = await prisma.pedido.findUnique({
//       where: { id },
//       include: {
//         PedidoProducto: true, 
//         Cliente: true
//       }
//     });

//     if (!pedido) {
//       return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
//     }

//     return NextResponse.json({ ok: true, pedido });
//   } catch (error: any) {
//     return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
//   }
// }

// export async function PUT(req: NextRequest, { params }: RouteParams) {
//   try {
//     const { id: idString } = await params;
//     const id = parseInt(idString);
//     const data = await req.json();

//     const pedido = await prisma.pedido.update({
//       where: { id },
//       data: {
//          estado: data.estado 
//       }
//     });

//     return NextResponse.json({ ok: true, pedido });
//   } catch (error: any) {
//     return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
//   }
// }