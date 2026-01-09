import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ Usamos Prisma
import jwt from "jsonwebtoken";

// 🔹 Obtener cupones del cliente autenticado
export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    // Decodificar y validar el token
    let userId: number;
    try {
      const decoded: any = jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!);
      userId = parseInt(decoded.id); // Convertimos el ID a número para MariaDB

      if (isNaN(userId)) {
         return NextResponse.json({ error: "ID de usuario inválido en token" }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 403 });
    }

    // 🔹 Buscar cupones globales + cupones asignados a este cliente
    // En Prisma, $or se escribe como OR: []
    const cupones = await prisma.cupon.findMany({
      where: {
        OR: [
          { clienteId: null }, // Cupones para todos
          { clienteId: userId } // Cupones específicos de este usuario
        ]
      },
      orderBy: {
        fechaExpiracion: 'asc' // Orden ascendente
      }
    });

    // Devolvemos "coupons" para mantener compatibilidad con tu frontend
    return NextResponse.json({ ok: true, coupons: cupones });

  } catch (error: any) {
    console.error("❌ Error al obtener cupones:", error);
    return NextResponse.json({ error: "Error al obtener cupones" }, { status: 500 });
  }
}

// 🔹 (Opcional) Crear cupón (para pruebas/admin)
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validamos y convertimos tipos si es necesario
    const nuevoCupon = await prisma.cupon.create({
      data: {
        codigo: data.codigo,
        descripcion: data.descripcion,
        descuento: parseFloat(data.descuento), // Aseguramos que sea número (Float)
        fechaExpiracion: new Date(data.fechaExpiracion), // Aseguramos que sea Date
        clienteId: data.clienteId ? parseInt(data.clienteId) : null, // Si viene cliente, convertimos a Int
        usado: false
      }
    });

    return NextResponse.json({ message: "Cupón creado", cupon: nuevoCupon });
  } catch (error: any) {
    console.error("❌ Error al crear cupón:", error);
    return NextResponse.json({ error: "No se pudo crear el cupón" }, { status: 500 });
  }
}