// src/app/api/clientes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // npm install bcryptjs @types/bcryptjs

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: String,
  role: { type: String, default: 'cliente' }
}, { timestamps: true });

// Hash password antes de guardar
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', clienteSchema);

// Middleware para verificar JWT
async function verificarToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 401 });
  }
  
  const token = auth.replace('Bearer ', '');
  try {
    jwt.verify(token, process.env.SECRETO_JWT!);
    return null; // Token válido
  } catch {
    return NextResponse.json({ ok: false, error: 'Token inválido' }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Verificar token
    const tokenError = await verificarToken(req);
    if (tokenError) return tokenError;
    
    const clientes = await Cliente.find({}).select('-password'); // Ocultar password
    return NextResponse.json({ ok: true, clientes });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// POST - Crear cliente básico (sin auth)
export async function POST(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const data = await req.json();
    
    // Si tiene password, hashearlo manualmente
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    
    const cliente = new Cliente(data);
    await cliente.save();
    
    const token = jwt.sign(
      { id: cliente._id, email: cliente.email, role: cliente.role || 'cliente' },
      process.env.SECRETO_JWT!,
      { expiresIn: '24h' }
    );
    
    return NextResponse.json({ 
      ok: true, 
      cliente: { 
        id: cliente._id, 
        nombre: cliente.nombre, 
        apellidos: cliente.apellidos || '',
        email: cliente.email,
        telefono: cliente.telefono 
      },
      token 
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ ok: false, error: 'Email ya registrado' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// PUT - Registro completo con doble contraseña
export async function PUT(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { nombre, apellidos, email, password, password2, telefono } = await req.json();
    
    if (password !== password2) {
      return NextResponse.json({ ok: false, error: 'Las contraseñas no coinciden' }, { status: 400 });
    }
    
    const clienteExistente = await Cliente.findOne({ email });
    if (clienteExistente) {
      return NextResponse.json({ ok: false, error: 'Email ya registrado' }, { status: 400 });
    }
    
    const hashedPassword = await hashPassword(password);
    const cliente = new Cliente({ nombre, apellidos, email, password: hashedPassword, telefono });
    await cliente.save();
    
    const token = jwt.sign(
      { id: cliente._id, email: cliente.email, role: 'cliente' },
      process.env.SECRETO_JWT!,
      { expiresIn: '24h' }
    );
    
    return NextResponse.json({ 
      ok: true, 
      cliente: { id: cliente._id, nombre, apellidos, email, telefono },
      token 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// PATCH - Login (sin cambios, ya funciona)
export async function PATCH(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { email, password } = await req.json();
    
    const cliente = await Cliente.findOne({ email });
    if (!cliente || !(await bcrypt.compare(password, cliente.password))) {
      return NextResponse.json({ ok: false, error: 'Credenciales inválidas' }, { status: 400 });
    }
    
    const token = jwt.sign(
      { id: cliente._id, email: cliente.email, role: cliente.role },
      process.env.SECRETO_JWT!,
      { expiresIn: '24h' }
    );
    
    return NextResponse.json({ 
      ok: true, 
      cliente: { 
        id: cliente._id, 
        nombre: cliente.nombre, 
        apellidos: cliente.apellidos, 
        email: cliente.email,
        telefono: cliente.telefono 
      },
      token 
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}