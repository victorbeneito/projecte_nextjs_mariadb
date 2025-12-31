// src/app/api/categorias/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema({ nombre: String });

const MONGODB_URI = process.env.MONGODB_URI!;

let isConnected = false; // <- cache local

async function dbConnect() {
  if (isConnected) return;
  const db = await mongoose.connect(MONGODB_URI);
  isConnected = !!db.connections[0].readyState;
}

export async function GET() {
  try {
    await dbConnect(); // 👈 Reutiliza conexión
    const Categoria =
      mongoose.models.Categoria || mongoose.model("Categoria", categoriaSchema);
    const categorias = await Categoria.find({}).sort({ nombre: 1 });
    return NextResponse.json({ ok: true, categorias });
  } catch (error: any) {
    console.error("❌ Error al obtener categorías:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
