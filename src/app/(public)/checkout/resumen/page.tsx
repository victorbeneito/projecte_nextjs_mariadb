"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCart, CartItem } from "@/lib/cartService";

export default function ResumenPage() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [costeEnvio, setCosteEnvio] = useState<number>(0); 
  const [totalFinal, setTotalFinal] = useState("0.00");

  // Estados para Cupones
  const [cupon, setCupon] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState<{tipo: 'exito'|'error', texto: string} | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);

  // 1. CARGA INICIAL DE DATOS
  useEffect(() => {
    // Cargar carrito desde el servicio
    const items = getCart();
    
    // Si está vacío, devolver a la tienda
    if (items.length === 0) {
      router.push("/carrito");
      return;
    }
    setCart(items);

    // Calcular Subtotal
    const sub = items.reduce(
      (acc, item) => acc + (item.precioFinal ?? item.precio) * item.cantidad,
      0
    );
    setSubtotal(sub);

    // Cargar coste de envío (desde localStorage)
    let envio = 0;
    if (typeof window !== "undefined") {
      const envioData = localStorage.getItem("checkout_envio");
      if (envioData) {
        const data = JSON.parse(envioData);
        envio = data.coste || 0;
      }
    }
    setCosteEnvio(envio);

  }, [router]);

  // 2. RECALCULAR TOTAL (Cada vez que cambia algo)
  useEffect(() => {
    // Calculamos: Subtotal + Envío - Descuento
    const calculo = subtotal + costeEnvio - descuento;
    // Evitamos números negativos
    setTotalFinal(Math.max(0, calculo).toFixed(2));
  }, [subtotal, costeEnvio, descuento]);

  // 3. LÓGICA DE CUPÓN (CONECTADA A TU API REAL)
  const aplicarCupon = async () => {
    setMensajeCupon(null);
    const codigo = cupon.trim().toUpperCase();

    if (!codigo) return;

    setValidandoCupon(true);

    try {
      // 1. Recuperamos el token si el usuario está logueado (para validar límite por usuario)
      // Si usas un Context, sácalo de ahí. Si no, intenta leerlo de localStorage o Cookies.
      // Aquí asumo localStorage como ejemplo rápido, ajusta si usas Cookies.
      const token = typeof window !== 'undefined' ? localStorage.getItem('token_cliente') : ''; 

      // 2. Llamamos a TU API existente
      const res = await fetch('/api/cupones/validate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Enviamos el token para que tu API valide si el usuario ya lo gastó
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        },
        body: JSON.stringify({ codigo, subtotal }), 
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        // ✅ ÉXITO: Tu API devuelve "descuentoCalculado"
        setDescuento(Number(data.descuentoCalculado)); 
        setMensajeCupon({ 
          tipo: 'exito', 
          texto: data.descripcion || `¡Cupón aplicado! Ahorras ${Number(data.descuentoCalculado).toFixed(2)}€` 
        });
      } else {
        // ❌ ERROR: Tu API devuelve "error" y "valid: false"
        setDescuento(0);
        setMensajeCupon({ 
          tipo: 'error', 
          texto: data.error || "El cupón no es válido o ha caducado." 
        });
      }
    } catch (error) {
      console.error(error);
      setDescuento(0);
      setMensajeCupon({ 
        tipo: 'error', 
        texto: "Error de conexión al verificar el cupón." 
      });
    } finally {
      setValidandoCupon(false);
    }
  };

  return (
    <div className="min-h-screen bg-fondo flex flex-col font-sans">
      <main className="flex-1 px-4 py-12 flex justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* --- COLUMNA IZQUIERDA: LISTA DE PRODUCTOS --- */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 mb-4">
               <h1 className="text-3xl md:text-4xl font-extrabold text-[#333]">
                Resumen del pedido
              </h1>
              <span className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full font-bold">
                 {cart.length} artículos
              </span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-[#e4e0d5] overflow-hidden">
              {/* Cabecera Tabla */}
              <div className="hidden md:grid grid-cols-12 bg-gray-50 p-5 text-sm font-bold text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-center">Precio</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Listado de artículos */}
              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Imagen y Nombre */}
                    <div className="md:col-span-6 flex gap-6 items-center">
                      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                         {item.imagen ? (
                            <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">No img</div>
                         )}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#333] text-lg">{item.nombre}</h3>
                        {/* Usamos 'as any' para evitar error de TypeScript si atributo no está definido */}
                        <p className="text-sm text-gray-500 mt-1">{(item as any).atributo || 'Estándar'}</p>
                      </div>
                    </div>

                    {/* Precio Unitario */}
                    <div className="hidden md:block md:col-span-2 text-center text-base text-gray-700 font-medium">
                      {(item.precioFinal ?? item.precio).toFixed(2)} €
                    </div>

                    {/* Cantidad */}
                    <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                       <span className="md:hidden text-sm font-bold text-gray-500">Cant:</span>
                       <span className="text-base font-medium bg-gray-100 px-4 py-1.5 rounded-full text-gray-800 border border-gray-200">
                         x{item.cantidad}
                       </span>
                    </div>

                    {/* Subtotal Item */}
                    <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                       <span className="md:hidden text-sm font-bold text-gray-500">Total:</span>
                       <span className="font-bold text-[#333] text-lg">
                         {((item.precioFinal ?? item.precio) * item.cantidad).toFixed(2)} €
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Datos de envío y facturación */}
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white p-8 rounded-xl border border-[#e4e0d5] shadow-sm">
                  <h3 className="font-bold text-[#333] mb-3 text-base uppercase tracking-wide">Dirección de Envío</h3>
                  <p className="text-base text-gray-600 leading-relaxed mb-4">
                     Los datos introducidos en el paso anterior.
                  </p>
                  <Link href="/checkout/direcciones" className="text-sm text-primary font-bold hover:underline">
                     Editar dirección
                  </Link>
               </div>
               <div className="bg-white p-8 rounded-xl border border-[#e4e0d5] shadow-sm">
                  <h3 className="font-bold text-[#333] mb-3 text-base uppercase tracking-wide">Método de Envío</h3>
                  <p className="text-base text-gray-600 mb-4">
                     {(typeof costeEnvio === 'number' && costeEnvio > 0) ? "Envío Estándar" : "Envío Gratis"}
                  </p>
                  <Link href="/checkout/envio" className="text-sm text-primary font-bold hover:underline">
                     Cambiar envío
                  </Link>
               </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: TOTALES, CUPÓN Y BOTÓN --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#e4e0d5] p-8 sticky top-8">
              <h2 className="text-xl font-bold text-[#333] mb-6 border-b pb-4">
                Resumen de importes
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-base text-gray-600">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-base text-gray-600">
                  <span>Envío</span>
                  <span>{(typeof costeEnvio === 'number' && costeEnvio > 0) ? `${costeEnvio.toFixed(2)} €` : "Gratis"}</span>
                </div>

                {/* Mostrar Descuento si existe */}
                {descuento > 0 && (
                  <div className="flex justify-between text-base text-green-600 font-medium bg-green-50 p-2 rounded border border-green-100">
                    <span>Descuento aplicado</span>
                    <span>-{descuento.toFixed(2)} €</span>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between items-end mt-4">
                  <span className="font-bold text-xl text-[#333]">Total</span>
                  <div className="text-right">
                     <span className="block font-extrabold text-3xl text-primary">
                       {totalFinal} €
                     </span>
                     <span className="text-xs text-gray-400 font-medium">IVA incluido</span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE CUPÓN PROMOCIONAL (REAL) */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">¿Tienes un código promocional?</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={cupon}
                    onChange={(e) => setCupon(e.target.value)}
                    placeholder="Código cupón"
                    className="flex-1 p-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary uppercase"
                  />
                  <button 
                    onClick={aplicarCupon}
                    disabled={validandoCupon}
                    className={`bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-700 transition ${validandoCupon ? 'opacity-50' : ''}`}
                  >
                    {validandoCupon ? '...' : 'Aplicar'}
                  </button>
                </div>
                {mensajeCupon && (
                  <p className={`text-xs mt-2 font-medium ${mensajeCupon.tipo === 'exito' ? 'text-green-600' : 'text-red-500'}`}>
                    {mensajeCupon.texto}
                  </p>
                )}
              </div>

              {/* Botón Acción */}
              <button
                onClick={() => router.push("/checkout/pago")}
                className="w-full py-5 rounded-lg bg-primary text-white font-bold text-xl shadow-lg shadow-yellow-500/30 hover:bg-primaryHover hover:scale-[1.02] transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                Elegir método de pago &rarr;
              </button>

              <div className="mt-6 text-center">
                 <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Pago 100% Seguro</p>
                 <div className="flex justify-center gap-3 opacity-60 grayscale">
                    <span className="border px-2 py-1 rounded text-[10px] font-bold">VISA</span>
                    <span className="border px-2 py-1 rounded text-[10px] font-bold">Mastercard</span>
                    <span className="border px-2 py-1 rounded text-[10px] font-bold">PayPal</span>
                    <span className="border px-2 py-1 rounded text-[10px] font-bold">Bizum</span>
                 </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
               <Link 
                 href="/checkout/envio"
                 className="text-base text-gray-500 hover:text-[#333] underline decoration-gray-300 underline-offset-4"
               >
                 &larr; Volver al envío
               </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}