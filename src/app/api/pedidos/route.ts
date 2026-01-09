import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ----------------------------------------------------------------------
// POST: Crear un nuevo Pedido
// ----------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 [MariaDB] Creando pedido. Datos recibidos...");

    // 1. Validar e identificar al Cliente
    let clienteId: number | null = null;
    const datosCliente = body.cliente || {};

    // Estrategia A: Buscar por email
    if (datosCliente.email) {
      const clienteExiste = await prisma.cliente.findUnique({
        where: { email: datosCliente.email },
      });
      if (clienteExiste) clienteId = clienteExiste.id;
    }

    // Estrategia B: Buscar por ID explícito
    if (!clienteId && body.clienteId) {
      const idParsed = parseInt(body.clienteId);
      if (!isNaN(idParsed)) clienteId = idParsed;
    }

    if (!clienteId) {
      // Si permites compra como invitado, puedes quitar este return y dejar clienteId en null
      // return NextResponse.json(
      //   { ok: false, error: "No se pudo identificar al cliente. Por favor, inicia sesión." },
      //   { status: 400 }
      // );
      // Opción B: Asignar a un "Cliente Invitado" genérico si tienes uno creado (ej: ID 1)
      clienteId = 1; 
    }

    // 2. CORRECCIÓN DE OBJETOS A STRING (Envío y Pago)
    let envioNombre = "Estándar";
    let envioCoste = 0;

    if (body.envioMetodo && typeof body.envioMetodo === 'object') {
        envioNombre = body.envioMetodo.metodo || "Estándar";
        envioCoste = parseFloat(body.envioMetodo.coste || 0);
    } else {
        envioNombre = String(body.envioMetodo || body.envio?.metodo || "Estándar");
        envioCoste = parseFloat(body.envioCoste || body.envio?.coste || 0);
    }

    let pagoNombre = "Tarjeta";
    if (body.pagoMetodo && typeof body.pagoMetodo === 'object') {
        pagoNombre = body.pagoMetodo.metodo || "Tarjeta";
    } else {
        pagoNombre = String(body.pagoMetodo || body.pago?.metodo || "Tarjeta");
    }

    // 3. Preparar productos
    const productosParaInsertar = (body.carrito || body.productos || []).map((p: any) => ({
      nombre: p.nombre,
      cantidad: p.cantidad,
      precioUnitario: parseFloat(p.precioFinal ?? p.precio),
      subtotal: (p.precioFinal ?? p.precio) * p.cantidad,
    }));

    // 4. Crear el Pedido
    const nuevoPedido = await prisma.pedido.create({
      data: {
        numeroPedido: `PED-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        clienteId: clienteId,
        
        // Datos de cliente snapshot
        nombre: datosCliente.nombre || "Cliente",
        email: datosCliente.email,
        telefono: datosCliente.telefono,
        direccion: datosCliente.direccion,
        ciudad: datosCliente.ciudad,
        cp: datosCliente.cp || datosCliente.codigoPostal,

        // Datos limpios
        envioMetodo: envioNombre,
        envioCoste: envioCoste,
        pagoMetodo: pagoNombre,
        
        // Totales
        subtotal: parseFloat(body.subtotal || 0),
        descuento: parseFloat(body.descuento || body.cuponDescuento || 0),
        totalFinal: parseFloat(body.totalFinal || 0), // Aseguramos que no sea NaN
        
        estado: body.estado || "PENDIENTE", // Forzamos mayúsculas si es necesario
        
        cuponCodigo: body.cuponCodigo || body.cupon?.codigo || null,
        cuponDescuento: parseFloat(body.descuento || body.cupon?.descuento || 0),

        productos: {
          create: productosParaInsertar
        }
      },
      include: {
        productos: true,
      }
    });

    console.log("✅ Pedido creado ID:", nuevoPedido.id);

    return NextResponse.json({
      ok: true,
      message: "Pedido creado correctamente ✅",
      pedido: nuevoPedido,
    });

  } catch (error: any) {
    console.error("❌ Error al crear pedido:", error);
    return NextResponse.json(
      { ok: false, error: "Error al crear pedido", detalle: error.message },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// GET: Listar Pedidos
// ----------------------------------------------------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clienteIdParam = searchParams.get("clienteId");

    const whereClause: any = {};
    
    if (clienteIdParam) {
      const parsedId = parseInt(clienteIdParam);
      if (!isNaN(parsedId)) {
        whereClause.clienteId = parsedId;
      }
    }

    const pedidos = await prisma.pedido.findMany({
      where: whereClause,
      include: {
        // 👇 ESTO ES LO QUE FALTABA: Traer datos del cliente real
        cliente: {
          select: {
            nombre: true,
            email: true
          }
        },
        productos: true,
      },
      orderBy: {
        // Si tienes createdAt usa ese, si no, usa id
        id: 'desc', 
      },
    });

    return NextResponse.json({ ok: true, pedidos });

  } catch (error: any) {
    console.error("❌ Error al listar pedidos:", error);
    return NextResponse.json(
      { ok: false, error: "Error al obtener pedidos", detalle: error.message },
      { status: 500 }
    );
  }
}