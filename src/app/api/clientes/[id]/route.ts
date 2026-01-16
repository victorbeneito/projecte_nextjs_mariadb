import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 👇 FUNCIÓN DE SEGURIDAD CORREGIDA (Limpia comillas)
async function verificarPermisos(req: NextRequest, idSolicitado: number) {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader) {
    console.log("❌ [Debug] No hay cabecera Authorization");
    return { autorizado: false, status: 401, error: "Token requerido" };
  }

  // Obtenemos el token "bruto"
  let token = authHeader.split(" ")[1];

  if (!token) {
    return { autorizado: false, status: 401, error: "Token vacío" };
  }

  // 🧹 LIMPIEZA DE TOKEN (EL FIX CLAVE)
  // Si el token llega con comillas extra (ej: "ey..."), las quitamos.
  token = token.replace(/"/g, ''); 

  // Debug: Ver el token limpio
  // console.log("🔑 [Debug] Token final:", token.substring(0, 10) + "...");

  // 1. INTENTO ADMIN
  try {
    if (process.env.SECRETO_JWT_ADMIN) {
        const adminDecoded: any = jwt.verify(token, process.env.SECRETO_JWT_ADMIN);
        if (adminDecoded && (adminDecoded.rol === "ADMIN" || adminDecoded.role === "admin")) {
            return { autorizado: true, esAdmin: true };
        }
    }
  } catch (e) { /* Falló admin */ }

  // 2. INTENTO CLIENTE
  try {
    const secreto = process.env.SECRETO_JWT_CLIENTE;
    const clienteDecoded: any = jwt.verify(token, secreto!);
    
    // COMPARACIÓN DE ID
    if (String(clienteDecoded.id) === String(idSolicitado)) {
      return { autorizado: true, esAdmin: false };
    } else {
      console.log(`❌ [Debug] ID Token (${clienteDecoded.id}) != ID Solicitado (${idSolicitado})`);
    }

  } catch (error: any) {
    console.log("❌ [Debug] Error al verificar token:", error.message);
    // Si falla aquí, es que el token sigue estando mal o ha caducado
  }

  return { autorizado: false, status: 403, error: "No tienes permiso para ver este perfil" };
}

