import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Pedido from "@/models/Pedido";
import Cliente from "@/models/Cliente";

/* *********************************************
   ✅  CREAR PEDIDO (POST)  /api/pedidos/new
********************************************* */
export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log("📦 Datos recibidos:", body); // ← verás esto en la consola del servidor

   // Si tu contexto añade el token, podrías decodificar JWT para obtener id y email.
// Pero como ya los tienes en useClienteAuth, envíalos desde el front (ahora lo haremos abajo).

// 🔹 Leer cliente autenticado que viene del contexto
const clienteData = body.cliente || {}; // Si el front lo enviara en el body, lo usamos.

const clienteAInsertar = {
  nombre: clienteData.nombre ?? "Cliente",
  email: clienteData.email ?? "sinemail@local",
  telefono: clienteData.telefono || "",
  direccion: clienteData.direccion || "",
  ciudad: clienteData.ciudad || "",
  cp: clienteData.cp || clienteData.codigoPostal || "",
};

// Si tu contexto añade el token, podrías decodificar JWT para obtener id y email.
// Pero como ya los tienes en useClienteAuth, envíalos desde el front (ahora lo haremos abajo).

const clienteId =
  clienteData._id ||
  body.clienteId ||
  null; // enviamos desde front el id del cliente

const productosNormalizados = (body.carrito || []).map((p: any) => ({
  productoId: p._id,
  nombre: p.nombre,
  cantidad: p.cantidad,
  precioUnitario: p.precioFinal ?? p.precio,
  subtotal: (p.precioFinal ?? p.precio) * p.cantidad,
}));

const nuevoPedido = new Pedido({
  clienteId,
  cliente: clienteAInsertar,
  envio: body.metodoEnvio || body.envio,
  pago: body.metodoPago || body.pago,
  productos: productosNormalizados,
  cupon: {
    codigo: body.cuponCodigo || null,
    descuento: body.descuento || 0,
  },
  subtotal: body.subtotal || 0,
  descuento: body.descuento || 0,
  totalFinal: body.totalFinal,
  estado: body.estado || "pendiente",
  fechaPedido: new Date(),
});


    await nuevoPedido.save();

    console.log("✅ Pedido guardado:", nuevoPedido._id);
    return NextResponse.json({
      ok: true,
      message: "Pedido creado correctamente ✅",
      pedido: nuevoPedido,
    });
  } catch (error: any) {
    console.error("❌ Error al crear pedido:", error);
    return NextResponse.json(
      {
        error: "Error al crear pedido",
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}
