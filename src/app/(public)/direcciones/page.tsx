'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClienteAuth } from '@/context/ClienteAuthContext';

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
  const { cliente, token, loading } = useClienteAuth();
  const router = useRouter();
  const [form, setForm] = useState<DireccionForm>({
    empresa: '',
    direccion: '',
    direccionComplementaria: '',
    codigoPostal: '',
    ciudad: '',
    pais: 'España',
    provincia: '',
    telefono: '',
    nif: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!loading && !cliente) {
      router.push('/auth');
    }
  }, [cliente, loading, router]);

  // Cargar dirección existente si la hay
  useEffect(() => {
    const cargarDireccion = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/clientes/direccion', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.ok && data.direccion) {
          setForm(prev => ({
            ...prev,
            empresa: data.direccion.empresa || '',
            direccion: data.direccion.direccion || '',
            direccionComplementaria: data.direccion.direccionComplementaria || '',
            codigoPostal: data.direccion.codigoPostal || '',
            ciudad: data.direccion.ciudad || '',
            pais: data.direccion.pais || 'España',
            provincia: data.direccion.provincia || '',
            telefono: data.direccion.telefono || '',
            nif: data.direccion.nif || '',
          }));
        }
      } catch {
        // opcional: ignorar error silencioso
      }
    };
    cargarDireccion();
  }, [token]);

  const handleChange = (field: keyof DireccionForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const res = await fetch('/api/clientes/direccion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Error al guardar la dirección');
      setMensaje('Dirección guardada correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al guardar la dirección');
    } finally {
      setGuardando(false);
    }
  };

  if (loading || !cliente) {
    return <div className="min-h-screen bg-[#f7f6f0] flex items-center justify-center">Cargando...</div>;
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
            Completa los datos de envío para tus pedidos en El Hogar de tus Sueños.
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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre y Apellidos (solo lectura, ya cumplimentados) */}
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
                onChange={(e) => handleChange('empresa', e.target.value)}
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
                onChange={(e) => handleChange('direccion', e.target.value)}
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
                onChange={(e) => handleChange('direccionComplementaria', e.target.value)}
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
                onChange={(e) => handleChange('codigoPostal', e.target.value)}
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
                onChange={(e) => handleChange('ciudad', e.target.value)}
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
                onChange={(e) => handleChange('pais', e.target.value)}
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
                onChange={(e) => handleChange('provincia', e.target.value)}
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
                onChange={(e) => handleChange('telefono', e.target.value)}
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
                onChange={(e) => handleChange('nif', e.target.value)}
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
                onClick={() => router.push('/productos')}
              >
                Omitir por ahora
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-6 py-2 rounded-[8px] bg-primary text-white font-semibold tracking-wide hover:bg-primaryHover disabled:opacity-60 transition-colors"
              >
                {guardando ? 'Guardando...' : 'Guardar dirección'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
);

}


// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useClienteAuth } from '@/context/ClienteAuthContext';

// interface DireccionForm {
//   empresa: string;
//   direccion: string;
//   direccionComplementaria: string;
//   codigoPostal: string;
//   ciudad: string;
//   pais: string;
//   provincia: string;
//   telefono: string;
//   nif: string;
// }

// export default function DireccionesPage() {
//   const { cliente, token, loading } = useClienteAuth();
//   const router = useRouter();
//   const [form, setForm] = useState<DireccionForm>({
//     empresa: '',
//     direccion: '',
//     direccionComplementaria: '',
//     codigoPostal: '',
//     ciudad: '',
//     pais: 'España',
//     provincia: '',
//     telefono: '',
//     nif: '',
//   });
//   const [guardando, setGuardando] = useState(false);
//   const [error, setError] = useState('');
//   const [mensaje, setMensaje] = useState('');

//   useEffect(() => {
//     if (!loading && !cliente) {
//       router.push('/auth');
//     }
//   }, [cliente, loading, router]);

//   useEffect(() => {
//     const cargarDireccion = async () => {
//       if (!token) return;
//       try {
//         const res = await fetch('/api/clientes/direccion', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const data = await res.json();
//         if (data.ok && data.direccion) {
//           setForm(prev => ({
//             ...prev,
//             empresa: data.direccion.empresa || '',
//             direccion: data.direccion.direccion || '',
//             direccionComplementaria: data.direccion.direccionComplementaria || '',
//             codigoPostal: data.direccion.codigoPostal || '',
//             ciudad: data.direccion.ciudad || '',
//             pais: data.direccion.pais || 'España',
//             provincia: data.direccion.provincia || '',
//             telefono: data.direccion.telefono || '',
//             nif: data.direccion.nif || '',
//           }));
//         }
//       } catch (err) {
//         // opcional: manejar error silencioso
//       }
//     };
//     cargarDireccion();
//   }, [token]);

