import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!);
    const userId = parseInt(decoded.id);

    const { codigo } = await req.json();
    if (!codigo) return NextResponse.json({ error: "Código requerido" }, { status: 400 });

    const upperCode = codigo.toUpperCase().trim();

    // 1. Buscar el cupón
    const cupon = await prisma.cupon.findFirst({
      where: {
        codigo: upperCode,
        // Lógica: O no tiene dueño (es null) O el dueño soy yo
        OR: [
          { clienteId: null },
          { clienteId: userId }
        ]
      },
      // 👇 IMPORTANTE: Incluir la relación para verificar si YA lo usé
      include: {
        clientesUsados: {
          where: { id: userId } // Filtramos solo si YO estoy en la lista de usados
        }
      }
    });

    // Validaciones
    if (!cupon) {
      return NextResponse.json({ valid: false, error: "Cupón no válido o no te pertenece" }, { status: 404 });
    }

    if (new Date(cupon.fechaExpiracion) < new Date()) {
      return NextResponse.json({ valid: false, error: "Cupón expirado" }, { status: 400 });
    }

    // Si el array tiene longitud, es que mi ID estaba en la lista de usados
    if (cupon.clientesUsados.length > 0) {
      return NextResponse.json({ valid: false, error: "Ya has usado este cupón" }, { status: 400 });
    }

    if (cupon.usado) {
      return NextResponse.json({ valid: false, error: "Cupón desactivado" }, { status: 400 });
    }

    // ✅ Todo correcto
    return NextResponse.json({
      valid: true,
      codigo: cupon.codigo,
      descuento: cupon.descuento,
      descripcion: cupon.descripcion,
      fechaExpiracion: cupon.fechaExpiracion,
    });

  } catch (error) {
    console.error("❌ Error validar cupón:", error);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}