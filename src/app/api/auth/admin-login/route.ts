import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Asegúrate de tener este archivo
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // 1. Buscar usuario por email
    const admin = await prisma.usuario.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    // 2. Comprobar si existe y si es admin
    // Nota: En tu schema.prisma definimos el enum RolUsuario { ADMIN, CLIENTE }
    // Prisma devuelve el rol como string o enum, asegúrate de comparar bien.
    if (!admin || admin.rol !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "Administrador no encontrado o sin permisos" },
        { status: 401 }
      );
    }

    // 3. Verificar contraseña
    const esValido = await bcrypt.compare(password, admin.password);
    if (!esValido) {
      return NextResponse.json(
        { ok: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // 4. Crear Token (Usamos admin.id que ahora es un número, no un string largo)
    const token = jwt.sign(
      { id: admin.id, email: admin.email, rol: admin.rol },
      process.env.SECRETO_JWT_ADMIN!,
      { expiresIn: "7d" }
    );

    // 5. Devolver datos (Excluyendo contraseña)
    // Usamos destructuring para separar password del resto
    const { password: _, ...adminSinPassword } = admin;

    return NextResponse.json({ ok: true, token, admin: adminSinPassword });

  } catch (error: any) {
    console.error("❌ Error en admin-login:", error.message);
    return NextResponse.json(
      { ok: false, error: "Error de servidor" },
      { status: 500 }
    );
  }
}