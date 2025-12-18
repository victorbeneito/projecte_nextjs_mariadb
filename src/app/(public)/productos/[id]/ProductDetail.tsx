// src/app/productos/[id]/ProductDetail.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

interface CategoriaProducto {
  _id: string;
  nombre: string;
}

interface Variante {
  _id: string;
  color?: string;
  imagen?: string;
  tamaño?: string;
  tirador?: string;
  precio_extra?: number | null;
}

interface Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  descripcion_html?: string;
  precio: number;
  precio_descuento?: number | null;
  descuento_porcentaje?: number | null;
  imagenes?: string[];      // opcionales
  variantes?: Variante[];   // opcionales
  categoria?: CategoriaProducto;
}

export default function ProductDetail({ producto }: { producto: Producto }) {
  // Arrays seguros
  const imagenes = Array.isArray(producto.imagenes)
    ? producto.imagenes
    : [];

  const variantes = Array.isArray(producto.variantes)
    ? producto.variantes
    : [];

  const [imagenActiva, setImagenActiva] = useState(imagenes[0] ?? "");
  const [cantidad, setCantidad] = useState(1);
  const [tabActiva, setTabActiva] = useState<
    "descripcion" | "detalles" | "opiniones">("descripcion");
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState<string | null>(null);
const [tiradorSeleccionado, setTiradorSeleccionado] = useState<string | null>(null);
const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null);

const tamaños = variantes.filter((v) => v.tamaño);
const tiradores = variantes.filter((v) => v.tirador);
const colores = variantes.filter((v) => v.color);

// precio base (ya con descuento si lo usas o solo producto.precio)
const precioBase = producto.precio_descuento ?? producto.precio;

// buscar precio_extra según selección
const extraTamanoVariante = tamaños.find((t) => t.tamaño === tamanoSeleccionado);


const extraTamano = extraTamanoVariante?.precio_extra ?? 0;

const precioFinal = precioBase + extraTamano;


  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Migas de pan */}
      <nav className="text-sm text-gray-500 mb-2">
        <Link href="/" className="cursor-pointer hover:underline">
          Inicio
        </Link>
        <span className="mx-1">/</span>

        {producto.categoria && producto.categoria._id ? (
          <Link
            href={`/categorias/${producto.categoria._id}`}
            className="cursor-pointer hover:underline"
          >
            {producto.categoria.nombre}
          </Link>
        ) : (
          <span>Sin categoría</span>
        )}

        <span className="mx-1">/</span>
        <span className="text-gray-800 font-medium">{producto.nombre}</span>
      </nav>

      {/* Zona superior: imágenes + info */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Card imágenes */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
            {imagenActiva ? (
              <img
                src={imagenActiva}
                alt={producto.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">Sin imagen</span>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {imagenes.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImagenActiva(img)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded border ${
                    imagenActiva === img
                      ? "border-primary"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${producto.nombre} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card info producto */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col gap-4">
          {/* Título */}
          <h1 className="text-2xl font-semibold text-gray-900">
            {producto.nombre}
          </h1>

          {/* Precio y descuento */}
          <div className="flex items-baseline gap-3">
  <span className="text-2xl font-bold text-primary">
    {precioFinal.toFixed(2)} €
  </span>

  {/* Si hay descuento, muestra el precio original tachado */}
  {producto.precio_descuento && (
    <span className="text-sm line-through text-gray-400">
      {producto.precio.toFixed(2)} €
    </span>
  )}

  {producto.descuento_porcentaje && (
    <span className="text-xs font-semibold text-white bg-green-500 px-2 py-1 rounded">
      -{producto.descuento_porcentaje}%
    </span>
  )}
</div>


          {/* Variantes */}
          <div className="space-y-4">
            {/* Tamaño */}
{tamaños.length > 0 && (
  <div>
    <h3 className="text-sm font-medium mb-1">Tamaño</h3>
    <select
      className="w-full border rounded px-3 py-2 text-sm"
      value={tamanoSeleccionado ?? ""}
      onChange={(e) => setTamanoSeleccionado(e.target.value || null)}
    >
      <option value="">Selecciona tamaño</option>
      {tamaños.map((t) => (
        <option key={t._id} value={t.tamaño}>
          {t.tamaño}
        </option>
      ))}
    </select>
  </div>
)}

{/* Tirador */}
{tiradores.length > 0 && (
  <div>
    <h3 className="text-sm font-medium mb-1">Tirador</h3>
    <div className="grid grid-cols-2 gap-2">
      {tiradores.map((t) => (
        <button
          key={t._id}
          type="button"
          className="border rounded px-3 py-2 text-sm hover:border-primary"
        >
          {t.tirador}
        </button>
      ))}
    </div>
  </div>
)}

{/* Color */}
{colores.length > 0 && (
  <div>
    <h3 className="text-sm font-medium mb-1">Color</h3>
    <div className="flex flex-wrap gap-2">
      {colores.map((c) => (
        <button
          key={c._id}
          type="button"
          className="border rounded-full h-8 px-3 text-xs flex items-center justify-center hover:border-primary"
        >
          {c.color}
        </button>
      ))}
    </div>
  </div>
)}

          </div>

          {/* Cantidad + botón */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center border rounded">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="px-3 py-2 text-sm"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) =>
                  setCantidad(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-14 text-center border-x text-sm"
              />
              <button
                type="button"
                onClick={() => setCantidad((c) => c + 1)}
                className="px-3 py-2 text-sm"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="flex-1 bg-primary text-white py-2 rounded font-semibold hover:bg-primaryHover transition-colors"
            >
              Añadir al carrito
            </button>
          </div>

          {/* Compartir + redes */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-medium">Compartir:</span>
            <div className="flex gap-2">
              <button
                aria-label="Compartir en X"
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm"
              >
                X
              </button>
              <button
                aria-label="Compartir en Instagram"
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm"
              >
                IG
              </button>
              <button
                aria-label="Compartir en TikTok"
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm"
              >
                TT
              </button>
            </div>
          </div>

          {/* Sellos */}
          <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔄</span>
              <span>Cambios o devoluciones</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🚚</span>
              <span>Envíos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <span>Pago 100% seguro: Visa, Mastercard, Paypal, Bizum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card pestañas descripción / detalles / opiniones */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b flex">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              tabActiva === "descripcion"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500"
            }`}
            onClick={() => setTabActiva("descripcion")}
          >
            Descripción
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              tabActiva === "detalles"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500"
            }`}
            onClick={() => setTabActiva("detalles")}
          >
            Detalles del producto
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              tabActiva === "opiniones"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500"
            }`}
            onClick={() => setTabActiva("opiniones")}
          >
            Opiniones
          </button>
        </div>

 
        <div className="p-4 text-sm text-gray-700">
  {tabActiva === "descripcion" && (
    <div
      className="prose max-w-none prose-img:max-w-full prose-img:h-auto"
      dangerouslySetInnerHTML={{
  __html:
    (producto as any).descripcion_html_cruda ||
    producto.descripcion ||
    "",
}}
    />
  )}

  {tabActiva === "detalles" && (
    <p>
      Aquí irán los detalles técnicos del producto (tejido,
      composición, mantenimiento, etc.).
    </p>
  )}

  {tabActiva === "opiniones" && (
    <p>Todavía no hay opiniones para este producto.</p>
  )}
</div>

      </div>
    </div>
  );
}