// --- ENDPOINTS ---

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const permiso = await verificarPermisos(req, id);
    if (!permiso.autorizado) {
        return NextResponse.json({ error: permiso.error }, { status: permiso.status || 403 });
    }

    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

    const { password: _, ...clienteSinPassword } = cliente;
    return NextResponse.json({ cliente: clienteSinPassword });

  } catch (error: any) {
    console.error("Error API Cliente GET:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const permiso = await verificarPermisos(req, id);
    if (!permiso.autorizado) {
        return NextResponse.json({ error: permiso.error }, { status: permiso.status || 403 });
    }

    const body = await req.json();

    // 👇 AQUÍ ESTÁ EL CAMBIO: Añadimos nif y empresa
    const datosParaActualizar: any = {
        nombre: body.nombre,
        apellidos: body.apellidos,
        email: body.email,
        telefono: body.telefono,
        direccion: body.direccion,
        ciudad: body.ciudad,
        provincia: body.provincia,
        pais: body.pais,
        codigoPostal: body.cp || body.codigoPostal,
        nif: body.nif || body.dni, // ✅ AÑADIDO (Aceptamos nif o dni por si acaso)
        empresa: body.empresa,     // ✅ AÑADIDO
    };

    // Limpiar undefined
    Object.keys(datosParaActualizar).forEach(key => 
        (datosParaActualizar[key] === undefined || datosParaActualizar[key] === null) && delete datosParaActualizar[key]
    );

    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: datosParaActualizar,
    });

    const { password: _, ...clienteFinal } = clienteActualizado;

    return NextResponse.json({
      message: "Cliente actualizado correctamente",
      cliente: clienteFinal,
    });

  } catch (error: any) {
    console.error("❌ Error PUT Cliente:", error);
    return NextResponse.json({ error: "Error al actualizar el cliente" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    // ... (El delete igual que antes o simplificado para la prueba)
    return NextResponse.json({ message: "No implementado en debug" });
}

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import jwt from "jsonwebtoken";

// interface RouteParams {
//   params: Promise<{ id: string }>;
// }

// // 👇 FUNCIÓN CORREGIDA (Usa 'autorizado' en español)
// async function verificarPermisos(req: NextRequest, idSolicitado: number) {
//   const authHeader = req.headers.get("authorization");
  
//   if (!authHeader) {
//     return { autorizado: false, status: 401, error: "Token requerido" };
//   }

//   const token = authHeader.split(" ")[1];
//   if (!token) {
//     return { autorizado: false, status: 401, error: "Token vacío" };
//   }

//   // 🕵️ CASO 1: ¿ERES ADMINISTRADOR?
//   try {
//     const adminDecoded: any = jwt.verify(token, process.env.SECRETO_JWT_ADMIN!);
    
//     // Debug: Ver qué tiene el token por dentro
//     // console.log("Token Admin Decoded:", adminDecoded);

//     // Verificamos si tiene el rol ADMIN
//     // Nota: Tu login guarda 'rol', así que comprobamos 'rol' o 'role' por si acaso
//     if (adminDecoded && (adminDecoded.rol === "ADMIN" || adminDecoded.role === "admin")) {
//       return { autorizado: true, esAdmin: true }; // ✅ AQUI ESTABA EL ERROR (antes ponía authorized)
//     }
//   } catch (error) {
//     // No es admin o falló la firma. Seguimos probando...
//   }

//   // 🕵️ CASO 2: ¿ERES EL DUEÑO DE LA CUENTA?
//   try {
//     const clienteDecoded: any = jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!);
    
//     // Si el ID del token coincide con el ID que quieres ver
//     if (clienteDecoded && String(clienteDecoded.id) === String(idSolicitado)) {
//       return { autorizado: true, esAdmin: false }; // ✅ CORREGIDO
//     }
//   } catch (error) {
//     // Si falla también aquí, el token no sirve.
//   }

//   // ❌ Si ninguna llave funcionó:
//   console.log("❌ Fallo de permisos. Token recibido pero no validado como Admin ni como Dueño.");
//   return { autorizado: false, status: 403, error: "No tienes permiso para ver este perfil" };
// }


// // --- ENDPOINTS ---

// // GET: Obtener perfil
// export async function GET(req: NextRequest, { params }: RouteParams) {
//   try {
//     const { id: idString } = await params;
//     const id = parseInt(idString);
//     if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

//     // Verificamos permisos
//     const permiso = await verificarPermisos(req, id);
    
//     // Si autorizado es falso o undefined, entra aquí
//     if (!permiso.autorizado) {
//         return NextResponse.json({ error: permiso.error }, { status: permiso.status || 403 });
//     }

//     const cliente = await prisma.cliente.findUnique({ where: { id } });

//     if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

//     const { password: _, ...clienteSinPassword } = cliente;
//     return NextResponse.json({ cliente: clienteSinPassword });

//   } catch (error: any) {
//     console.error("Error API Cliente GET:", error);
//     return NextResponse.json({ error: "Error interno" }, { status: 500 });
//   }
// }

// // PUT: Actualizar perfil
// export async function PUT(req: NextRequest, { params }: RouteParams) {
//   try {
//     const { id: idString } = await params;
//     const id = parseInt(idString);
//     if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

//     const permiso = await verificarPermisos(req, id);
//     if (!permiso.autorizado) {
//         return NextResponse.json({ error: permiso.error }, { status: permiso.status || 403 });
//     }

//     const body = await req.json();

//     // 🧹 LIMPIEZA DE DATOS:
//     // Creamos un objeto SOLO con los campos que permitimos editar.
//     // Así evitamos errores por enviar 'id', 'createdAt' o campos desconocidos.
//     const datosParaActualizar: any = {
//         nombre: body.nombre,
//         apellidos: body.apellidos,
//         email: body.email,
//         telefono: body.telefono,
//         direccion: body.direccion,
//         ciudad: body.ciudad,
//         provincia: body.provincia,
//         pais: body.pais,
//         // 👇 TRUCO: Si tu BD usa 'codigoPostal' pero el formulario envía 'cp', lo asignamos aquí.
//         // Si tu BD usa 'cp', descomenta la línea de abajo y comenta la de codigoPostal.
//         codigoPostal: body.cp || body.codigoPostal, 
//         // cp: body.cp || body.codigoPostal, 
//     };

//     // Eliminamos claves que sean undefined/null para no machacar datos existentes
//     Object.keys(datosParaActualizar).forEach(key => 
//         (datosParaActualizar[key] === undefined || datosParaActualizar[key] === null) && delete datosParaActualizar[key]
//     );

//     const clienteActualizado = await prisma.cliente.update({
//       where: { id },
//       data: datosParaActualizar,
//     });

//     const { password: _, ...clienteFinal } = clienteActualizado;

//     return NextResponse.json({
//       message: "Cliente actualizado correctamente",
//       cliente: clienteFinal,
//     });

//   } catch (error: any) {
//     console.error("❌ Error PUT Cliente:", error); // Verás el error real en la terminal
//     return NextResponse.json({ error: "Error al actualizar el cliente" }, { status: 500 });
//   }
// }

// // DELETE: Borrar cuenta
// export async function DELETE(req: NextRequest, { params }: RouteParams) {
//   try {
//     const { id: idString } = await params;
//     const id = parseInt(idString);
//     if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

//     const permiso = await verificarPermisos(req, id);
//     if (!permiso.autorizado) {
//         return NextResponse.json({ error: permiso.error }, { status: permiso.status || 403 });
//     }

//     await prisma.pedido.deleteMany({ where: { clienteId: id }});
//     await prisma.cliente.delete({ where: { id } });

//     return NextResponse.json({ message: "Cliente eliminado correctamente" });

//   } catch (error: any) {
//     return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import jwt from "jsonwebtoken";

// interface RouteParams {
//   params: Promise<{ id: string }>; // Corrección para Next.js 15+ (Promise)
// }

// // GET: Obtener perfil
// export async function GET(req: NextRequest, { params }: RouteParams) {
//   try {
//     const { id: idString } = await params;
//     const id = parseInt(idString);
//     if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

//     const token = req.headers.get("authorization")?.split(" ")[1];
//     if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 });

//     const decoded: any = jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!);
    
//     // Verificación de seguridad
//     if (!decoded || String(decoded.id) !== String(id)) {
//       return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
//     }

//     const cliente = await prisma.cliente.findUnique({ where: { id } });

//     if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

//     // Excluir contraseña
//     const { password: _, ...clienteSinPassword } = cliente;

//     return NextResponse.json({ cliente: clienteSinPassword });

//   } catch (error: any) {
//     return NextResponse.json({ error: "Error al obtener el cliente" }, { status: 500 });
//   }
// }

// // PUT: Actualizar perfil
// export async function PUT(req: NextRequest, { params }: RouteParams) {
//   try {
//     const { id: idString } = await params;
//     const id = parseInt(idString);
//     if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

//     const token = req.headers.get("authorization")?.split(" ")[1];
//     if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 });

//     const decoded: any = jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!);
//     if (!decoded || String(decoded.id) !== String(id)) {
//       return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
//     }

//     const body = await req.json();
    
//     // Filtramos campos sensibles
//     const { password, email, ...safeBody } = body;

//     const clienteActualizado = await prisma.cliente.update({
//       where: { id },
//       data: safeBody,
//     });

//     const { password: _, ...clienteFinal } = clienteActualizado;

//     return NextResponse.json({
//       message: "Cliente actualizado correctamente",
//       cliente: clienteFinal,
//     });

//   } catch (error: any) {
//     if (error.code === 'P2025') return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
//     return NextResponse.json({ error: "Error al actualizar el cliente" }, { status: 500 });
//   }
// }

// // DELETE: Borrar cuenta
// export async function DELETE(req: NextRequest, { params }: RouteParams) {
//   try {
//     const { id: idString } = await params;
//     const id = parseInt(idString);
//     if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

//     const token = req.headers.get("authorization")?.split(" ")[1];
//     if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 401 });

//     const decoded: any = jwt.verify(token, process.env.SECRETO_JWT_CLIENTE!);
//     if (!decoded || String(decoded.id) !== String(id)) {
//       return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
//     }

//     await prisma.cliente.delete({ where: { id } });

//     return NextResponse.json({ message: "Cliente eliminado correctamente" });

//   } catch (error: any) {
//     return NextResponse.json({ error: "Error al eliminar el cliente" }, { status: 500 });
//   }
// }