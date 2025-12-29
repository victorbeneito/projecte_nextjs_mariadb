import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "@/models/Usuario"; // 👈 cambia aquí

export async function POST(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const { email, password } = await req.json();

    // 🔍 Buscar solo usuarios con rol admin
    const admin = await Usuario.findOne({
      email: email.toLowerCase(),
      rol: "admin",
    });

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Administrador no encontrado" },
        { status: 401 }
      );
    }

    const esValido = await bcrypt.compare(password, admin.password);
    if (!esValido) {
      return NextResponse.json(
        { ok: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // 🪪 Crear token de administrador
    const token = jwt.sign(
      { id: admin._id, email: admin.email, rol: "admin" },
      process.env.SECRETO_JWT_ADMIN!,
      { expiresIn: "7d" }
    );

    const adminSinPassword = admin.toObject();
    delete adminSinPassword.password;

    return NextResponse.json({ ok: true, token, admin: adminSinPassword });
  } catch (error: any) {
    console.error("❌ Error en admin-login:", error.message);
    return NextResponse.json(
      { ok: false, error: "Error de servidor" },
      { status: 500 }
    );
  }
}
