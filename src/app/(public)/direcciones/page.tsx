// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useClienteAuth } from "@/context/ClienteAuthContext";
// import { getCart } from "@/lib/cartService";

// export default function DireccionPage() {
//   const router = useRouter();
//   const { cliente } = useClienteAuth();

//   const [form, setForm] = useState({
//     telefono: "",
//     direccion: cliente?.direccion || "",
//     ciudad: cliente?.ciudad || "",
//     cp: cliente?.cp || "",
//   });

//   useEffect(() => {
//     const cart = getCart();
//     if (cart.length === 0) {
//       router.push("/carrito");
//       return;
//     }

//     // Si no hay cliente logueado, redirigir al login
//     if (!cliente) {
//       router.push("/login");
//       return;
//     }
//   }, [router, cliente]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     // ✅ USAR DATOS DEL CLIENTE + formulario
//     localStorage.setItem("checkout_direccion", JSON.stringify({
//       nombre: `${cliente?.nombre || ''} ${cliente?.apellidos || ''}`.trim(),
//       email: cliente?.email || '',
//       telefono: form.telefono,
//       direccion: form.direccion,
//       ciudad: form.ciudad,
//       cp: form.cp,
//     }));

//     router.push("/checkout/envio");
//   };

//   if (!cliente) {
//     return (
//       <div className="max-w-md mx-auto px-4 py-12 text-center">
//         <h1 className="text-2xl font-bold mb-4">Necesitas iniciar sesión</h1>
//         <p className="text-gray-600 mb-8">Inicia sesión para continuar con el checkout.</p>
//         <button
//           onClick={() => router.push("/login")}
//           className="bg-primary text-white px-6 py-2 rounded font-semibold"
//         >
//           Ir al login →
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto px-4 py-12">
//       <h1 className="text-3xl font-bold mb-8">Dirección de envío 📍</h1>
      
//       <div className="bg-blue-50 p-4 rounded-lg mb-6">
//         <p className="font-semibold mb-1">👤 {cliente.nombre} {cliente.apellidos}</p>
//         <p className="text-sm text-gray-700 mb-1">{cliente.email}</p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">Teléfono</label>
//           <input
//             type="tel"
//             value={form.telefono}
//             onChange={(e) => setForm({ ...form, telefono: e.target.value })}
//             placeholder="123 456 789"
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Dirección</label>
//           <input
//             type="text"
//             value={form.direccion}
//             onChange={(e) => setForm({ ...form, direccion: e.target.value })}
//             placeholder="Calle, número, piso, puerta..."
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
//             required
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">Ciudad</label>
//             <input
//               type="text"
//               value={form.ciudad}
//               onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
//               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2">Código postal</label>
//             <input
//               type="text"
//               value={form.cp}
//               onChange={(e) => setForm({ ...form, cp: e.target.value })}
//               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
//               required
//             />
//           </div>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primaryHover transition"
//         >
//           Continuar con envío →
//         </button>
//       </form>
//     </div>
//   );
// }



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

export default function DireccionesPage() {
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
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !cliente) {
      router.push("/auth");
    }
  }, [cliente, loading, router]);

  // Leer ?next=/checkout (si viene del proceso de compra)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    setNextUrl(next);
  }, []);

  // Cargar dirección existente si la hay
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

    // 🔄 actualizar el cliente en el contexto
    if (cliente) {
      setCliente({
        ...cliente,
        direccion: form.direccion,
        ciudad: form.ciudad,
        codigoPostal: form.codigoPostal,
        telefono: form.telefono,
      });
    }

    // Redirigir después de un pequeño delay
    setTimeout(() => {
      if (nextUrl) {
        router.push(nextUrl); // por ejemplo /checkout
      } else {
        router.push("/"); // flujo genérico
      }
    }, 800);
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
          {/* Columna izquierda */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#333333] leading-tight">
              Dirección de envío
            </h1>
            <p className="text-sm md:text-base text-[#777777] max-w-md">
              Completa los datos de envío para tus pedidos en El Hogar de tus
              Sueños.
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
          </div>

          {/* Columna derecha: formulario */}
          <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#e4e0d5] p-8">
            <h2 className="text-xl font-semibold text-[#333333] mb-6 text-center tracking-wide uppercase">
              Datos de dirección
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Nombre y Apellidos */}
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={cliente.nombre}
                  readOnly
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={cliente.apellidos}
                  readOnly
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none"
                />
              </div>

              {/* Empresa */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Empresa (opcional)
                </label>
                <input
                  type="text"
                  value={form.empresa}
                  onChange={(e) => handleChange("empresa", e.target.value)}
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  required
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                />
              </div>

              {/* Dirección complementaria */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Dirección complementaria (opcional)
                </label>
                <input
                  type="text"
                  value={form.direccionComplementaria}
                  onChange={(e) =>
                    handleChange("direccionComplementaria", e.target.value)
                  }
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                />
              </div>

              {/* CP y ciudad */}
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={form.codigoPostal}
                  onChange={(e) =>
                    handleChange("codigoPostal", e.target.value)
                  }
                  required
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={form.ciudad}
                  onChange={(e) => handleChange("ciudad", e.target.value)}
                  required
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                />
              </div>

              {/* País y provincia */}
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  País *
                </label>
                <input
                  type="text"
                  value={form.pais}
                  onChange={(e) => handleChange("pais", e.target.value)}
                  required
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Provincia *
                </label>
                <input
                  type="text"
                  value={form.provincia}
                  onChange={(e) =>
                    handleChange("provincia", e.target.value)
                  }
                  required
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                />
              </div>

              {/* Teléfono y NIF */}
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  required
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#777777] mb-1">
                  Número Identificación Fiscal *
                </label>
                <input
                  type="text"
                  value={form.nif}
                  onChange={(e) => handleChange("nif", e.target.value)}
                  required
                  className="w-full p-3 rounded-[8px] border border-[#d3c7b4] bg-fondoCasilla text-[#444444] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                />
              </div>

              {error && (
                <div className="md:col-span-2 text-red-500 text-sm">
                  {error}
                </div>
              )}
              {mensaje && (
                <div className="md:col-span-2 text-green-600 text-sm">
                  {mensaje}
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-[8px] border border-[#d3c7b4] text-[#555555] bg-primaryHover hover:bg-fondoCasilla transition-colors"
                  onClick={() => router.push("/account")}
                >
                  Omitir por ahora
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2 rounded-[8px] bg-primary text-white font-semibold tracking-wide hover:bg-primaryHover disabled:opacity-60 transition-colors"
                >
                  {guardando ? "Guardando..." : "Guardar dirección"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
