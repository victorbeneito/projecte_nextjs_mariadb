import { NextResponse } from "next/server";
import { prisma} from "@/lib/prisma";

// Tipo explícito para evitar error TS
type CuponDB = {
  id: number;
  codigo: string;
  tipoDescuento: string;
  valorDescuento: number;
  cantidadTotal: number;
  cantidadUsada: number;
  limitePorUsuario: number;
  fechaInicio: Date;
  fechaFin: Date;
};

export async function GET() {
  try {
    const cupones = await prisma.cupon.findMany({
      orderBy: { createdAt: 'desc' }
    }) as CuponDB[]; // ← Type assertion

    const cuponesTransformados = cupones.map((cupon: CuponDB) => ({
      id: cupon.id,
      codigo: cupon.codigo,
      tipo_descuento: cupon.tipoDescuento === 'PORCENTAJE' ? 'porcentaje' : 'fijo',
      valor_descuento: Number(cupon.valorDescuento),
      cantidad_total: Number(cupon.cantidadTotal),
      usos_consumidos: Number(cupon.cantidadUsada),
      restantes: Number(cupon.cantidadTotal - cupon.cantidadUsada),
      limite_usuario: Number(cupon.limitePorUsuario),
      fecha_inicio: cupon.fechaInicio.toISOString(),
      fecha_fin: cupon.fechaFin.toISOString(),
    }));

    console.log("✅ Cupones:", cuponesTransformados.length);
    return NextResponse.json(cuponesTransformados);
  } catch (error) {
    console.error("❌ ERROR GET:", error);
    return NextResponse.json({ error: "Error al cargar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const nuevoCupon = await prisma.cupon.create({
      data: {
        codigo: body.codigo.toUpperCase(),
        tipoDescuento: body.tipo_descuento === 'fijo' ? 'FIJO' : 'PORCENTAJE',
        valorDescuento: parseFloat(body.valor_descuento),
        cantidadTotal: parseInt(body.cantidad_total),
        cantidadUsada: 0,
        limitePorUsuario: parseInt(body.limite_usuario),
        fechaInicio: new Date(body.fecha_inicio),
        fechaFin: new Date(body.fecha_fin),
        activo: true,
      }
    });

    console.log("✅ Creado:", nuevoCupon.codigo);
    return NextResponse.json(nuevoCupon);
  } catch (error: any) {
    console.error("❌ POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...body } = await req.json();
    
    const cuponActualizado = await prisma.cupon.update({
      where: { id: Number(id) },
      data: {
        codigo: body.codigo.toUpperCase(),
        tipoDescuento: body.tipo_descuento === 'fijo' ? 'FIJO' : 'PORCENTAJE',
        valorDescuento: parseFloat(body.valor_descuento),
        cantidadTotal: parseInt(body.cantidad_total),
        limitePorUsuario: parseInt(body.limite_usuario),
        fechaInicio: new Date(body.fecha_inicio),
        fechaFin: new Date(body.fecha_fin),
        activo: true,
      }
    });

    console.log("✅ Actualizado:", cuponActualizado.codigo);
    return NextResponse.json(cuponActualizado);
  } catch (error: any) {
    console.error("❌ PUT:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.cupon.delete({ where: { id: Number(id) } });
    console.log("✅ Eliminado:", id);
    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("❌ DELETE:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
