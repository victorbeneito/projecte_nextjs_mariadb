import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Cliente from "@/models/Cliente"; // ✅ usa tu modelo de clientes, no el de usuarios genéricos

export async function POST(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const { email, password } = await req.json();

    // 🔍 Buscar cliente por email (en minúsculas)
    const cliente = await Cliente.findOne({ email: email.toLowerCase() });
    if (!cliente) {
      return NextResponse.json(
        { ok: false, error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    // 🔐 Verificar contraseña
    const esValido = await bcrypt.compare(password, cliente.password);
    if (!esValido) {
      return NextResponse.json(
        { ok: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // 🪪 Crear token JWT
    const token = jwt.sign(
      { id: cliente._id, email: cliente.email },
      process.env.SECRETO_JWT!,
      { expiresIn: "24h" }
    );

    // 🧹 Quitar la contraseña del objeto cliente
    const clienteSinPassword = cliente.toObject();
    delete clienteSinPassword.password;

    // 📨 Devolver token + datos completos del cliente
    return NextResponse.json({
      ok: true,
      token,
      cliente: clienteSinPassword,
    });
  } catch (error: any) {
    console.error("❌ Error en login:", error.message);
    return NextResponse.json(
      { ok: false, error: "Error de servidor" },
      { status: 500 }
    );
  }
}


// import { NextRequest, NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const usuarioSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// });

// export async function POST(req: NextRequest) {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI!);
//     const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);
    
//     const { email, password } = await req.json();
    
//     // Buscar usuario
//     const usuario = await Usuario.findOne({ email: email.toLowerCase() });
//     if (!usuario) {
//       return NextResponse.json({ ok: false, error: 'Usuario no encontrado' }, { status: 401 });
//     }
    
//     // Verificar contraseña
//     const esValido = await bcrypt.compare(password, usuario.password);
//     if (!esValido) {
//       return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' }, { status: 401 });
//     }
    
//     // Crear JWT
//     const token = jwt.sign(
//       { id: usuario._id, email: usuario.email },
//       process.env.SECRETO_JWT || 'tu-secreto-super-seguro',
//       { expiresIn: '24h' }
//     );
    
//     return NextResponse.json({ ok: true, token });
//   } catch (error: any) {
//     return NextResponse.json({ ok: false, error: 'Error de servidor' }, { status: 500 });
//   }
// }
