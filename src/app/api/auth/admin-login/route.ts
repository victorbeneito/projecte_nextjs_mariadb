import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ Usamos tu archivo singleton
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log(`🔐 Admin Login intento: ${email}`);

    // 1. Buscar usuario
    const admin = await prisma.usuario.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    // 2. Comprobar si existe y si es ADMIN
    // Convertimos a mayúsculas para evitar errores de "Admin" vs "ADMIN"
    const rol = admin?.rol?.toString().toUpperCase();

    if (!admin || rol !== "ADMIN") {
      console.warn(`❌ Login fallido: Usuario no encontrado o no es ADMIN (${rol})`);
      return NextResponse.json(
        { ok: false, error: "Credenciales inválidas o sin permisos" },
        { status: 401 }
      );
    }

    // 3. Verificar contraseña
    const esValido = await bcrypt.compare(password, admin.password);
    
    if (!esValido) {
      console.warn("❌ Login fallido: Contraseña incorrecta");
      return NextResponse.json(
        { ok: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // 4. Crear Token
    // IMPORTANTE: Usamos fallback "||" para que NO falle si falta la variable en Vercel
    const secret = process.env.SECRETO_JWT_ADMIN || "palabra_secreta_emergencia_2026";

    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        rol: admin.rol, 
        nombre: admin.nombre 
      },
      secret,
      { expiresIn: "7d" }
    );

    // 5. Preparar respuesta (sin password)
    const { password: _, ...adminSinPassword } = admin;

    const response = NextResponse.json({ 
      ok: true, 
      token, 
      user: adminSinPassword 
    });

    // Cookie opcional pero recomendada
    response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    console.log("✅ Admin Login ÉXITO");
    return response;

  } catch (error: any) {
    console.error("❌ CRITICAL ERROR en admin-login:", error);
    return NextResponse.json(
      { ok: false, error: "Error del servidor: " + error.message },
      { status: 500 }
    );
  }
}