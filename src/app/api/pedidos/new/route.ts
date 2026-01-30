import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 [Pedido] Iniciando creación...");

    // 1. Identificar Cliente
    let clienteId: number | null = null;
    const datosCliente = body.cliente || {};
    
    // Lógica de búsqueda de cliente (igual que tenías)
    if (datosCliente.email) {
      const c = await prisma.cliente.findUnique({ where: { email: datosCliente.email } });
      if (c) clienteId = c.id;
    }
    if (!clienteId && body.clienteId) clienteId = parseInt(body.clienteId);

    if (!clienteId) return NextResponse.json({ error: "Cliente obligatorio" }, { status: 400 });

    // 2. Preparar datos del pedido
    const productosData = (body.carrito || body.productos || []).map((p: any) => ({
      nombre: p.nombre,
      cantidad: p.cantidad,
      precioUnitario: parseFloat(p.precioFinal ?? p.precio),
      subtotal: (p.precioFinal ?? p.precio) * p.cantidad,
    }));

    // 3. TRANSACCIÓN: Crear pedido + Consumir cupón (si existe)
    const result = await prisma.$transaction(async (tx: any ) => {
      
      // A) Si hay cupón, verificamos y consumimos
      if (body.cuponCodigo) {
        const cupon = await tx.cupon.findUnique({ where: { codigo: body.cuponCodigo } });
        
        if (cupon) {
          // Incrementamos uso global
          await tx.cupon.update({
            where: { id: cupon.id },
            data: { cantidadUsada: { increment: 1 } }
          });

          // Incrementamos uso del cliente (upsert: crea si no existe, actualiza si existe)
          await tx.cuponUso.upsert({
            where: { cuponId_clienteId: { cuponId: cupon.id || null, clienteId: clienteId! } },
            create: { cuponId: cupon.id || null, clienteId: clienteId!, veces: 1 , updatedAt: new Date() },
            update: { veces: { increment: 1 } , updatedAt: new Date()}
          });
        }
      }

      // B) Crear el pedido
      const pedido = await tx.pedido.create({
 data: {
  numeroPedido: `PED-${Date.now()}`,
  clienteId: clienteId!,
  nombre: datosCliente.nombre || "Cliente",
  email: datosCliente.email || "no@email.com",
  telefono: datosCliente.telefono || null,
  direccion: datosCliente.direccion || null,
  ciudad: datosCliente.ciudad || null,
  cp: datosCliente.cp || null,
  envioMetodo: String(body.metodoEnvio?.metodo || "tienda"),
  envioCoste: parseFloat(String(body.metodoEnvio?.coste || 0)),
  pagoMetodo: String(body.metodoPago?.metodo || "transferencia"),
  subtotal: parseFloat(String(body.subtotal || 0)),
  descuento: parseFloat(String(body.descuento || 0)),
  totalFinal: parseFloat(String(body.totalFinal || 0)),
  cuponCodigo: body.cuponCodigo || null,
  estado: "PENDIENTE",
  updatedAt: new Date()
 
}


});

      return pedido;
    });

    return NextResponse.json({ ok: true, pedido: result });

  } catch (error: any) {
    console.error("❌ Error Pedido:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     console.log("📦 [MariaDB] Creando pedido (ruta /new).");

//     let clienteId: number | null = null;
//     const datosCliente = body.cliente || {};

//     if (datosCliente.email) {
//       const c = await prisma.cliente.findUnique({ where: { email: datosCliente.email } });
//       if (c) clienteId = c.id;
//     }
//     if (!clienteId && body.clienteId) {
//       const parsed = parseInt(body.clienteId);
//       if (!isNaN(parsed)) clienteId = parsed;
//     }

//     if (!clienteId) {
//       return NextResponse.json({ ok: false, error: "Cliente no identificado" }, { status: 400 });
//     }

//     // --- CORRECCIÓN OBJETO vs STRING ---
//     let envioNombre = "Estándar";
//     let envioCoste = 0;
//     if (body.envioMetodo && typeof body.envioMetodo === 'object') {
//         envioNombre = body.envioMetodo.metodo || "Estándar";
//         envioCoste = parseFloat(body.envioMetodo.coste || 0);
//     } else {
//         envioNombre = String(body.envioMetodo || "Estándar");
//         envioCoste = parseFloat(body.envioCoste || 0);
//     }
    
//     let pagoNombre = "Tarjeta";
//     if (body.pagoMetodo && typeof body.pagoMetodo === 'object') {
//         pagoNombre = body.pagoMetodo.metodo || "Tarjeta";
//     } else {
//         pagoNombre = String(body.pagoMetodo || "Tarjeta");
//     }
//     // -----------------------------------

//     const productosData = (body.carrito || body.productos || []).map((p: any) => ({
//       nombre: p.nombre,
//       cantidad: p.cantidad,
//       precioUnitario: parseFloat(p.precioFinal ?? p.precio),
//       subtotal: (p.precioFinal ?? p.precio) * p.cantidad,
//     }));

//     const nuevoPedido = await prisma.pedido.create({
//       data: {
//         numeroPedido: `PED-${Date.now()}`,
//         clienteId: clienteId,
//         nombre: datosCliente.nombre || "Cliente",
//         email: datosCliente.email,
//         telefono: datosCliente.telefono,
//         direccion: datosCliente.direccion,
//         ciudad: datosCliente.ciudad,
//         cp: datosCliente.cp || datosCliente.codigoPostal,
        
//         envioMetodo: envioNombre,
//         envioCoste: envioCoste,
        
//         pagoMetodo: pagoNombre,
        
//         subtotal: parseFloat(body.subtotal || 0),
//         descuento: parseFloat(body.descuento || 0),
//         totalFinal: parseFloat(body.totalFinal),
//         estado: body.estado || "PENDIENTE",
//         productos: {
//           create: productosData
//         }
//       }
//     });

//     return NextResponse.json({
//       ok: true,
//       message: "Pedido creado correctamente ✅",
//       pedido: nuevoPedido,
//     });

//   } catch (error: any) {
//     console.error("❌ Error /api/pedidos/new:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }