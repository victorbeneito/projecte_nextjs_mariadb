"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";

interface VarianteForm {
  tipo: "TAMAÑO" | "TIRADOR" | "COLOR" | "";
  valor: string;
  precio_extra: string;
}

interface FormData {
  nombre: string;
  descripcion: string;        // puedes dejarla como resumen corto
  descripcion_html_cruda: string;   // NUEVO: descripción con formato
  precio: string;
  stock: string;
  marca: string;
  categoria: string;
  imagenes: string[];
  variantes: VarianteForm[];
}

export default function AdminProductos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    descripcion: "",
    descripcion_html_cruda: "",
    precio: "",
    stock: "",
    marca: "",
    categoria: "",
    imagenes: [""],
    variantes: [],
  });
  const [editando, setEditando] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Cargar datos iniciales
  useEffect(() => {
    fetchProductos();
    fetchMarcas();
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    const res = await fetch("/api/productos");
    const data = await res.json();
    setProductos(data.productos || []);
  };

  const fetchMarcas = async () => {
    const res = await fetch("/api/marcas");
    const data = await res.json();
    setMarcas(data.marcas || []);
  };

  const fetchCategorias = async () => {
    const res = await fetch("/api/categorias");
    const data = await res.json();
    setCategorias(data.categorias || []);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ---- Imágenes ----
  const handleImagenChange = (index: number, value: string) => {
    const nuevas = [...formData.imagenes];
    nuevas[index] = value;
    setFormData({ ...formData, imagenes: nuevas });
  };

  const addImagen = () => {
    setFormData({ ...formData, imagenes: [...formData.imagenes, ""] });
  };

  const removeImagen = (index: number) => {
    const nuevas = formData.imagenes.filter((_, i) => i !== index);
    setFormData({ ...formData, imagenes: nuevas.length ? nuevas : [""] });
  };

  // ---- Variantes ----
  const handleVarianteChange = (
    index: number,
    field: keyof VarianteForm,
    value: string
  ) => {
    const nuevas = [...formData.variantes];
    nuevas[index] = { ...nuevas[index], [field]: value };
    setFormData({ ...formData, variantes: nuevas });
  };

  const addVariante = () => {
    setFormData({
      ...formData,
      variantes: [
        ...formData.variantes,
        { tipo: "", valor: "", precio_extra: "" },
      ],
    });
  };

  const removeVariante = (index: number) => {
    const nuevas = formData.variantes.filter((_, i) => i !== index);
    setFormData({ ...formData, variantes: nuevas });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const url = editando ? `/api/productos/${editId}` : "/api/productos";
    const method = editando ? "PUT" : "POST";

    const imagenesLimpias = formData.imagenes
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const variantesLimpias = formData.variantes
  .filter((v) => v.tipo && v.valor)
  .map((v) => {
    const base = {
      color: "",
      imagen: "",
      tamaño: "",
      tirador: "",
      precio_extra:
        v.precio_extra.trim() === "" ? null : Number(v.precio_extra),
    };

    if (v.tipo === "TAMAÑO") {
      return { ...base, tamaño: v.valor };
    }
    if (v.tipo === "TIRADOR") {
      return { ...base, tirador: v.valor };
    }
    if (v.tipo === "COLOR") {
      return { ...base, color: v.valor };
    }
    return base;
  });

    const payload = {
  ...formData,
  precio: Number(formData.precio),
  stock: Number(formData.stock),
  imagenes: imagenesLimpias,
  variantes: variantesLimpias,
};



    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        await fetchProductos();

        setFormData({
          nombre: "",
          descripcion: "",
          descripcion_html_cruda:"",
          precio: "",
          stock: "",
          marca: "",
          categoria: "",
          imagenes: [""],
          variantes: [],
        });
        setEditando(false);
        setEditId(null);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (producto: any) => {



    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      descripcion_html_cruda: producto.descripcion_html || "",
      precio: String(producto.precio ?? ""),
      stock: String(producto.stock ?? ""),
      marca: producto.marca?.nombre || "",
      categoria: producto.categoria?.nombre || "",
      imagenes:
        Array.isArray(producto.imagenes) && producto.imagenes.length > 0
          ? producto.imagenes
          : [""],
      variantes: Array.isArray(producto.variantes)
  ? producto.variantes.map((v: any) => {
      let tipo: VarianteForm["tipo"] = "";
      let valor = "";

      if (v.tamaño) {
        tipo = "TAMAÑO";
        valor = v.tamaño;
      } else if (v.tirador) {
        tipo = "TIRADOR";
        valor = v.tirador;
      } else if (v.color) {
        tipo = "COLOR";
        valor = v.color;
      }

      return {
        tipo,
        valor,
        precio_extra:
          typeof v.precio_extra === "number"
            ? String(v.precio_extra)
            : v.precio_extra || "",
      };
    })
  : [],
    });
    setEditando(true);
    setEditId(producto._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;

    try {
      const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) fetchProductos();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6BAEC9]/10 to-[#DDC9A3]/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#6BAEC9] to-[#DDC9A3] bg-clip-text text-transparent mb-6">
            Productos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestiona tu catálogo completo de productos
          </p>
        </div>

        {/* Botón volver al panel de administración */}
<div className="mb-12">
  <button
    onClick={() => router.push("/admin")}
    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6BAEC9] to-[#A8D7E6] hover:from-[#5FA0B3] hover:to-[#91C8D9] shadow-md transition-all duration-300"
  >
    ← Volver al Panel de Administración
  </button>
</div>

        {/* Formulario */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-16 border border-white/50">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {editando ? "✏️ Editar Producto" : "➕ Nuevo Producto"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Nombre */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="nombre"
                className="text-sm font-semibold text-gray-700"
              >
                Nombre del producto
              </label>
              <input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="p-6 border border-[#DDC9A3]/50 rounded-2xl focus:ring-4 focus:ring-[#6BAEC9]/30 focus:border-[#6BAEC9] transition-all duration-300 text-lg"
                required
              />
            </div>

            {/* Descripción con formato */}

{/* Descripción HTML cruda */}
<div className="flex flex-col gap-2 md:col-span-2">
  <label
    htmlFor="descripcion_html_cruda"
    className="text-sm font-semibold text-gray-700"
  >
    Descripción HTML (pega aquí el código con &lt;p&gt; e &lt;img&gt;)
  </label>
  <textarea
    id="descripcion_html_cruda"
    name="descripcion_html_cruda"
    value={formData.descripcion_html_cruda}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        descripcion_html_cruda: e.target.value,
      }))
    }
    className="p-6 border border-[#DDC9A3]/50 rounded-2xl focus:ring-4 focus:ring-[#6BAEC9]/30 focus:border-[#6BAEC9] transition-all duration-300 text-lg min-h-[160px] font-mono text-xs"
    placeholder="&lt;p&gt;...&lt;/p&gt; con &lt;img src='https://...' /&gt;"
  />
</div>


{/* <div className="flex flex-col gap-2 md:col-span-2">
  <label className="text-sm font-semibold text-gray-700">
    Descripción detallada (con fotos y formato)
  </label>
  <RichTextEditor
    value={formData.descripcion_html_cruda}
    onChange={(html) =>
      setFormData((prev) => ({ ...prev, descripcion_html: html }))
    }
  />
</div> */}

            {/* Precio */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="precio"
                className="text-sm font-semibold text-gray-700"
              >
                Precio (€)
              </label>
              <input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                className="p-6 border border-[#DDC9A3]/50 rounded-2xl focus:ring-4 focus:ring-[#6BAEC9]/30 focus:border-[#6BAEC9] transition-all duration-300 text-lg"
                required
              />
            </div>

            {/* Stock */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="stock"
                className="text-sm font-semibold text-gray-700"
              >
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                className="p-6 border border-[#DDC9A3]/50 rounded-2xl focus:ring-4 focus:ring-[#6BAEC9]/30 focus:border-[#6BAEC9] transition-all duration-300 text-lg"
                required
              />
            </div>

            {/* Marca */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="marca"
                className="text-sm font-semibold text-gray-700"
              >
                Marca
              </label>
              <select
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="p-6 border border-[#DDC9A3]/50 rounded-2xl focus:ring-4 focus:ring-[#6BAEC9]/30 focus:border-[#6BAEC9] transition-all duration-300 text-lg"
                required
              >
                <option value="">Selecciona marca</option>
                {marcas.map((marca: any) => (
                  <option key={marca._id} value={marca.nombre}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label
                htmlFor="categoria"
                className="text-sm font-semibold text-gray-700"
              >
                Categoría
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="p-6 border border-[#DDC9A3]/50 rounded-2xl focus:ring-4 focus:ring-[#6BAEC9]/30 focus:border-[#6BAEC9] transition-all duration-300 text-lg"
                required
              >
                <option value="">Selecciona categoría</option>
                {categorias.map((cat: any) => (
                  <option key={cat._id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Bloque imágenes */}
            <div className="md:col-span-3 border border-dashed border-[#DDC9A3]/70 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-lg">
                  Imágenes (URLs)
                </label>
                <button
                  type="button"
                  onClick={addImagen}
                  className="px-4 py-1 bg-[#6BAEC9]/80 text-white rounded-xl text-sm hover:bg-[#6BAEC9] transition-all duration-300"
                >
                  ➕ Añadir imagen
                </button>
              </div>

              <div className="space-y-3">
                {formData.imagenes.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={url}
                      onChange={(e) => handleImagenChange(idx, e.target.value)}
                      placeholder="https://..."
                      className="flex-1 p-3 border border-[#DDC9A3]/50 rounded-2xl focus:ring-2 focus:ring-[#6BAEC9]/30 focus:border-[#6BAEC9] text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImagen(idx)}
                      className="px-3 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-all duration-300"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloque variantes */}
            <div className="md:col-span-3 border border-dashed border-[#6BAEC9]/70 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-lg">
                  Variantes (tamaño, tirador, color)
                </label>
                <button
                  type="button"
                  onClick={addVariante}
                  className="px-4 py-1 bg-[#6BAEC9]/80 text-white rounded-xl text-sm hover:bg-[#6BAEC9] transition-all duration-300"
                >
                  ➕ Añadir variante
                </button>
              </div>

              {formData.variantes.length === 0 && (
                <p className="text-sm text-gray-500">
                  No hay variantes. Puedes añadir tamaños, tiradores o colores.
                </p>
              )}

              <div className="space-y-3">
                {formData.variantes.map((v, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                  >
                    <select
                      value={v.tipo}
                      onChange={(e) =>
                        handleVarianteChange(
                          idx,
                          "tipo",
                          e.target.value as VarianteForm["tipo"]
                        )
                      }
                      className="p-3 border border-[#DDC9A3]/50 rounded-2xl text-sm"
                    >
                      <option value="">Tipo</option>
                      <option value="TAMAÑO">Tamaño</option>
                      <option value="TIRADOR">Tirador</option>
                      <option value="COLOR">Color</option>
                    </select>

                    <input
                      value={v.valor}
                      onChange={(e) =>
                        handleVarianteChange(idx, "valor", e.target.value)
                      }
                      placeholder="Ej: 80x180, Derecha, Gris..."
                      className="p-3 border border-[#DDC9A3]/50 rounded-2xl text-sm"
                    />

                    <input
                      value={v.precio_extra}
                      onChange={(e) =>
                        handleVarianteChange(
                          idx,
                          "precio_extra",
                          e.target.value
                        )
                      }
                      placeholder="Precio extra (€)"
                      type="number"
                      step="0.01"
                      className="p-3 border border-[#DDC9A3]/50 rounded-2xl text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => removeVariante(idx)}
                      className="px-3 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-all duration-300"
                    >
                      🗑️ Quitar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-3 bg-gradient-to-r from-[#6BAEC9] to-[#DDC9A3] text-white py-6 rounded-2xl font-bold text-xl shadow-xl hover:from-[#5A9FBA] hover:to-[#CBB498] transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
            >
              {loading
                ? "⏳ Guardando..."
                : editando
                ? "✏️ Actualizar Producto"
                : "➕ Crear Producto"}
            </button>

            {editando && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    nombre: "",
                    descripcion: "",
                    descripcion_html_cruda: "",
                    precio: "",
                    stock: "",
                    marca: "",
                    categoria: "",
                    imagenes: [""],
                    variantes: [],
                  });
                  setEditando(false);
                  setEditId(null);
                }}
                className="md:col-span-3 bg-gray-500/80 hover:bg-gray-600 text-white py-6 rounded-2xl font-bold text-xl transition-all duración-300"
              >
                ❌ Cancelar Edición
              </button>
            )}
          </form>
        </div>

        {/* Tabla Productos */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              📦 Productos ({productos.length})
            </h2>
            <button
              onClick={fetchProductos}
              className="px-8 py-3 bg-[#6BAEC9]/80 hover:bg-[#6BAEC9] text-white rounded-xl font-semibold transition-all duración-300"
            >
              🔄 Actualizar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[#DDC9A3]/30">
                  <th className="py-6 px-4 text-xl font-bold text-gray-700">
                    Nombre
                  </th>
                  <th className="py-6 px-4 text-xl font-bold text-gray-700">
                    Precio
                  </th>
                  <th className="py-6 px-4 text-xl font-bold text-gray-700">
                    Stock
                  </th>
                  <th className="py-6 px-4 text-xl font-bold text-gray-700">
                    Marca
                  </th>
                  <th className="py-6 px-4 text-xl font-bold text-gray-700">
                    Categoría
                  </th>
                  <th className="py-6 px-4 text-xl font-bold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto: any) => (
                  <tr
                    key={producto._id}
                    className="border-b border-gray-200 hover:bg-[#6BAEC9]/5 transition-all duración-200"
                  >
                    <td className="py-6 px-4 font-semibold text-lg">
                      {producto.nombre}
                    </td>
                    <td className="py-6 px-4 font-bold text-xl text-[#6BAEC9]">
                      €{parseFloat(producto.precio).toFixed(2)}
                    </td>
                    <td className="py-6 px-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          producto.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {producto.stock}
                      </span>
                    </td>
                    <td className="py-6 px-4 font-medium text-[#6BAEC9]">
                      {producto.marca?.nombre || "Sin marca"}
                    </td>
                    <td className="py-6 px-4 font-medium text-[#DDC9A3]">
                      {producto.categoria?.nombre || "Sin categoría"}
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="px-6 py-2 bg-[#6BAEC9] text-white rounded-xl font-semibold hover:bg-[#5A9FBA] transition-all duración-300"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(producto._id)}
                          className="px-6 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duración-300"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500 mb-4">📦 No hay productos</p>
              <p className="text-lg text-gray-400">
                ¡Crea tu primer producto arriba!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
