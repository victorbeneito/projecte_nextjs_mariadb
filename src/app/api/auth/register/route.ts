import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // 👈 IMPORTANTE: Añadir esto

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { 
      nombre, 
      apellidos, 
      email, 
      password, 
      telefono, 
      direccion, 
      ciudad, 
      codigoPostal, 
      cp, 
      provincia, 
      pais 
    } = body;

    // 1. Validaciones
    if (!email || !password || !nombre) {
      return NextResponse.json({ 
        ok: false, 
        error: "Faltan campos obligatorios" 
      }, { status: 400 });
    }

    // 2. Comprobar duplicados
    const existe = await prisma.cliente.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existe) {
      return NextResponse.json({ 
        ok: false, 
        error: "Este correo ya está registrado." 
      }, { status: 400 });
    }

    // 3. Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10);
    const cpFinal = codigoPostal || cp || "";

    // 4. CREAR CLIENTE
    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre,
        apellidos: apellidos || "",
        email: email.toLowerCase(),
        password: hashedPassword,
        telefono: telefono || null,
        direccion: direccion || null,
        ciudad: ciudad || null,
        codigoPostal: cpFinal,
        provincia: provincia || null,
        pais: pais || null,
        role: "client",
      },
    });

    // 5. 🔥 GENERAR TOKEN (ESTO ES LO QUE FALTABA) 🔥
    const secret = process.env.SECRETO_JWT_CLIENTE || "clave_secreta_cliente_2026";
    
    const token = jwt.sign(
      { 
        id: nuevoCliente.id, 
        email: nuevoCliente.email, 
        rol: "client",
        nombre: nuevoCliente.nombre 
      }, 
      secret, 
      { expiresIn: "30d" }
    );

    // 6. Respuesta con Token
    const { password: _, ...clienteSinPass } = nuevoCliente;

    return NextResponse.json({ 
      ok: true, 
      message: "Registro exitoso",
      cliente: clienteSinPass,
      token: token // 👈 ¡Ahora sí enviamos el token!
    }, { status: 201 });

  } catch (error: any) {
    console.error("❌ Error en Register:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}