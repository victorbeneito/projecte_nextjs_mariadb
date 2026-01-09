import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 [MariaDB] Creando pedido (ruta /new).");

    let clienteId: number | null = null;
    const datosCliente = body.cliente || {};

    if (datosCliente.email) {
      const c = await prisma.cliente.findUnique({ where: { email: datosCliente.email } });
      if (c) clienteId = c.id;
    }
    if (!clienteId && body.clienteId) {
      const parsed = parseInt(body.clienteId);
      if (!isNaN(parsed)) clienteId = parsed;
    }

    if (!clienteId) {
      return NextResponse.json({ ok: false, error: "Cliente no identificado" }, { status: 400 });
    }

    // --- CORRECCIÓN OBJETO vs STRING ---
    let envioNombre = "Estándar";
    let envioCoste = 0;
    if (body.envioMetodo && typeof body.envioMetodo === 'object') {
        envioNombre = body.envioMetodo.metodo || "Estándar";
        envioCoste = parseFloat(body.envioMetodo.coste || 0);
    } else {
        envioNombre = String(body.envioMetodo || "Estándar");
        envioCoste = parseFloat(body.envioCoste || 0);
    }
    
    let pagoNombre = "Tarjeta";
    if (body.pagoMetodo && typeof body.pagoMetodo === 'object') {
        pagoNombre = body.pagoMetodo.metodo || "Tarjeta";
    } else {
        pagoNombre = String(body.pagoMetodo || "Tarjeta");
    }
    // -----------------------------------

    const productosData = (body.carrito || body.productos || []).map((p: any) => ({
      nombre: p.nombre,
      cantidad: p.cantidad,
      precioUnitario: parseFloat(p.precioFinal ?? p.precio),
      subtotal: (p.precioFinal ?? p.precio) * p.cantidad,
    }));

    const nuevoPedido = await prisma.pedido.create({
      data: {
        numeroPedido: `PED-${Date.now()}`,
        clienteId: clienteId,
        nombre: datosCliente.nombre || "Cliente",
        email: datosCliente.email,
        telefono: datosCliente.telefono,
        direccion: datosCliente.direccion,
        ciudad: datosCliente.ciudad,
        cp: datosCliente.cp || datosCliente.codigoPostal,
        
        envioMetodo: envioNombre,
        envioCoste: envioCoste,
        
        pagoMetodo: pagoNombre,
        
        subtotal: parseFloat(body.subtotal || 0),
        descuento: parseFloat(body.descuento || 0),
        totalFinal: parseFloat(body.totalFinal),
        estado: body.estado || "PENDIENTE",
        productos: {
          create: productosData
        }
      }
    });

    return NextResponse.json({
      ok: true,
      message: "Pedido creado correctamente ✅",
      pedido: nuevoPedido,
    });

  } catch (error: any) {
    console.error("❌ Error /api/pedidos/new:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}