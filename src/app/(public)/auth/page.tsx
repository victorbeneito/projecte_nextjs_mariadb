'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClienteAuth } from '@/context/ClienteAuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function AuthPage() {
  const [esRegistro, setEsRegistro] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    password2: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // Feedback de éxito

  // Visibilidad de contraseñas
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarPassword2, setMostrarPassword2] = useState(false);

  const { login } = useClienteAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Limpiar formulario al cambiar entre Login y Registro
  useEffect(() => {
    setFormData({
      nombre: '',
      apellidos: '',
      email: '',
      password: '',
      password2: '',
    });
    setError('');
    setSuccessMessage('');
  }, [esRegistro]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error si el usuario empieza a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // 1. Validaciones previas (solo para registro)
      if (esRegistro) {
        if (formData.password !== formData.password2) {
          throw new Error('Las contraseñas no coinciden.');
        }
        if (formData.password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
      }

      let res;
      let data;

      // 2. Llamada a la API
      if (esRegistro) {
        // 🟢 REGISTRO
        res = await fetch('/api/auth/register', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            email: formData.email,
            password: formData.password
          }),
        });
      } else {
        // 🔵 LOGIN
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email, 
            password: formData.password 
          }),
        });
      }

      data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || data.message || 'Ocurrió un error inesperado');
      }

      // 3. Éxito: Guardar sesión
      login(data.cliente, data.token);
      setSuccessMessage('¡Éxito! Redirigiendo...');

      // 4. Redirección inteligente
      // Buscamos si había una URL de retorno (ej: checkout)
      const redirectUrl = searchParams.get('redirect');
      
      // Pequeño timeout para que se procese el contexto antes de navegar
      setTimeout(() => {
        if (redirectUrl && redirectUrl.startsWith('/')) {
          router.push(redirectUrl);
        } else {
          router.push('/account'); // Dashboard por defecto
        }
      }, 500);

    } catch (err: any) {
      console.error('❌ Error en autenticación:', err);
      setError(err.message || 'Error de conexión con el servidor');
      setLoading(false); // Solo quitamos loading si hay error
    }
  };

  return (
    <div className="min-h-screen bg-fondo flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 items-center">
          
          {/* Columna izquierda: Texto de bienvenida */}
          <div className="space-y-4 hidden md:block">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#333333] leading-tight">
              {esRegistro ? 'Únete a' : 'Inicia sesión en'}<br />El Hogar de tus Sueños
            </h1>
            <p className="text-sm md:text-base text-[#777777] max-w-md">
              Guarda tus direcciones, consulta tus pedidos y compra más rápido en cada visita.
            </p>
          </div>

          {/* Columna derecha: Formulario */}
          <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#e4e0d5] p-8 w-full max-w-md mx-auto">
            <div className="md:hidden mb-6 text-center">
               <h1 className="text-2xl font-bold text-[#333333]">El Hogar de tus Sueños</h1>
            </div>

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

              {/* Contraseña */}
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

              {/* Repetir contraseña (Solo Registro) */}
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

              {/* Mensajes de error y éxito */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm text-center">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded text-sm text-center animate-pulse">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!successMessage}
                className="w-full mt-2 py-3 rounded-[8px] bg-primary text-[#3d3d3d] font-semibold tracking-wide hover:bg-primaryHover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : esRegistro ? 'Crear cuenta' : 'Entrar'}
              </button>
            </form>

            <button
              onClick={() => setEsRegistro(!esRegistro)}
              disabled={loading}
              className="w-full mt-6 text-sm text-[#7f7f7f] hover:text-[#333333] transition-colors text-center underline decoration-dotted underline-offset-4"
            >
              {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}