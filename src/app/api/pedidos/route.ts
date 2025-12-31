import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Pedido from "@/models/Pedido";
import Cliente from "@/models/Cliente";

/* *************************************
   🧰 CREAR PEDIDO (POST)
************************************* */
export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log("📦 Datos recibidos del frontend:", body); // ✨ Confirmar lo que llega

    // Buscar cliente
    let clienteId = null;
    let clienteData = body?.cliente || {};
    if (clienteData?.email) {
      const existing = await Cliente.findOne({ email: clienteData.email });
      if (existing) clienteId = existing._id;
    }

    // Validar totalFinal
    if (typeof body.totalFinal !== "number" || isNaN(body.totalFinal)) {
      return NextResponse.json(
        { ok: false, error: "El campo totalFinal es obligatorio y debe ser numérico." },
        { status: 400 }
      );
    }

    // Crear pedido con las claves que envía tu front (/checkout/resumen)
    const nuevoPedido = new Pedido({
      clienteId,
      cliente: clienteData,
      envio: body.metodoEnvio || body.envio,
      pago: body.metodoPago || body.pago,
      productos: body.carrito || body.productos || [],
      cupon: {
        codigo: body.cuponCodigo || null,
        descuento: body.descuento || 0,
      },
      subtotal: body.subtotal || 0,
      descuento: body.descuento || 0,
      totalFinal: body.totalFinal, // 👈 obligatorio
      estado: body.estado || "pendiente",
      fechaPedido: new Date(),
    });

    await nuevoPedido.save();

    return NextResponse.json({
      ok: true,
      message: "✅ Pedido creado correctamente",
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

/* *************************************
   🧾 LISTAR PEDIDOS (GET)
************************************* */
export async function GET() {
  try {
    await dbConnect();
    const pedidos = await Pedido.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ pedidos });
  } catch (error: any) {
    console.error("❌ Error al obtener pedidos:", error);
    return NextResponse.json(
      { ok: false, error: "Error al obtener pedidos", detalle: error.message },
      { status: 500 }
    );
  }
}
