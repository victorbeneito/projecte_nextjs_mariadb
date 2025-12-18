import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Definición del esquema (según tu código original)
const marcaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  logo_url: String
});

// Helper para obtener el modelo y evitar errores de recompilación
const getModel = () => mongoose.models.Marca || mongoose.model('Marca', marcaSchema);

// GET: Listar todas las marcas
export async function GET() {
  try {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI!);
    const Marca = getModel();
    
    const marcas = await Marca.find({}).sort({ nombre: 1 });
    return NextResponse.json({ ok: true, marcas });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// POST: Crear una nueva marca
export async function POST(req: NextRequest) {
  try {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI!);
    const Marca = getModel();
    
    const body = await req.json();
    const marca = new Marca(body);
    await marca.save();
    
    return NextResponse.json({ ok: true, marca }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}