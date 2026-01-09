'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClienteAuth } from '@/context/ClienteAuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function AuthPage() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarPassword2, setMostrarPassword2] = useState(false);

  const { login } = useClienteAuth();
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      let data;

      if (esRegistro) {
        // 🟢 REGISTRO (CORREGIDO)
        // Cambiamos la URL a la ruta de registro y el método a POST
        res = await fetch('/api/auth/register', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Error en registro');
      } else {
        // 🔵 LOGIN
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Error en autenticación');
      }

      // ✅ Guarda en contexto + localStorage (cliente completo + token)
      login(data.cliente, data.token);

      // 🔄 Redirección única y segura
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect');
      router.push(redirectTo && !redirectTo.includes('/productos') ? redirectTo : '/account');
    } catch (err: any) {
      console.error('❌ handleSubmit error:', err);
      setError(err.message || 'Error en autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fondo flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 items-center">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#333333] leading-tight">
              Inicia sesión en<br />El Hogar de tus Sueños
            </h1>
            <p className="text-sm md:text-base text-[#777777] max-w-md">
              Guarda tus direcciones, consulta tus pedidos y compra más rápido en cada visita.
            </p>
          </div>

          {/* Columna derecha: tarjeta */}
          <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#e4e0d5] p-8">
            <h2 className="text-xl font-semibold text-[#333333] mb-6 text-center tracking-wide uppercase">
              {esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {esRegistro && (
                <>
                  <input
                    type="text"
                    placeholder="Nombre *"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    className="w-full p-3 rounded-[8px] border border-primary bg-fondoCasilla text-[#205f78] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Apellidos *"
                    value={formData.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    className="w-full p-3 rounded-[8px] border border-primary bg-fondoCasilla text-[#205f78] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                    required
                  />
                </>
              )}

              <input
                type="email"
                placeholder="Correo electrónico *"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full p-3 rounded-[8px] border border-primary bg-fondoCasilla text-[#205f78] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                required
              />

              {/* Contraseña con ojo */}
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="Contraseña *"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full p-3 pr-11 rounded-[8px] border border-primary bg-fondoCasilla text-[#205f78] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-[#b3a899] hover:text-[#8f7f6b]"
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>

              {/* Repetir contraseña solo en registro */}
              {esRegistro && (
                <div className="relative">
                  <input
                    type={mostrarPassword2 ? 'text' : 'password'}
                    placeholder="Repite la contraseña *"
                    value={formData.password2}
                    onChange={(e) => handleChange('password2', e.target.value)}
                    className="w-full p-3 pr-11 rounded-[8px] border border-primary bg-fondoCasilla text-[#205f78] placeholder-[#b3a899] focus:outline-none focus:border-[#d9b98a]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword2(!mostrarPassword2)}
                    className="absolute inset-y-0 right-3 flex items-center text-[#b3a899] hover:text-[#8f7f6b]"
                    aria-label={mostrarPassword2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {mostrarPassword2 ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {error && <p className="text-red-500 text-sm text-center mt-1">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-[8px] bg-primary text-[#3d3d3d] font-semibold tracking-wide hover:bg-primaryHover transition-colors disabled:opacity-60"
              >
                {loading ? 'Cargando...' : esRegistro ? 'Crear cuenta' : 'Entrar'}
              </button>
            </form>

            <button
              onClick={() => setEsRegistro(!esRegistro)}
              className="w-full mt-4 text-l text-[#7f7f7f] hover:text-[#333333] transition-colors text-center"
            >
              {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crear cuenta'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
