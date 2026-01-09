import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

function getTokenFromHeader(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.replace('Bearer ', '');
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!);
    const id = parseInt(decoded.id);

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      // Prisma selecciona todo por defecto, puedes usar select si quieres filtrar campos específicos
    });

    if (!cliente) return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 });

    const { password: _, ...datosDireccion } = cliente;
    return NextResponse.json({ ok: true, direccion: datosDireccion });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return NextResponse.json({ ok: false, error: 'Token requerido' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!) as any;
    const id = parseInt(decoded.id);
    const body = await req.json();

    const updateData = {
      empresa: body.empresa,
      direccion: body.direccion,
      direccionComplementaria: body.direccionComplementaria,
      codigoPostal: body.codigoPostal,
      ciudad: body.ciudad,
      pais: body.pais || 'España',
      provincia: body.provincia,
      telefono: body.telefono,
      nif: body.nif,
    };

    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ ok: true, direccion: clienteActualizado });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}