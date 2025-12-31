// src/app/api/clientes/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Cliente from "@/models/Cliente"; // 👈 usa el modelo completo

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Middleware para verificar JWT (acepta cliente o admin)
async function verificarToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { ok: false, error: "Token requerido" },
      { status: 401 }
    );
  }

  const token = auth.replace("Bearer ", "");

  // Intentamos validar con las dos claves posibles
  try {
    jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!);
    return null; // ✅ token de cliente válido
  } catch {
    try {
      jwt.verify(token, process.env.SECRETO_JWT_ADMIN!);
      return null; // ✅ token de admin válido
    } catch {
      return NextResponse.json(
        { ok: false, error: "Token inválido" },
        { status: 401 }
      );
    }
  }
}


// GET - Listar clientes o buscar por nombre/email/id
export async function GET(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const tokenError = await verificarToken(req);
    if (tokenError) return tokenError;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const emailParam = searchParams.get("email");
    const idParam = searchParams.get("id");

    let clientes: any[] = [];

    if (idParam) {
      const cliente = await Cliente.findById(idParam).select("-password");
      if (!cliente) {
        return NextResponse.json({
          ok: false,
          error: "Cliente no encontrado",
        });
      }
      clientes = [cliente];
    } else if (emailParam) {
      const cliente = await Cliente.findOne({ email: emailParam }).select(
        "-password"
      );
      if (!cliente) {
        return NextResponse.json({
          ok: false,
          error: "Cliente no encontrado",
        });
      }
      clientes = [cliente];
    } else if (search) {
      const regex = new RegExp(search, "i");
      clientes = await Cliente.find({
        $or: [{ nombre: regex }, { apellidos: regex }, { email: regex }],
      })
        .select("-password")
        .sort({ createdAt: -1 });
    } else {
      clientes = await Cliente.find().select("-password").sort({ createdAt: -1 });
    }

    return NextResponse.json({ ok: true, clientes });
  } catch (error: any) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear cliente básico (sin auth)
export async function POST(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const data = await req.json();

    const cliente = new Cliente(data);
    await cliente.save();

    const token = jwt.sign(
      { id: cliente._id, email: cliente.email, role: cliente.role || "cliente" },
      process.env.SECRETO_JWT_CLIENTE!,
      { expiresIn: "24h" }
    );

    return NextResponse.json(
      {
        ok: true,
        cliente: {
          id: cliente._id,
          nombre: cliente.nombre,
          apellidos: cliente.apellidos,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion || "",
          ciudad: cliente.ciudad || "",
          cp: cliente.codigoPostal || "",
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { ok: false, error: "Email ya registrado" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Registro completo con doble contraseña
export async function PUT(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { nombre, apellidos, email, password, password2, telefono } =
      await req.json();

    if (password !== password2) {
      return NextResponse.json(
        { ok: false, error: "Las contraseñas no coinciden" },
        { status: 400 }
      );
    }

    const clienteExistente = await Cliente.findOne({ email });
    if (clienteExistente) {
      return NextResponse.json(
        { ok: false, error: "Email ya registrado" },
        { status: 400 }
      );
    }

    const cliente = new Cliente({
  nombre,
  apellidos,
  email,
  password,
  telefono,
});
    await cliente.save();

    const token = jwt.sign(
      { id: cliente._id, email: cliente.email, role: "cliente" },
      process.env.SECRETO_JWT_CLIENTE!,
      { expiresIn: "24h" }
    );

    return NextResponse.json(
      {
        ok: true,
        cliente: {
          id: cliente._id,
          nombre: cliente.nombre,
          apellidos: cliente.apellidos,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion || "",
          ciudad: cliente.ciudad || "",
          cp: cliente.codigoPostal || "",
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Login
export async function PATCH(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { email, password } = await req.json();

    console.log("🧠 Email recibido:", email);
console.log("🧠 Password recibido:", password);

    const cliente = await Cliente.findOne({ email });
    console.log("🧠 Cliente encontrado?", !!cliente);

if (cliente) {
  const esCoincidente = await bcrypt.compare(password, cliente.password);
  console.log("🔍 Coinciden contraseñas?", esCoincidente);
}

    if (!cliente || !(await bcrypt.compare(password, cliente.password))) {
      return NextResponse.json(
        { ok: false, error: "Credenciales inválidas" },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      { id: cliente._id, email: cliente.email, role: cliente.role },
      process.env.SECRETO_JWT_CLIENTE!,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      ok: true,
      cliente: {
        id: cliente._id,
        nombre: cliente.nombre,
        apellidos: cliente.apellidos,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion || "",
        ciudad: cliente.ciudad || "",
        cp: cliente.codigoPostal || "",
      },
      token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
