"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClienteAuth } from "@/context/ClienteAuthContext";

interface DireccionForm {
  empresa: string;
  direccion: string;
  direccionComplementaria: string;
  codigoPostal: string;
  ciudad: string;
  pais: string;
  provincia: string;
  telefono: string;
  nif: string;
}

export default function CheckoutDireccionesPage() {
  const { cliente, token, loading, setCliente } = useClienteAuth();

  const router = useRouter();
  const [form, setForm] = useState<DireccionForm>({
    empresa: "",
    direccion: "",
    direccionComplementaria: "",
    codigoPostal: "",
    ciudad: "",
    pais: "España",
    provincia: "",
    telefono: "",
    nif: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // 1. Protección: Si no está logueado, al login
  useEffect(() => {
    if (!loading && !cliente) {
      router.push("/auth?next=/checkout/direcciones");
    }
  }, [cliente, loading, router]);

  // 2. Cargar dirección existente (Pre-rellenar)
  useEffect(() => {
    const cargarDireccion = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/clientes/direccion", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.ok && data.direccion) {
          setForm((prev) => ({
            ...prev,
            empresa: data.direccion.empresa || "",
            direccion: data.direccion.direccion || "",
            direccionComplementaria:
              data.direccion.direccionComplementaria || "",
            codigoPostal: data.direccion.codigoPostal || "",
            ciudad: data.direccion.ciudad || "",
            pais: data.direccion.pais || "España",
            provincia: data.direccion.provincia || "",
            telefono: data.direccion.telefono || "",
            nif: data.direccion.nif || "",
          }));
        }
      } catch {
        // Ignoramos error silencioso
      }
    };
    cargarDireccion();
  }, [token]);

  const handleChange = (field: keyof DireccionForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;
    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const res = await fetch("/api/clientes/direccion", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error al guardar la dirección");

      setMensaje("Dirección guardada correctamente");

      // 🔄 Actualizar el cliente en el contexto local
      if (cliente) {
        setCliente({
          ...cliente,
          direccion: form.direccion,
          ciudad: form.ciudad,
          codigoPostal: form.codigoPostal,
          telefono: form.telefono,
        });
      }

      // 🚀 REDIRECCIÓN CLAVE: Al siguiente paso del checkout
      setTimeout(() => {
        router.push("/checkout/envio");
      }, 500); // Delay corto para ver el mensaje de éxito

    } catch (err: any) {
      setError(err.message || "Error al guardar la dirección");
    } finally {
      setGuardando(false);
    }
  };

  if (loading || !cliente) {
    return (
      <div className="min-h-screen bg-[#f7f6f0] flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-start">
          
          {/* Columna izquierda: Información */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#333333] leading-tight">
              ¿Dónde te lo enviamos?
            </h1>
            <p className="text-sm md:text-base text-[#777777] max-w-md">
              Confirma tus datos de envío para continuar con el pedido.
            </p>

            {/* Resumen cliente */}
            <div className="mt-4 p-4 bg-white border border-[#e4e0d5] rounded-xl shadow-sm">
              <p className="text-xs font-semibold text-[#999999] uppercase tracking-wide mb-1">
                Cliente
              </p>
              <p className="text-sm text-[#333333] font-medium">
                {cliente.nombre} {cliente.apellidos}
              </p>
              <p className="text-xs text-[#777777]">{cliente.email}</p>
            </div>
            
            {/* Paso del Checkout (Indicador visual opcional) */}
            <div className="pt-4 flex gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
               <span className="text-[#333]">1. Dirección</span> &rarr; <span>2. Envío</span> &rarr; <span>3. Pago</span>
            </div>
          </div>

          {/* Columna derecha: Formulario */}
          <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#e4e0d5] p-8">
            <h2 className="text-xl font-semibold text-[#333333] mb-6 text-center tracking-wide uppercase">
              Datos de entrega
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Campos Bloqueados (Nombre) */}
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">Nombre</label>
                <input type="text" value={cliente.nombre} readOnly className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-gray-100 text-[#444] cursor-not-allowed focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">Apellidos</label>
                <input type="text" value={cliente.apellidos} readOnly className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-gray-100 text-[#444] cursor-not-allowed focus:outline-none" />
              </div>

              {/* Empresa */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#777777] mb-1">Empresa (opcional)</label>
                <input type="text" value={form.empresa} onChange={(e) => handleChange("empresa", e.target.value)} className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-white text-[#444] focus:outline-none focus:border-[#d9b98a]" />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#777777] mb-1">Dirección *</label>
                <input type="text" value={form.direccion} onChange={(e) => handleChange("direccion", e.target.value)} required className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-white text-[#444] focus:outline-none focus:border-[#d9b98a]" />
              </div>

              {/* Dirección complementaria */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#777777] mb-1">Dirección complementaria (opcional)</label>
                <input type="text" value={form.direccionComplementaria} onChange={(e) => handleChange("direccionComplementaria", e.target.value)} className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-white text-[#444] focus:outline-none focus:border-[#d9b98a]" />
              </div>

              {/* CP y Ciudad */}
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">Código Postal *</label>
                <input type="text" value={form.codigoPostal} onChange={(e) => handleChange("codigoPostal", e.target.value)} required className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-white text-[#444] focus:outline-none focus:border-[#d9b98a]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">Ciudad *</label>
                <input type="text" value={form.ciudad} onChange={(e) => handleChange("ciudad", e.target.value)} required className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-white text-[#444] focus:outline-none focus:border-[#d9b98a]" />
              </div>

              {/* País y Provincia */}
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">País *</label>
                <input type="text" value={form.pais} onChange={(e) => handleChange("pais", e.target.value)} required className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-white text-[#444] focus:outline-none focus:border-[#d9b98a]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">Provincia *</label>
                <input type="text" value={form.provincia} onChange={(e) => handleChange("provincia", e.target.value)} required className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-white text-[#444] focus:outline-none focus:border-[#d9b98a]" />
              </div>

              {/* Teléfono y NIF */}
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">Teléfono *</label>
                <input type="tel" value={form.telefono} onChange={(e) => handleChange("telefono", e.target.value)} required className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-white text-[#444] focus:outline-none focus:border-[#d9b98a]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">NIF *</label>
                <input type="text" value={form.nif} onChange={(e) => handleChange("nif", e.target.value)} required className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-white text-[#444] focus:outline-none focus:border-[#d9b98a]" />
              </div>

              {/* Mensajes de error/éxito */}
              {error && <div className="md:col-span-2 text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
              {mensaje && <div className="md:col-span-2 text-green-600 text-sm text-center bg-green-50 p-2 rounded">{mensaje}</div>}

              {/* Botones de Acción */}
              <div className="md:col-span-2 flex justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="px-4 py-3 rounded-[8px] border border-transparent text-[#777] hover:text-[#333] transition-colors text-sm font-medium"
                  onClick={() => router.push("/carrito")}
                >
                  &larr; Volver al carrito
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 md:flex-none px-8 py-3 rounded-[8px] bg-primary text-white font-bold tracking-wide hover:bg-primaryHover disabled:opacity-60 transition-all shadow-lg shadow-yellow-500/30"
                >
                  {guardando ? "Guardando..." : "Guardar y Continuar \u2192"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}