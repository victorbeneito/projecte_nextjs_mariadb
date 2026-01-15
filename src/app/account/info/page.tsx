"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import toast from "react-hot-toast";
import CambiarPassword from "@/components/CambiarPassword";
import CambiarEmail from "@/components/CambiarEmail";

// --- COMPONENTE INTERNO DEL FORMULARIO ---
function InfoForm() {
  const { cliente, token, setCliente } = useClienteAuth();
  // Inicializamos con any para evitar problemas de tipado rápido
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtenemos el redirect de la URL
  const rawRedirect = searchParams.get("redirect");
  const redirectTarget = rawRedirect ? decodeURIComponent(rawRedirect) : null;

  // Cargar datos del cliente en el formulario
  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || "",
        apellidos: cliente.apellidos || "",
        empresa: cliente.empresa || "",
        direccion: cliente.direccion || "",
        direccionComplementaria: cliente.direccionComplementaria || "",
        codigoPostal: cliente.codigoPostal || "",
        ciudad: cliente.ciudad || "",
        provincia: cliente.provincia || "",
        pais: cliente.pais || "España",
        nif: cliente.nif || "",
        telefono: cliente.telefono || "",
      });
    }
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Verificación de Token
    if (!token) {
        toast.error("No hay sesión activa");
        return;
    }

    // 2. Verificación de Cliente (ESTO ARREGLA EL ERROR DE VERCEL) 🛡️
    if (!cliente) {
        toast.error("Esperando datos del cliente...");
        return;
    }

    setSaving(true);

    try {
      // Ahora TypeScript ya sabe que 'cliente' no es null aquí
      const res = await fetchWithAuth(`/api/clientes/${cliente.id}`, token, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (res.error) {
        toast.error(res.error);
        setSaving(false);
        return;
      }

      // Actualizamos estado local
      setCliente(res.cliente);
      localStorage.setItem("cliente_datos", JSON.stringify(res.cliente));
      toast.success("Datos guardados correctamente ✅");

      // LOGICA DE REDIRECCIÓN
      if (redirectTarget) {
        console.log("🚀 Redirigiendo a:", redirectTarget);
        // Pequeño delay para UX
        setTimeout(() => {
            router.push(redirectTarget);
            router.refresh(); 
        }, 500);
      } 

    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!cliente) return <div className="p-4 text-center">Cargando datos...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">
        Información personal
        {redirectTarget && <span className="block text-sm font-normal text-blue-600 mt-1">Paso 1 de 2: Confirma tus datos</span>}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mb-10">
        {[
          { name: "nombre", label: "Nombre" },
          { name: "apellidos", label: "Apellidos" },
          { name: "empresa", label: "Empresa" },
          { name: "nif", label: "NIF" },
          { name: "telefono", label: "Teléfono" },
          { name: "direccion", label: "Dirección" },
          { name: "direccionComplementaria", label: "Dirección complementaria" },
          { name: "codigoPostal", label: "Código Postal" },
          { name: "ciudad", label: "Ciudad" },
          { name: "provincia", label: "Provincia" },
          { name: "pais", label: "País" },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
            <input
              type="text"
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 w-full font-semibold transition-colors"
        >
          {saving ? "Guardando..." : (redirectTarget ? "Guardar y Continuar al Pago →" : "Guardar cambios")}
        </button>
      </form>

      <div className="border-t pt-8 space-y-8">
        <CambiarEmail />
        <CambiarPassword />
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL (WRAPPER) ---
const InfoPage = () => {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando formulario...</div>}>
      <InfoForm />
    </Suspense>
  );
};

export default InfoPage;


// "use client";

// import { useClienteAuth } from "@/context/ClienteAuthContext";
// import { useState, useEffect, Suspense } from "react";
// import { fetchWithAuth } from "@/utils/fetchWithAuth";
// import toast from "react-hot-toast";
// import CambiarPassword from "@/components/CambiarPassword";
// import CambiarEmail from "@/components/CambiarEmail";
// import { useRouter, useSearchParams } from "next/navigation";

// // 👇 1. LÓGICA DEL FORMULARIO (Componente interno)
// function InfoForm() {
//   const { cliente, token, setCliente } = useClienteAuth();
//   const [formData, setFormData] = useState<any>({});
//   const [saving, setSaving] = useState(false);
//   const router = useRouter();
  
//   // Leemos el parámetro ?redirect=... de forma segura dentro de Suspense
//   const params = useSearchParams();
//   const redirectAfterSave = params.get("redirect");

//   useEffect(() => {
//     if (cliente) {
//       setFormData({
//         nombre: cliente.nombre || "",
//         apellidos: cliente.apellidos || "",
//         empresa: cliente.empresa || "",
//         direccion: cliente.direccion || "",
//         direccionComplementaria: cliente.direccionComplementaria || "",
//         codigoPostal: cliente.codigoPostal || cliente.codigoPostal || "",
//         ciudad: cliente.ciudad || "",
//         provincia: cliente.provincia || "",
//         pais: cliente.pais || "España",
//         nif: cliente.nif || "",
//         telefono: cliente.telefono || "",
//       });
//     }
//   }, [cliente]);

//   if (!cliente) return <div className="text-gray-500">Cargando datos...</div>;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!token) return;
//     setSaving(true);

//     try {
//       // Enviamos el PUT a la API
//       const res = await fetchWithAuth(`/api/clientes/${cliente.id}`, token, {
//         method: "PUT",
//         body: JSON.stringify(formData),
//       });

//       if (res.error) {
//         toast.error(res.error);
//         setSaving(false);
//         return;
//       }

//       // Actualizamos el contexto y localStorage
//       setCliente(res.cliente);
//       localStorage.setItem("cliente_datos", JSON.stringify(res.cliente));
//       toast.success("Información actualizada correctamente ✅");

//       // 🔄 REDIRECCIÓN AUTOMÁTICA
//       if (redirectAfterSave) {
//         console.log("🔄 Redirigiendo al checkout en 1s...");
//         setTimeout(() => {
//             router.push(redirectAfterSave);
//         }, 1000);
//       }

//     } catch (error) {
//       toast.error("Error al guardar los cambios");
//       console.error(error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-10">
//       <h1 className="text-2xl font-bold mb-6">Información personal</h1>

//       <form onSubmit={handleSubmit} className="space-y-4 max-w-md mb-10">
//         {[
//           { name: "nombre", label: "Nombre" },
//           { name: "apellidos", label: "Apellidos" },
//           { name: "empresa", label: "Empresa" },
//           { name: "nif", label: "NIF" },
//           { name: "telefono", label: "Teléfono" },
//           { name: "direccion", label: "Dirección" },
//           { name: "direccionComplementaria", label: "Dirección complementaria" },
//           { name: "codigoPostal", label: "Código Postal" },
//           { name: "ciudad", label: "Ciudad" },
//           { name: "provincia", label: "Provincia" },
//           { name: "pais", label: "País" },
//         ].map(({ name, label }) => (
//           <div key={name}>
//             <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
//             <input
//               type="text"
//               name={name}
//               value={formData[name] || ""}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             />
//           </div>
//         ))}

//         <button
//           type="submit"
//           disabled={saving}
//           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 w-full md:w-auto"
//         >
//           {saving ? "Guardando..." : "Guardar cambios"}
//         </button>
//       </form>

//       <div className="border-t pt-8 space-y-8">
//         <CambiarEmail />
//         <CambiarPassword />
//       </div>
//     </div>
//   );
// }

// // 👇 2. COMPONENTE PRINCIPAL QUE EXPORTAMOS
// // ⚠️ IMPORTANTE: Esta función NO puede llevar la palabra 'async' delante
// export default function InfoPage() {
//   return (
//     <Suspense fallback={<div className="p-10 text-center">Cargando formulario...</div>}>
//       <InfoForm />
//     </Suspense>
//   );
// }

// "use client";

// import { useClienteAuth } from "@/context/ClienteAuthContext";
// import { useState } from "react";
// import { fetchWithAuth } from "@/utils/fetchWithAuth";
// import toast from "react-hot-toast";
// import CambiarPassword from "@/components/CambiarPassword";
// import CambiarEmail from "@/components/CambiarEmail";
// import { jwtDecode } from "jwt-decode";


// export default function InfoPage() {
//   const { cliente, token, setCliente } = useClienteAuth();
//   const [formData, setFormData] = useState(cliente || {});
//   const [saving, setSaving] = useState(false);

//   if (!cliente) return <p>Cargando datos del cliente...</p>;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!token) return;

//     setSaving(true);
//     try {
//         if (token) {
//   const decoded: any = jwtDecode(token);
//   console.log("decoded.id del token →", decoded.id);
// }
// console.log("cliente.id que se envía →", cliente.id);
//       const res = await fetchWithAuth(`/api/clientes/${cliente.id}`, token, {
//         method: "PUT",
//         body: JSON.stringify(formData),
//       });

//       setCliente(res.cliente);
//       toast.success("Información actualizada correctamente");
//     } catch (error) {
//       toast.error("Error al guardar los cambios");
//       console.error(error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Información personal</h1>

//       {/* ✅ FORMULARIO PRINCIPAL SOLO PARA INFORMACIÓN PERSONAL */}
//       <form onSubmit={handleSubmit} className="space-y-4 max-w-md mb-10">
//         {["nombre", "apellidos", "telefono", "direccion", "ciudad", "cp"].map((field) => (
//           <div key={field}>
//             <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
//             <input
//               type="text"
//               name={field}
//               value={(formData as any)[field] || ""}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded-md p-2"
//             />
//           </div>
//         ))}

//         <button
//           type="submit"
//           disabled={saving}
//           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
//         >
//           {saving ? "Guardando..." : "Guardar cambios"}
//         </button>
//       </form>

//       {/* 📧 CAMBIO DE EMAIL */}
//       <CambiarEmail />

//       {/* 🔐 CAMBIO DE CONTRASEÑA */}
//       <CambiarPassword />
//     </div>
//   );
// }
