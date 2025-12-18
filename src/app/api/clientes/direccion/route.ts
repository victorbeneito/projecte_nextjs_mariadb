// src/app/api/clientes/direccion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const clienteSchema = new mongoose.Schema({
  nombre: String,
  apellidos: String,
  email: String,
  password: String,
  telefono: String,
  empresa: String,
  direccion: String,
  direccionComplementaria: String,
  codigoPostal: String,
  ciudad: String,
  pais: { type: String, default: 'España' },
  provincia: String,
  nif: String,
  role: { type: String, default: 'cliente' }
}, { timestamps: true });

const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', clienteSchema);

function getTokenFromHeader(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.replace('Bearer ', '');
}

export async function GET(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.SECRETO_JWT!) as any;

    const cliente = await Cliente.findById(decoded.id).select(
      'nombre apellidos email telefono empresa direccion direccionComplementaria codigoPostal ciudad pais provincia nif'
    );
    if (!cliente) {
      return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, direccion: cliente });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.SECRETO_JWT!) as any;
    const body = await req.json();

    const update = {
      empresa: body.empresa || '',
      direccion: body.direccion,
      direccionComplementaria: body.direccionComplementaria || '',
      codigoPostal: body.codigoPostal,
      ciudad: body.ciudad,
      pais: body.pais || 'España',
      provincia: body.provincia,
      telefono: body.telefono,
      nif: body.nif,
    };

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      decoded.id,
      update,
      { new: true }
    ).select(
      'nombre apellidos email telefono empresa direccion direccionComplementaria codigoPostal ciudad pais provincia nif'
    );

    if (!clienteActualizado) {
      return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, direccion: clienteActualizado });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
