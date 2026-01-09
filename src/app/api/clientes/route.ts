import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Obtener parámetros de la URL
    const { searchParams } = new URL(req.url);
    const clienteIdParam = searchParams.get("clienteId");
    
    // 2. Obtener y Validar Token
    const authHeader = req.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    let esAdmin = false;
    let usuarioId = null;

    // A) Verificamos si es Admin
    try {
      if (process.env.SECRETO_JWT_ADMIN) {
        const decodedAdmin: any = jwt.verify(token, process.env.SECRETO_JWT_ADMIN);
        if (decodedAdmin.rol === "ADMIN" || decodedAdmin.role === "admin") esAdmin = true;
      }
    } catch (e) {}

    // B) Verificamos si es Cliente (si no es admin)
    if (!esAdmin) {
      try {
        const decodedCliente: any = jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!);
        usuarioId = decodedCliente.id;
      } catch (e) {
        return NextResponse.json({ error: "Token inválido" }, { status: 403 });
      }
    }

    // 3. Construir el filtro
    let whereClause: any = {};

    if (clienteIdParam) {
      const idSolicitado = parseInt(clienteIdParam);

      // Seguridad: Un cliente solo puede ver SUS pedidos
      if (!esAdmin && String(usuarioId) !== String(idSolicitado)) {
        return NextResponse.json({ error: "No puedes ver pedidos de otro usuario" }, { status: 403 });
      }

      whereClause = { clienteId: idSolicitado };
    
    } else {
      // Si no piden ID específico, es el panel de admin pidiendo todos
      if (!esAdmin) {
        return NextResponse.json({ error: "Solo admin puede ver todos los pedidos" }, { status: 403 });
      }
    }

    // 4. Buscar en Prisma
    const pedidos = await prisma.pedido.findMany({
      where: whereClause,
      // 👇 CAMBIO CLAVE: Ordenamos por ID para evitar errores con fechas
      orderBy: { id: "desc" }, 
      include: {
        productos: true,
        cliente: {
            select: { nombre: true, email: true }
        }
      }
    });

    return NextResponse.json({ pedidos });

  } catch (error: any) {
    console.error("❌ Error API Pedidos:", error.message);
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";

// // GET: Buscar Clientes
// export async function GET(req: NextRequest) {
//   try {
//     // Aquí podrías validar token de admin si quisieras

//     const { searchParams } = new URL(req.url);
//     const search = searchParams.get("search");
//     const emailParam = searchParams.get("email");
//     const idParam = searchParams.get("id");

//     let whereClause: any = {};

//     if (idParam) {
//       whereClause.id = parseInt(idParam);
//     } else if (emailParam) {
//       whereClause.email = emailParam;
//     } else if (search) {
//       whereClause = {
//         OR: [
//           { nombre: { contains: search } }, // En Postgres añadir: mode: 'insensitive'
//           { apellidos: { contains: search } },
//           { email: { contains: search } }
//         ]
//       };
//     }

//     const clientes = await prisma.cliente.findMany({
//       where: whereClause,
//       orderBy: { createdAt: 'desc' }
//     });

//     // Quitamos passwords de la lista
//     const clientesSafe = clientes.map(({ password, ...resto }) => resto);

//     return NextResponse.json({ ok: true, clientes: clientesSafe });
//   } catch (error: any) {
//     return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
//   }
// }

// // POST: Crear Cliente (Registro Simple)
// export async function POST(req: NextRequest) {
//   try {
//     const data = await req.json();

//     // Hashear password
//     const hashedPassword = await bcrypt.hash(data.password, 10);

//     const cliente = await prisma.cliente.create({
//       data: {
//         ...data,
//         password: hashedPassword,
//         role: "cliente"
//       }
//     });

//     const token = jwt.sign(
//       { id: cliente.id, email: cliente.email, role: cliente.role },
//       process.env.SECRETO_JWT_CLIENTE!,
//       { expiresIn: "24h" }
//     );

//     const { password: _, ...clienteSafe } = cliente;

//     return NextResponse.json({ ok: true, cliente: clienteSafe, token }, { status: 201 });
//   } catch (error: any) {
//     // Código de error P2002 es "Unique constraint failed" (Email duplicado)
//     if (error.code === 'P2002') {
//       return NextResponse.json({ ok: false, error: "Email ya registrado" }, { status: 400 });
//     }
//     return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
//   }
// }

// // PUT: Registro completo (Doble password)
// export async function PUT(req: NextRequest) {
//   try {
//     const { nombre, apellidos, email, password, password2, telefono } = await req.json();

//     if (password !== password2) {
//       return NextResponse.json({ ok: false, error: "Las contraseñas no coinciden" }, { status: 400 });
//     }

//     const existe = await prisma.cliente.findUnique({ where: { email } });
//     if (existe) return NextResponse.json({ ok: false, error: "Email ya registrado" }, { status: 400 });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const cliente = await prisma.cliente.create({
//       data: {
//         nombre,
//         apellidos,
//         email,
//         password: hashedPassword,
//         telefono,
//         role: "cliente"
//       }
//     });

//     const token = jwt.sign(
//       { id: cliente.id, email: cliente.email, role: "cliente" },
//       process.env.SECRETO_JWT_CLIENTE!,
//       { expiresIn: "24h" }
//     );

//     const { password: _, ...clienteSafe } = cliente;

//     return NextResponse.json({ ok: true, cliente: clienteSafe, token }, { status: 201 });
//   } catch (error: any) {
//     return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
//   }
// }

// // PATCH: Login
// export async function PATCH(req: NextRequest) {
//   try {
//     const { email, password } = await req.json();

//     const cliente = await prisma.cliente.findUnique({ where: { email } });

//     if (!cliente || !(await bcrypt.compare(password, cliente.password))) {
//       return NextResponse.json({ ok: false, error: "Credenciales inválidas" }, { status: 400 });
//     }

//     const token = jwt.sign(
//       { id: cliente.id, email: cliente.email, role: cliente.role },
//       process.env.SECRETO_JWT_CLIENTE!,
//       { expiresIn: "24h" }
//     );

//     const { password: _, ...clienteSafe } = cliente;

//     return NextResponse.json({ ok: true, cliente: clienteSafe, token });
//   } catch (error: any) {
//     return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
//   }
// }