import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// ✅ SCHEMAS COMPLETOS
const marcaSchema = new mongoose.Schema({ nombre: String });
const categoriaSchema = new mongoose.Schema({ nombre: String });

const varianteSchema = new mongoose.Schema({
  color: String,
  imagen: String,
  tamaño: String,
  tirador: String,
  precio_extra: Number,
});

const productoSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  descripcion_html_cruda: String,
  precio: Number,
  stock: Number,
  marca: { type: mongoose.Schema.Types.ObjectId, ref: "Marca" },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: "Categoria" },
  imagenes: [String],
  categorias: [String],
  variantes: [varianteSchema],
});

const Marca =
  mongoose.models.Marca || mongoose.model("Marca", marcaSchema);
const Categoria =
  mongoose.models.Categoria || mongoose.model("Categoria", categoriaSchema);
const Producto =
  mongoose.models.Producto || mongoose.model("Producto", productoSchema);

// ✅ GET /api/productos/[id]  → obtener un producto por id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await mongoose.connect(process.env.MONGODB_URI!);

    const producto = await Producto.findById(id).populate("marca categoria");

    if (!producto) {
      return NextResponse.json(
        { ok: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, producto }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ PUT /api/productos/[id]  → actualizar producto
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await mongoose.connect(process.env.MONGODB_URI!);

    const body = await req.json();

  
    // CONVERTIR NOMBRES → ObjectId
    const marcaData = await Marca.findOne({ nombre: body.marca });
    const categoriaData = await Categoria.findOne({ nombre: body.categoria });

    if (!marcaData) {
      return NextResponse.json(
        { ok: false, error: `Marca "${body.marca}" no encontrada` },
        { status: 400 }
      );
    }
    if (!categoriaData) {
      return NextResponse.json(
        { ok: false, error: `Categoría "${body.categoria}" no encontrada` },
        { status: 400 }
      );
    }

    const producto = await Producto.findByIdAndUpdate(
  id,
  {
    $set: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      descripcion_html_cruda: body.descripcion_html_cruda,
      precio: body.precio,
      stock: body.stock,
      marca: marcaData._id,
      categoria: categoriaData._id,
      imagenes: body.imagenes ?? [],
      categorias: body.categorias ?? [],
      variantes: body.variantes ?? [], // ← AÑADIDO
    },
  },
  { new: true, runValidators: true }
);

    if (!producto) {
      return NextResponse.json(
        { ok: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, producto }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }
}

// ✅ DELETE /api/productos/[id]  → eliminar producto
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await mongoose.connect(process.env.MONGODB_URI!);

    const producto = await Producto.findByIdAndDelete(id);

    if (!producto) {
      return NextResponse.json(
        { ok: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, mensaje: "Producto eliminado" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