//   const handleChange = (field: keyof DireccionForm, value: string) => {
//     setForm(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!token) return;
//     setGuardando(true);
//     setError('');
//     setMensaje('');

//     try {
//       const res = await fetch('/api/clientes/direccion', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (!data.ok) throw new Error(data.error);
//       setMensaje('Dirección guardada correctamente');
//     } catch (err: any) {
//       setError(err.message || 'Error al guardar la dirección');
//     } finally {
//       setGuardando(false);
//     }
//   };

//   if (loading || !cliente) return <div className="p-8 text-white">Cargando...</div>;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex justify-center p-4">
//       <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
//         <h1 className="text-3xl font-bold text-white mb-6">
//           Dirección de envío de {cliente.nombre} {cliente.apellidos}
//         </h1>

//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="md:col-span-2">
//             <label className="block text-sm text-white mb-1">Empresa (opcional)</label>
//             <input
//               type="text"
//               value={form.empresa}
//               onChange={(e) => handleChange('empresa', e.target.value)}
//               className="w-full p-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-[#DDC9A3] focus:outline-none"
//             />
//           </div>

//           <div className="md:col-span-2">
//             <label className="block text-sm text-white mb-1">Dirección *</label>
//             <input
//               type="text"
//               value={form.direccion}
//               onChange={(e) => handleChange('direccion', e.target.value)}
//               required
//               className="w-full p-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-[#DDC9A3] focus:outline-none"
//             />
//           </div>

//           <div className="md:col-span-2">
//             <label className="block text-sm text-white mb-1">Dirección complementaria (opcional)</label>
//             <input
//               type="text"
//               value={form.direccionComplementaria}
//               onChange={(e) => handleChange('direccionComplementaria', e.target.value)}
//               className="w-full p-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-[#DDC9A3] focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-white mb-1">Código Postal *</label>
//             <input
//               type="text"
//               value={form.codigoPostal}
//               onChange={(e) => handleChange('codigoPostal', e.target.value)}
//               required
//               className="w-full p-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-[#DDC9A3] focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-white mb-1">Ciudad *</label>
//             <input
//               type="text"
//               value={form.ciudad}
//               onChange={(e) => handleChange('ciudad', e.target.value)}
//               required
//               className="w-full p-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-[#DDC9A3] focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-white mb-1">País *</label>
//             <input
//               type="text"
//               value={form.pais}
//               onChange={(e) => handleChange('pais', e.target.value)}
//               required
//               className="w-full p-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-[#DDC9A3] focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-white mb-1">Provincia *</label>
//             <input
//               type="text"
//               value={form.provincia}
//               onChange={(e) => handleChange('provincia', e.target.value)}
//               required
//               className="w-full p-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-[#DDC9A3] focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-white mb-1">Teléfono *</label>
//             <input
//               type="tel"
//               value={form.telefono}
//               onChange={(e) => handleChange('telefono', e.target.value)}
//               required
//               className="w-full p-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-[#DDC9A3] focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-white mb-1">Número Identificación Fiscal *</label>
//             <input
//               type="text"
//               value={form.nif}
//               onChange={(e) => handleChange('nif', e.target.value)}
//               required
//               className="w-full p-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-[#DDC9A3] focus:outline-none"
//             />
//           </div>

//           {error && (
//             <div className="md:col-span-2 text-red-400 text-sm">
//               {error}
//             </div>
//           )}
//           {mensaje && (
//             <div className="md:col-span-2 text-green-400 text-sm">
//               {mensaje}
//             </div>
//           )}

//           <div className="md:col-span-2 flex justify-end gap-4 mt-4">
//             <button
//               type="button"
//               className="px-4 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10"
//               onClick={() => router.push('/tienda')}
//             >
//               Omitir por ahora
//             </button>
//             <button
//               type="submit"
//               disabled={guardando}
//               className="px-6 py-2 rounded-xl bg-[#DDC9A3] text-black font-semibold hover:bg-[#d4b588] disabled:opacity-50"
//             >
//               {guardando ? 'Guardando...' : 'Guardar dirección'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
