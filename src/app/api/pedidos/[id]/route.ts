import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Pedido from "@/models/Pedido";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 params es una Promise
) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    // ✅ Desempaquetamos la promesa
    const { id } = await context.params;

    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return NextResponse.json(
        { ok: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, pedido });
  } catch (error: any) {
    console.error("❌ Error GET pedido:", error.message);
    return NextResponse.json(
      { ok: false, error: "Error de servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 también aquí
) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { id } = await context.params;
    const data = await req.json();

    const pedido = await Pedido.findByIdAndUpdate(id, data, { new: true });

    if (!pedido) {
      return NextResponse.json(
        { ok: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, pedido });
  } catch (error: any) {
    console.error("❌ Error PUT pedido:", error.message);
    return NextResponse.json(
      { ok: false, error: "Error de servidor" },
      { status: 500 }
    );
  }
}

