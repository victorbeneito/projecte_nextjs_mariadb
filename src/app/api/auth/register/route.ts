import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Desestructuramos los datos que envía el formulario
    const { 
      nombre, 
      apellidos, 
      email, 
      password, 
      telefono, 
      direccion, 
      ciudad, 
      codigoPostal, 
      cp, // A veces los formularios lo envían como 'cp'
      provincia, 
      pais 
    } = body;

    // 1. Validaciones obligatorias
    if (!email || !password || !nombre) {
      return NextResponse.json({ 
        ok: false, 
        error: "Faltan campos obligatorios (nombre, email, password)" 
      }, { status: 400 });
    }

    // 2. Comprobar si el email YA existe
    const existe = await prisma.cliente.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existe) {
      return NextResponse.json({ 
        ok: false, 
        error: "Este correo electrónico ya está registrado." 
      }, { status: 400 });
    }

    // 3. Encriptar la contraseña (para no guardarla en texto plano)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Mapear el código postal (por si viene como 'cp' o 'codigoPostal')
    const cpFinal = codigoPostal || cp || "";

    // 5. CREAR EL CLIENTE EN LA BASE DE DATOS
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
        role: "client", // Rol por defecto
      },
    });

    // 6. Devolver respuesta de éxito (sin la contraseña)
    const { password: _, ...clienteSinPass } = nuevoCliente;

    return NextResponse.json({ 
      ok: true, 
      message: "Usuario registrado correctamente",
      cliente: clienteSinPass
    }, { status: 201 });

  } catch (error: any) {
    console.error("❌ Error en Register:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Error interno del servidor al registrar." 
    }, { status: 500 });
  }
}