import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // 👈 NECESARIO PARA GENERAR EL TOKEN

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, apellidos, email, password, telefono, direccion, ciudad, cp, codigoPostal, provincia, pais } = body;

    // 1. Validar campos
    if (!email || !password || !nombre) {
      return NextResponse.json(
        { ok: false, message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // 2. Verificar duplicados
    const usuarioExistente = await prisma.cliente.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { ok: false, message: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    // 3. Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const cpFinal = codigoPostal || cp || "";

    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre,
        apellidos: apellidos || "",
        email,
        password: hashedPassword,
        telefono: telefono || null,
        direccion: direccion || null,
        ciudad: ciudad || null,
        codigoPostal: cpFinal,
        provincia: provincia || null,
        pais: pais || null,
        role: "client",
        updatedAt: new Date()
      },
    });

    const { password: _, ...clienteSinPassword } = nuevoCliente;

    // 4. 🔥 GENERAR TOKEN (ESTO ES LO QUE FALTABA) 🔥
    // Usamos la misma clave secreta que en el Login. 
    // Si tienes una variable de entorno JWT_SECRET, la usará.
    const token = jwt.sign(
      { 
        id: nuevoCliente.id, 
        email: nuevoCliente.email, 
        role: nuevoCliente.role 
      },
      process.env.JWT_SECRET || "secreto_super_seguro_tienda", // Fallback por si no hay .env
      { expiresIn: "30d" }
    );

    return NextResponse.json(
      {
        ok: true,
        message: "Usuario registrado con éxito",
        user: clienteSinPassword,
        cliente: clienteSinPassword,
        token: token // 👈 AHORA SÍ ENVIAMOS EL TOKEN
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("❌ Error en Register:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}