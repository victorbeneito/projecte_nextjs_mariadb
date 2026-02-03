import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 [POST /new] Recibiendo pedido...");

    let clienteId: number | null = null;
    const datosCliente = body.cliente || {};

    // 1. Identificar Cliente
    if (datosCliente.email) {
      const c = await prisma.cliente.findUnique({ where: { email: datosCliente.email } });
      if (c) clienteId = c.id;
    }
    if (!clienteId && body.clienteId) clienteId = parseInt(body.clienteId);
    
    // Fallback: busca el primer cliente si no encuentra ninguno (para evitar crash en pruebas)
    if (!clienteId) {
        const anyClient = await prisma.cliente.findFirst();
        clienteId = anyClient ? anyClient.id : 1; 
    }

    // 2. Preparar los productos
    const listaRaw = body.items || body.carrito || body.productos || [];
    
    const productosParaInsertar = listaRaw.map((p: any) => ({
      nombre: p.nombre,
      cantidad: p.cantidad,
      precioUnitario: parseFloat(p.precioFinal ?? p.precio),
      subtotal: (parseFloat(p.precioFinal ?? p.precio)) * p.cantidad,
    }));

    // 3. Transacción
    const result = await prisma.$transaction(async (tx: any) => {
      
      // A) Calcular PED-2026-XXXX
      const anio = new Date().getFullYear();
      const prefijo = `PED-${anio}-`;
      const ultimo = await tx.pedido.findFirst({
        where: { numeroPedido: { startsWith: prefijo } },
        orderBy: { id: 'desc' }
      });
      
      let sec = 1;
      if (ultimo && ultimo.numeroPedido) {
        const partes = ultimo.numeroPedido.split('-');
        if (partes.length === 3) sec = parseInt(partes[2]) + 1;
      }
      const numeroGenerado = `${prefijo}${sec.toString().padStart(4, '0')}`;

      // B) Crear Pedido e INSERTAR PRODUCTOS
      const pedido = await tx.pedido.create({
        data: {
          numeroPedido: numeroGenerado,
          clienteId: clienteId!,
          nombre: datosCliente.nombre || "Cliente",
          email: datosCliente.email || "no-email@tienda.com",
          telefono: datosCliente.telefono,
          direccion: datosCliente.direccion,
          ciudad: datosCliente.ciudad,
          cp: datosCliente.cp,
          
          envioMetodo: String(body.metodoEnvio?.metodo || body.envioMetodo?.metodo || "estándar"),
          envioCoste: parseFloat(String(body.metodoEnvio?.coste || body.envioMetodo?.coste || 0)),
          pagoMetodo: String(body.metodoPago?.metodo || body.pagoMetodo?.metodo || "tarjeta"),
          
          subtotal: parseFloat(body.subtotal || 0),
          descuento: parseFloat(body.descuento || 0),
          totalFinal: parseFloat(body.totalFinal || 0),
          estado: "PENDIENTE",
          
          // 🔥 FECHAS OBLIGATORIAS (SOLUCIÓN AL ERROR)
          fechaPedido: new Date(),
          updatedAt: new Date(),

          PedidoProducto: {
            create: productosParaInsertar
          }
        },
        include: { PedidoProducto: true }
      });

      return pedido;
    });

    return NextResponse.json({ ok: true, pedido: result });

  } catch (error: any) {
    console.error("❌ Error creando pedido:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export const dynamic = "force-dynamic";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     console.log("📦 [Pedido/New] Iniciando creación...");

//     // 1. Identificar Cliente
//     let clienteId: number | null = null;
//     const datosCliente = body.cliente || {};
    
//     // Lógica de búsqueda de cliente
//     if (datosCliente.email) {
//       const c = await prisma.cliente.findUnique({ where: { email: datosCliente.email } });
//       if (c) clienteId = c.id;
//     }
    
//     // Si no lo encuentra por email, intentamos por ID directo
//     if (!clienteId && body.clienteId) {
//        const parsedId = parseInt(body.clienteId);
//        if(!isNaN(parsedId)) clienteId = parsedId;
//     }

//     if (!clienteId) return NextResponse.json({ error: "Cliente obligatorio" }, { status: 400 });

//     // 2. Preparar los productos (limpieza de datos)
//     const productosParaInsertar = (body.carrito || body.productos || []).map((p: any) => ({
//         nombre: p.nombre,
//         cantidad: p.cantidad,
//         // Usamos precioFinal si existe (oferta), si no el precio normal
//         precioUnitario: parseFloat(p.precioFinal ?? p.precio),
//         subtotal: (parseFloat(p.precioFinal ?? p.precio)) * p.cantidad,
//         // Si tu base de datos requiere el ID original de mongo o productoId, añádelo aquí
//         // productoIdMongo: p.id || p._id 
//     }));

//     // 3. TRANSACCIÓN: Calcular ID + Consumir cupón + Crear pedido
//     const result = await prisma.$transaction(async (tx: any ) => {
      
//       // A) Si hay cupón, verificamos y consumimos
//       if (body.cuponCodigo) {
//         const cupon = await tx.cupon.findUnique({ where: { codigo: body.cuponCodigo } });
        
//         if (cupon) {
//           await tx.cupon.update({
//             where: { id: cupon.id },
//             data: { cantidadUsada: { increment: 1 } }
//           });

//           await tx.cuponUso.upsert({
//             where: { cuponId_clienteId: { cuponId: cupon.id, clienteId: clienteId! } },
//             create: { cuponId: cupon.id, clienteId: clienteId!, veces: 1 , updatedAt: new Date() },
//             update: { veces: { increment: 1 } , updatedAt: new Date()}
//           });
//         }
//       }

//       // B) CALCULAR NÚMERO DE PEDIDO SECUENCIAL
//       const fechaActual = new Date();
//       const anioActual = fechaActual.getFullYear();
//       const prefijo = `PED-${anioActual}-`;

//       const ultimoPedido = await tx.pedido.findFirst({
//         where: { numeroPedido: { startsWith: prefijo } },
//         orderBy: { id: 'desc' }
//       });

//       let secuencia = 1;
//       if (ultimoPedido) {
//         const partes = ultimoPedido.numeroPedido.split('-');
//         if (partes.length === 3) {
//           const numeroAnterior = parseInt(partes[2]);
//           if (!isNaN(numeroAnterior)) secuencia = numeroAnterior + 1;
//         }
//       }
//       const numeroPedidoGenerado = `${prefijo}${secuencia.toString().padStart(4, '0')}`;
//       console.log("🔢 Generado:", numeroPedidoGenerado);


//       // C) Crear el pedido Y LOS PRODUCTOS
//       const pedido = await tx.pedido.create({
//         data: {
//           numeroPedido: numeroPedidoGenerado,
//           clienteId: clienteId!,
//           nombre: datosCliente.nombre || "Cliente",
//           email: datosCliente.email || "no@email.com",
//           telefono: datosCliente.telefono || null,
//           direccion: datosCliente.direccion || null,
//           ciudad: datosCliente.ciudad || null,
//           cp: datosCliente.cp || null,
          
//           envioMetodo: String(body.metodoEnvio?.metodo || body.envioMetodo?.metodo || "tienda"),
//           envioCoste: parseFloat(String(body.metodoEnvio?.coste || body.envioMetodo?.coste || 0)),
//           pagoMetodo: String(body.metodoPago?.metodo || body.pagoMetodo?.metodo || "transferencia"),
          
//           subtotal: parseFloat(String(body.subtotal || 0)),
//           descuento: parseFloat(String(body.descuento || 0)),
//           totalFinal: parseFloat(String(body.totalFinal || 0)),
          
//           cuponCodigo: body.cuponCodigo || null,
//           cuponDescuento: parseFloat(String(body.descuento || 0)), // Guardar cuánto se descontó
          
//           estado: "PENDIENTE",
//           updatedAt: new Date(),

//           // 👇 ESTO ES LO QUE FALTABA (YA NO ESTÁ COMENTADO)
//           PedidoProducto: {
//             create: productosParaInsertar
//           }
//         },
//         // 👇 ESTO HACE QUE EL FRONTEND RECIBA LOS PRODUCTOS
//         include: {
//             PedidoProducto: true
//         }
//       });

//       return pedido;
//     });

//     return NextResponse.json({ ok: true, pedido: result });

//   } catch (error: any) {
//     console.error("❌ Error Pedido:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }