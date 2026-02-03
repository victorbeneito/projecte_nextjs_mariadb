import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// --- HELPER DE SEGURIDAD ---
async function verificarPermisos(req: NextRequest, idSolicitado: number) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1]?.replace(/"/g, ''); 

  // Si no hay token, permitimos continuar para evitar bloqueos en el checkout
  if (!token) {
      return { autorizado: true, esAdmin: false }; 
  }

  try {
    const secret = process.env.JWT_SECRET || "secreto_super_seguro_tienda";
    const decoded: any = jwt.verify(token, secret);
    
    if (
        (decoded.role && decoded.role.toUpperCase() === "ADMIN") || 
        String(decoded.id) === String(idSolicitado)
    ) {
      return { autorizado: true };
    }
  } catch (e) {
      console.log("Error verificando token:", e);
  }

  return { autorizado: false, status: 403, error: "Permisos insuficientes" };
}

// --- GET (Ver cliente) ---
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const permiso = await verificarPermisos(req, id);
    // if (!permiso.autorizado) return NextResponse.json({ error: permiso.error }, { status: 403 });

    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

    const { password: _, ...clienteSinPassword } = cliente;
    return NextResponse.json({ cliente: clienteSinPassword });

  } catch (error: any) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// --- PUT (Editar cliente) ---
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const permiso = await verificarPermisos(req, id);
    if (!permiso.autorizado) return NextResponse.json({ error: permiso.error }, { status: 403 });

    const body = await req.json();

    const datosParaActualizar: any = {
        nombre: body.nombre,
        apellidos: body.apellidos,
        email: body.email,
        telefono: body.telefono,
        direccion: body.direccion,
        ciudad: body.ciudad,
        provincia: body.provincia,
        pais: body.pais,
        codigoPostal: body.cp || body.codigoPostal,
        nif: body.nif || body.dni,
        empresa: body.empresa,
        updatedAt: new Date()
    };

    if (body.password && body.password.length > 0) {
      datosParaActualizar.password = await bcrypt.hash(body.password, 10);
    }

    Object.keys(datosParaActualizar).forEach(key => 
        (datosParaActualizar[key] === undefined || datosParaActualizar[key] === null) && delete datosParaActualizar[key]
    );

    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: datosParaActualizar,
    });

    const { password: _, ...clienteFinal } = clienteActualizado;

    return NextResponse.json({
      ok: true,
      message: "Cliente actualizado correctamente",
      cliente: clienteFinal,
    });

  } catch (error: any) {
    console.error("❌ Error PUT:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// --- DELETE (Borrar cliente) ---
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const permiso = await verificarPermisos(req, id);
    if (!permiso.autorizado) return NextResponse.json({ error: permiso.error }, { status: 403 });

    console.log(`🗑️ Eliminando cliente ID: ${id}...`);

    await prisma.$transaction(async (tx:any) => {
        // 1. Buscar pedidos
        const pedidos = await tx.pedido.findMany({ 
            where: { clienteId: id },
            select: { id: true }
        });
        
        // 👇 AQUÍ ESTÁ EL ARREGLO: Añadimos (p: any)
        const pedidoIds = pedidos.map((p: any) => p.id);

        if (pedidoIds.length > 0) {
            await tx.pedidoProducto.deleteMany({
                where: { pedidoId: { in: pedidoIds } }
            });

            await tx.pedido.deleteMany({
                where: { id: { in: pedidoIds } }
            });
        }

        await tx.cupon.deleteMany({
            where: { clienteId: id }
        });

        await tx.cliente.delete({
            where: { id }
        });
    });

    return NextResponse.json({ ok: true, message: "Cliente eliminado correctamente" });

  } catch (error: any) {
    console.error("❌ Error DELETE Cliente:", error);
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}