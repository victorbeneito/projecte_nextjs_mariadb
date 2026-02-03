import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ============================================================================
// GET: Obtener cupones
// ============================================================================
export async function GET() {
  try {
    const cupones = await prisma.cupon.findMany({ orderBy: { id: 'desc' } });

    const cuponesTransformados = cupones.map((cupon: any) => {
      const inicio = cupon.fechaInicio ? new Date(cupon.fechaInicio) : new Date();
      const fin = cupon.fechaFin ? new Date(cupon.fechaFin) : new Date();

      return {
        id: cupon.id,
        codigo: cupon.codigo,
        tipo_descuento: (cupon.tipoDescuento === 'PORCENTAJE') ? 'porcentaje' : 'fijo',
        valor_descuento: Number(cupon.valorDescuento || 0),
        cantidad_total: Number(cupon.cantidadTotal || 0),
        usos_consumidos: Number(cupon.cantidadUsada || 0),
        restantes: Number((cupon.cantidadTotal || 0) - (cupon.cantidadUsada || 0)),
        limite_usuario: Number(cupon.limitePorUsuario || 1),
        fecha_inicio: inicio.toISOString(),
        fecha_fin: fin.toISOString(),
        activo: cupon.activo ?? true
      };
    });

    return NextResponse.json(cuponesTransformados);
  } catch (error: any) {
    console.error("❌ ERROR GET CUPONES:", error);
    return NextResponse.json({ error: "Error interno", detalle: error.message }, { status: 500 });
  }
}

// ============================================================================
// POST: Crear Cupón (CORREGIDO)
// ============================================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📨 Recibiendo datos:", body); 

    // 1. TRADUCTOR DE CAMPOS
    const codigoRaw = body.codigo || body.code || "CUPON-SIN-CODIGO";
    const valor = parseFloat(body.valor_descuento || body.valorDescuento || body.valor || 0);
    const total = parseInt(body.cantidad_total || body.cantidadTotal || body.total || "100");
    const limite = parseInt(body.limite_usuario || body.limitePorUsuario || body.limite || "1");

    let tipoFinal = 'FIJO';
    const tipoRecibido = String(body.tipo_descuento || body.tipoDescuento || "").toLowerCase();
    if (tipoRecibido.includes('porcent')) {
      tipoFinal = 'PORCENTAJE';
    }

    // 2. PROTECCIÓN DE FECHAS
    let fInicio = new Date();
    if (body.fecha_inicio && body.fecha_inicio !== "") fInicio = new Date(body.fecha_inicio);
    else if (body.fechaInicio && body.fechaInicio !== "") fInicio = new Date(body.fechaInicio);

    let fFin = new Date();
    fFin.setFullYear(fFin.getFullYear() + 1); 
    if (body.fecha_fin && body.fecha_fin !== "") fFin = new Date(body.fecha_fin);
    else if (body.fechaFin && body.fechaFin !== "") fFin = new Date(body.fechaFin);

    // 3. GUARDAR EN BASE DE DATOS
    const nuevoCupon = await prisma.cupon.create({
      data: {
        codigo: codigoRaw.toUpperCase(),
        tipoDescuento: tipoFinal,
        valorDescuento: valor,
        cantidadTotal: total,
        cantidadUsada: 0,
        limitePorUsuario: limite,
        fechaInicio: fInicio,
        fechaFin: fFin,
        activo: true,
        // 👇👇 AQUÍ ESTÁ EL ARREGLO 👇👇
        updatedAt: new Date(), 
      }
    });

    console.log("✅ ¡Cupón creado con éxito!", nuevoCupon.id);
    return NextResponse.json(nuevoCupon);

  } catch (error: any) {
    console.error("❌ ERROR CREANDO CUPÓN:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Borrar
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.cupon.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "OK" });
  } catch (error) {
    return NextResponse.json({ error: "Error borrando" }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import { prisma} from "@/lib/prisma";

// // Tipo explícito para evitar error TS
// type CuponDB = {
//   id: number;
//   codigo: string;
//   tipoDescuento: string;
//   valorDescuento: number;
//   cantidadTotal: number;
//   cantidadUsada: number;
//   limitePorUsuario: number;
//   fechaInicio: Date;
//   fechaFin: Date;
// };

// export async function GET() {
//   try {
//     const cupones = await prisma.cupon.findMany({
//       orderBy: { createdAt: 'desc' }
//     }) as CuponDB[]; // ← Type assertion

//     const cuponesTransformados = cupones.map((cupon: CuponDB) => ({
//       id: cupon.id,
//       codigo: cupon.codigo,
//       tipo_descuento: cupon.tipoDescuento === 'PORCENTAJE' ? 'porcentaje' : 'fijo',
//       valor_descuento: Number(cupon.valorDescuento),
//       cantidad_total: Number(cupon.cantidadTotal),
//       usos_consumidos: Number(cupon.cantidadUsada),
//       restantes: Number(cupon.cantidadTotal - cupon.cantidadUsada),
//       limite_usuario: Number(cupon.limitePorUsuario),
//       fecha_inicio: cupon.fechaInicio.toISOString(),
//       fecha_fin: cupon.fechaFin.toISOString(),
//     }));

//     console.log("✅ Cupones:", cuponesTransformados.length);
//     return NextResponse.json(cuponesTransformados);
//   } catch (error) {
//     console.error("❌ ERROR GET:", error);
//     return NextResponse.json({ error: "Error al cargar" }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
    
//     const nuevoCupon = await prisma.cupon.create({
//       data: {
//         codigo: body.codigo.toUpperCase(),
//         tipoDescuento: body.tipo_descuento === 'fijo' ? 'FIJO' : 'PORCENTAJE',
//         valorDescuento: parseFloat(body.valor_descuento),
//         cantidadTotal: parseInt(body.cantidad_total),
//         cantidadUsada: 0,
//         limitePorUsuario: parseInt(body.limite_usuario),
//         fechaInicio: new Date(body.fecha_inicio),
//         fechaFin: new Date(body.fecha_fin),
//         activo: true,
//       }
//     });

//     console.log("✅ Creado:", nuevoCupon.codigo);
//     return NextResponse.json(nuevoCupon);
//   } catch (error: any) {
//     console.error("❌ POST:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function PUT(req: Request) {
//   try {
//     const { id, ...body } = await req.json();
    
//     const cuponActualizado = await prisma.cupon.update({
//       where: { id: Number(id) },
//       data: {
//         codigo: body.codigo.toUpperCase(),
//         tipoDescuento: body.tipo_descuento === 'fijo' ? 'FIJO' : 'PORCENTAJE',
//         valorDescuento: parseFloat(body.valor_descuento),
//         cantidadTotal: parseInt(body.cantidad_total),
//         limitePorUsuario: parseInt(body.limite_usuario),
//         fechaInicio: new Date(body.fecha_inicio),
//         fechaFin: new Date(body.fecha_fin),
//         activo: true,
//       }
//     });

//     console.log("✅ Actualizado:", cuponActualizado.codigo);
//     return NextResponse.json(cuponActualizado);
//   } catch (error: any) {
//     console.error("❌ PUT:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function DELETE(req: Request) {
//   try {
//     const { id } = await req.json();
//     await prisma.cupon.delete({ where: { id: Number(id) } });
//     console.log("✅ Eliminado:", id);
//     return NextResponse.json({ message: "OK" });
//   } catch (error) {
//     console.error("❌ DELETE:", error);
//     return NextResponse.json({ error: "Error" }, { status: 500 });
//   }
// }
