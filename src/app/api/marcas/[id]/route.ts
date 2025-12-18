import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const marcaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  logo_url: String
});

const getModel = () => mongoose.models.Marca || mongoose.model('Marca', marcaSchema);

// PUT: Editar marca por ID
export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // ← CORRECCIÓN NEXT.JS 15
) {
  try {
    const { id } = await params; // ← CORRECCIÓN: Await params
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI!);
    const Marca = getModel();
    
    const body = await req.json();
    const marca = await Marca.findByIdAndUpdate(id, body, { new: true });
    
    if (!marca) {
      return NextResponse.json({ ok: false, error: 'Marca no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, marca });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

// DELETE: Borrar marca por ID
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // ← CORRECCIÓN NEXT.JS 15
) {
  try {
    const { id } = await params; // ← CORRECCIÓN: Await params
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI!);
    const Marca = getModel();
    
    const marca = await Marca.findByIdAndDelete(id);
    if (!marca) {
      return NextResponse.json({ ok: false, error: 'Marca no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, mensaje: 'Marca eliminada' });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}