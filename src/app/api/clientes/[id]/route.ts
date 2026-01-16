import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// --- HELPER DE SEGURIDAD ---
async function verificarPermisos(req: NextRequest, idSolicitado: number) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1]?.replace(/"/g, ''); 

  if (!token) return { autorizado: false, status: 401, error: "Token requerido" };

  // 1. INTENTO ADMIN
  try {
    const secretAdmin = process.env.SECRETO_JWT_ADMIN || "palabra_secreta_emergencia_2026";
    const adminDecoded: any = jwt.verify(token, secretAdmin);
    if (adminDecoded && (adminDecoded.rol?.toUpperCase() === "ADMIN" || adminDecoded.role?.toUpperCase() === "ADMIN")) {
        return { autorizado: true, esAdmin: true };
    }
  } catch (e) {}

  // 2. INTENTO CLIENTE (Solo puede tocarse a sí mismo)
  try {
    const secretCliente = process.env.SECRETO_JWT_CLIENTE || "clave_secreta_cliente_2026";
    const clienteDecoded: any = jwt.verify(token, secretCliente);
    
    if (String(clienteDecoded.id) === String(idSolicitado)) {
      return { autorizado: true, esAdmin: false };
    }
  } catch (e) {}

  return { autorizado: false, status: 403, error: "No tienes permisos" };
}

// --- GET (Ver cliente) ---
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const permiso = await verificarPermisos(req, id);
    if (!permiso.autorizado) return NextResponse.json({ error: permiso.error }, { status: permiso.status || 403 });

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
    if (!permiso.autorizado) return NextResponse.json({ error: permiso.error }, { status: permiso.status || 403 });

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
        nif: body.nif || body.dni, // ✅ Incluido arreglo DNI
        empresa: body.empresa
    };

    Object.keys(datosParaActualizar).forEach(key => 
        (datosParaActualizar[key] === undefined || datosParaActualizar[key] === null) && delete datosParaActualizar[key]
    );

    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: datosParaActualizar,
    });

    const { password: _, ...clienteFinal } = clienteActualizado;

    return NextResponse.json({
      message: "Cliente actualizado correctamente",
      cliente: clienteFinal,
    });

  } catch (error: any) {
    console.error("❌ Error PUT:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// --- DELETE (Borrar cliente y sus datos) ---
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const permiso = await verificarPermisos(req, id);
    if (!permiso.autorizado) return NextResponse.json({ error: permiso.error }, { status: 403 });

    console.log(`🗑️ Eliminando cliente ID: ${id} y sus datos asociados...`);

    // 🔥 BORRADO EN CASCADA (Transacción para que sea seguro)
    await prisma.$transaction(async (tx) => {
        // 1. Buscar pedidos del cliente
        const pedidos = await tx.pedido.findMany({ 
            where: { clienteId: id },
            select: { id: true }
        });
        const pedidoIds = pedidos.map(p => p.id);

        if (pedidoIds.length > 0) {
            // 2. Borrar productos dentro de esos pedidos
            await tx.pedidoProducto.deleteMany({
                where: { pedidoId: { in: pedidoIds } }
            });

            // 3. Borrar los pedidos
            await tx.pedido.deleteMany({
                where: { id: { in: pedidoIds } }
            });
        }

        // 4. Borrar cupones asociados (si tiene)
        await tx.cupon.deleteMany({
            where: { clienteId: id }
        });

        // 5. Finalmente, borrar al cliente
        await tx.cliente.delete({
            where: { id }
        });
    });

    return NextResponse.json({ message: "Cliente eliminado correctamente" });

  } catch (error: any) {
    console.error("❌ Error DELETE Cliente:", error);
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}