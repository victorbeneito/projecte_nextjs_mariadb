import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);

    if (isNaN(id)) {
        return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        productos: true,
        cliente: true
      }
    });

    if (!pedido) {
      return NextResponse.json({ ok: false, error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, pedido });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const data = await req.json();

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
         estado: data.estado 
      }
    });

    return NextResponse.json({ ok: true, pedido });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: "Error de servidor" }, { status: 500 });
  }
}