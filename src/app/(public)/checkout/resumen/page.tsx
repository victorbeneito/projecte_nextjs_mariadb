"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, CartItem } from "@/lib/cartService";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ResumenPage() {
  const router = useRouter();
  const { cliente, loading, token } = useClienteAuth();
  
  // Estados
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingData, setShippingData] = useState<{ metodo: string, coste: number } | null>(null);
  
  // Cupón
  const [codigo, setCodigo] = useState("");
  const [descuento, setDescuento] = useState(0);

  // 1. Cargar Datos
  useEffect(() => {
    if (!loading) {
      if (!cliente) {
        router.push("/auth?redirect=/checkout/resumen");
        return;
      }

      // Cargar Carrito
      const items = getCart();
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

      // Cargar Envío
      const envioGuardado = localStorage.getItem("checkout_envio");
      if (envioGuardado) {
        setShippingData(JSON.parse(envioGuardado));
      } else {
        // Si no hay envío seleccionado, volver atrás
        router.push("/checkout/envio");
      }
    }
  }, [cliente, loading, router]);

  // 2. Lógica de Cupón
  const aplicarCupon = async () => {
    if (!codigo.trim()) return;
    try {
      // Usamos tu endpoint de validación
      const res = await fetch("/api/cupones/validate", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }) 
        },
        body: JSON.stringify({ codigo, subtotal }),
      });
      const data = await res.json();

      if (data.valid) {
        setDescuento(Number(data.descuentoCalculado));
        toast.success(`Cupón aplicado: -${Number(data.descuentoCalculado).toFixed(2)}€`);
      } else {
        setDescuento(0);
        toast.error(data.error || "Cupón no válido");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al verificar el cupón");
    }
  };

  // Cálculos Finales
  const costeEnvio = shippingData?.coste || 0;
  const totalFinal = Math.max(0, subtotal + costeEnvio - descuento);

  // --- BLOQUEOS DE SEGURIDAD ---

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-fondo dark:bg-darkBg transition-colors">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // 🛑 CORRECCIÓN AQUÍ: Si no hay cliente (mientras redirige), no renderizamos nada más
  if (!cliente) return null; 

  return (
    <div className="min-h-screen bg-fondo dark:bg-darkBg flex flex-col transition-colors duration-300">
      <main className="flex-1 flex justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-6xl">
            
            {/* Cabecera */}
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Resumen del Pedido 📋
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Revisa tus artículos antes de pagar.</p>
                
                {/* Breadcrumbs */}
                <div className="hidden md:flex justify-center mt-6 gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span className="text-green-500 cursor-pointer hover:underline" onClick={() => router.push('/checkout/direcciones')}>1. Dirección</span> 
                    <span className="text-gray-300 dark:text-gray-600">&rarr;</span> 
                    <span className="text-green-500 cursor-pointer hover:underline" onClick={() => router.push('/checkout/envio')}>2. Envío</span> 
                    <span className="text-gray-300 dark:text-gray-600">&rarr;</span> 
                    <span className="text-primary border-b-2 border-primary pb-1">3. Resumen</span>
                    <span className="text-gray-300 dark:text-gray-600">&rarr;</span> 
                    <span>4. Pago</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                
                {/* --- COLUMNA IZQUIERDA: LISTA DE PRODUCTOS --- */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Tarjeta de Lista */}
                    <div className="bg-white dark:bg-darkNavBg rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 dark:text-white">Artículos ({cart.length})</h2>
                            <Link href="/carrito" className="text-sm text-primary hover:underline">Editar Carrito</Link>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {cart.map((item) => (
                                <div key={item.id} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                                    {/* Imagen */}
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600">
                                        {item.imagen ? (
                                            <img 
                                                src={item.imagen} 
                                                alt={item.nombre} 
                                                className="w-full h-full object-contain" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin img</div>
                                        )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1 line-clamp-2">
                                            {item.nombre}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            {(item as any).atributo || 'Estándar'}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                                                x{item.cantidad}
                                            </span>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {((item.precioFinal ?? item.precio) * item.cantidad).toFixed(2)} €
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Datos de Envío Seleccionado */}
                    <div className="bg-white dark:bg-darkNavBg rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Método de Envío</h3>
                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {shippingData?.metodo === 'tienda' ? '🏬 Recogida en Tienda' : '🚚 Envío Express (Ontime)'}
                            </p>
                        </div>
                        <Link href="/checkout/envio" className="text-sm font-bold text-primary hover:text-primaryHover underline">
                            Cambiar
                        </Link>
                    </div>

                    {/* Datos de Dirección Resumidos */}
                    <div className="bg-white dark:bg-darkNavBg rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Dirección de Entrega</h3>
                            <p className="text-gray-900 dark:text-white text-sm">
                                {cliente.direccion}, {cliente.ciudad} ({cliente.codigoPostal})
                            </p>
                        </div>
                        <Link href="/checkout/direcciones" className="text-sm font-bold text-primary hover:text-primaryHover underline">
                            Editar
                        </Link>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: TOTALES (Sticky) --- */}
                <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
                    <div className="bg-white dark:bg-darkNavBg p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b dark:border-gray-700 pb-4">
                            Importes
                        </h2>

                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                <span>Subtotal</span>
                                <span>{subtotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                <span>Envío</span>
                                <span>{costeEnvio === 0 ? "Gratis" : `${costeEnvio.toFixed(2)} €`}</span>
                            </div>
                            {descuento > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                                    <span>Descuento aplicado</span>
                                    <span>- {descuento.toFixed(2)} €</span>
                                </div>
                            )}
                        </div>

                        {/* Input Cupón */}
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                                Código Promocional
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="CÓDIGO"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    className="flex-1 min-w-0 bg-white dark:bg-darkBg border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm outline-none focus:border-primary uppercase text-gray-900 dark:text-white"
                                />
                                <button 
                                    onClick={aplicarCupon}
                                    className="bg-gray-800 dark:bg-gray-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-black dark:hover:bg-gray-500 transition"
                                >
                                    APLICAR
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-gray-800 dark:text-white">Total</span>
                            <div className="text-right">
                                <span className="block text-3xl font-extrabold text-primary">
                                    {totalFinal.toFixed(2)} €
                                </span>
                                <span className="text-xs text-gray-400 font-medium">IVA incluido</span>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push("/checkout/pago")}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primaryHover transition-all shadow-lg shadow-yellow-500/20 hover:shadow-xl transform hover:-translate-y-0.5 flex justify-center items-center gap-2"
                        >
                            Ir a Pagar &rarr;
                        </button>
                    </div>

                    {/* Sellos de Seguridad */}
                    <div className="flex justify-center gap-4 opacity-50 grayscale">
                         <div className="text-[10px] border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-gray-500 dark:text-gray-400 font-bold">SSL SECURE</div>
                         <div className="text-[10px] border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-gray-500 dark:text-gray-400 font-bold">VISA</div>
                         <div className="text-[10px] border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-gray-500 dark:text-gray-400 font-bold">MASTERCARD</div>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { getCart, CartItem } from "@/lib/cartService";

// export default function ResumenPage() {
//   const router = useRouter();
  
//   // --- ESTADOS ---
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [subtotal, setSubtotal] = useState(0);
//   const [costeEnvio, setCosteEnvio] = useState<number>(0); 
//   const [totalFinal, setTotalFinal] = useState("0.00");

//   // Estados para Cupones
//   const [cupon, setCupon] = useState("");
//   const [descuento, setDescuento] = useState(0);
//   const [mensajeCupon, setMensajeCupon] = useState<{tipo: 'exito'|'error', texto: string} | null>(null);
//   const [validandoCupon, setValidandoCupon] = useState(false);

//   // 1. CARGA INICIAL DE DATOS
//   useEffect(() => {
//     // Cargar carrito desde el servicio
//     const items = getCart();
    
//     // Si está vacío, devolver a la tienda
//     if (items.length === 0) {
//       router.push("/carrito");
//       return;
//     }
//     setCart(items);

//     // Calcular Subtotal
//     const sub = items.reduce(
//       (acc, item) => acc + (item.precioFinal ?? item.precio) * item.cantidad,
//       0
//     );
//     setSubtotal(sub);

//     // Cargar coste de envío (desde localStorage)
//     let envio = 0;
//     if (typeof window !== "undefined") {
//       const envioData = localStorage.getItem("checkout_envio");
//       if (envioData) {
//         const data = JSON.parse(envioData);
//         envio = data.coste || 0;
//       }
//     }
//     setCosteEnvio(envio);

//   }, [router]);

//   // 2. RECALCULAR TOTAL (Cada vez que cambia algo)
//   useEffect(() => {
//     // Calculamos: Subtotal + Envío - Descuento
//     const calculo = subtotal + costeEnvio - descuento;
//     // Evitamos números negativos
//     setTotalFinal(Math.max(0, calculo).toFixed(2));
//   }, [subtotal, costeEnvio, descuento]);

//   // 3. LÓGICA DE CUPÓN (CONECTADA A TU API REAL)
//   const aplicarCupon = async () => {
//     setMensajeCupon(null);
//     const codigo = cupon.trim().toUpperCase();

//     if (!codigo) return;

//     setValidandoCupon(true);

//     try {
//       // 1. Recuperamos el token si el usuario está logueado (para validar límite por usuario)
//       // Si usas un Context, sácalo de ahí. Si no, intenta leerlo de localStorage o Cookies.
//       // Aquí asumo localStorage como ejemplo rápido, ajusta si usas Cookies.
//       const token = typeof window !== 'undefined' ? localStorage.getItem('token_cliente') : ''; 

//       // 2. Llamamos a TU API existente
//       const res = await fetch('/api/cupones/validate', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           // Enviamos el token para que tu API valide si el usuario ya lo gastó
//           ...(token && { 'Authorization': `Bearer ${token}` }) 
//         },
//         body: JSON.stringify({ codigo, subtotal }), 
//       });

//       const data = await res.json();

//       if (res.ok && data.valid) {
//         // ✅ ÉXITO: Tu API devuelve "descuentoCalculado"
//         setDescuento(Number(data.descuentoCalculado)); 
//         setMensajeCupon({ 
//           tipo: 'exito', 
//           texto: data.descripcion || `¡Cupón aplicado! Ahorras ${Number(data.descuentoCalculado).toFixed(2)}€` 
//         });
//       } else {
//         // ❌ ERROR: Tu API devuelve "error" y "valid: false"
//         setDescuento(0);
//         setMensajeCupon({ 
//           tipo: 'error', 
//           texto: data.error || "El cupón no es válido o ha caducado." 
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       setDescuento(0);
//       setMensajeCupon({ 
//         tipo: 'error', 
//         texto: "Error de conexión al verificar el cupón." 
//       });
//     } finally {
//       setValidandoCupon(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-fondo flex flex-col font-sans">
//       <main className="flex-1 px-4 py-12 flex justify-center">
//         <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
//           {/* --- COLUMNA IZQUIERDA: LISTA DE PRODUCTOS --- */}
//           <div className="lg:col-span-2 space-y-8">
//             <div className="flex items-center gap-4 mb-4">
//                <h1 className="text-3xl md:text-4xl font-extrabold text-[#333]">
//                 Resumen del pedido
//               </h1>
//               <span className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full font-bold">
//                  {cart.length} artículos
//               </span>
//             </div>
            
//             <div className="bg-white rounded-xl shadow-sm border border-[#e4e0d5] overflow-hidden">
//               {/* Cabecera Tabla */}
//               <div className="hidden md:grid grid-cols-12 bg-gray-50 p-5 text-sm font-bold text-gray-600 uppercase tracking-wider border-b border-gray-100">
//                 <div className="col-span-6">Producto</div>
//                 <div className="col-span-2 text-center">Precio</div>
//                 <div className="col-span-2 text-center">Cantidad</div>
//                 <div className="col-span-2 text-right">Total</div>
//               </div>

//               {/* Listado de artículos */}
//               <div className="divide-y divide-gray-100">
//                 {cart.map((item) => (
//                   <div key={item.id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
//                     {/* Imagen y Nombre */}
//                     <div className="md:col-span-6 flex gap-6 items-center">
//                       <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shadow-sm">
//                          {item.imagen ? (
//                             <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
//                          ) : (
//                             <div className="w-full h-full flex items-center justify-center text-gray-300">No img</div>
//                          )}
//                       </div>
//                       <div>
//                         <h3 className="font-bold text-[#333] text-lg">{item.nombre}</h3>
//                         {/* Usamos 'as any' para evitar error de TypeScript si atributo no está definido */}
//                         <p className="text-sm text-gray-500 mt-1">{(item as any).atributo || 'Estándar'}</p>
//                       </div>
//                     </div>

//                     {/* Precio Unitario */}
//                     <div className="hidden md:block md:col-span-2 text-center text-base text-gray-700 font-medium">
//                       {(item.precioFinal ?? item.precio).toFixed(2)} €
//                     </div>

//                     {/* Cantidad */}
//                     <div className="md:col-span-2 flex justify-between md:justify-center items-center">
//                        <span className="md:hidden text-sm font-bold text-gray-500">Cant:</span>
//                        <span className="text-base font-medium bg-gray-100 px-4 py-1.5 rounded-full text-gray-800 border border-gray-200">
//                          x{item.cantidad}
//                        </span>
//                     </div>

//                     {/* Subtotal Item */}
//                     <div className="md:col-span-2 flex justify-between md:justify-end items-center">
//                        <span className="md:hidden text-sm font-bold text-gray-500">Total:</span>
//                        <span className="font-bold text-[#333] text-lg">
//                          {((item.precioFinal ?? item.precio) * item.cantidad).toFixed(2)} €
//                        </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Datos de envío y facturación */}
//             <div className="grid md:grid-cols-2 gap-6">
//                <div className="bg-white p-8 rounded-xl border border-[#e4e0d5] shadow-sm">
//                   <h3 className="font-bold text-[#333] mb-3 text-base uppercase tracking-wide">Dirección de Envío</h3>
//                   <p className="text-base text-gray-600 leading-relaxed mb-4">
//                      Los datos introducidos en el paso anterior.
//                   </p>
//                   <Link href="/checkout/direcciones" className="text-sm text-primary font-bold hover:underline">
//                      Editar dirección
//                   </Link>
//                </div>
//                <div className="bg-white p-8 rounded-xl border border-[#e4e0d5] shadow-sm">
//                   <h3 className="font-bold text-[#333] mb-3 text-base uppercase tracking-wide">Método de Envío</h3>
//                   <p className="text-base text-gray-600 mb-4">
//                      {(typeof costeEnvio === 'number' && costeEnvio > 0) ? "Envío Estándar" : "Envío Gratis"}
//                   </p>
//                   <Link href="/checkout/envio" className="text-sm text-primary font-bold hover:underline">
//                      Cambiar envío
//                   </Link>
//                </div>
//             </div>
//           </div>

//           {/* --- COLUMNA DERECHA: TOTALES, CUPÓN Y BOTÓN --- */}
//           <div className="lg:col-span-1 space-y-6">
//             <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#e4e0d5] p-8 sticky top-8">
//               <h2 className="text-xl font-bold text-[#333] mb-6 border-b pb-4">
//                 Resumen de importes
//               </h2>

//               <div className="space-y-4 mb-8">
//                 <div className="flex justify-between text-base text-gray-600">
//                   <span>Subtotal</span>
//                   <span>{subtotal.toFixed(2)} €</span>
//                 </div>
//                 <div className="flex justify-between text-base text-gray-600">
//                   <span>Envío</span>
//                   <span>{(typeof costeEnvio === 'number' && costeEnvio > 0) ? `${costeEnvio.toFixed(2)} €` : "Gratis"}</span>
//                 </div>

//                 {/* Mostrar Descuento si existe */}
//                 {descuento > 0 && (
//                   <div className="flex justify-between text-base text-green-600 font-medium bg-green-50 p-2 rounded border border-green-100">
//                     <span>Descuento aplicado</span>
//                     <span>-{descuento.toFixed(2)} €</span>
//                   </div>
//                 )}

//                 <div className="border-t pt-4 flex justify-between items-end mt-4">
//                   <span className="font-bold text-xl text-[#333]">Total</span>
//                   <div className="text-right">
//                      <span className="block font-extrabold text-3xl text-primary">
//                        {totalFinal} €
//                      </span>
//                      <span className="text-xs text-gray-400 font-medium">IVA incluido</span>
//                   </div>
//                 </div>
//               </div>

//               {/* SECCIÓN DE CUPÓN PROMOCIONAL (REAL) */}
//               <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
//                 <label className="block text-sm font-bold text-gray-700 mb-2">¿Tienes un código promocional?</label>
//                 <div className="flex gap-2">
//                   <input 
//                     type="text" 
//                     value={cupon}
//                     onChange={(e) => setCupon(e.target.value)}
//                     placeholder="Código cupón"
//                     className="flex-1 p-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary uppercase"
//                   />
//                   <button 
//                     onClick={aplicarCupon}
//                     disabled={validandoCupon}
//                     className={`bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-700 transition ${validandoCupon ? 'opacity-50' : ''}`}
//                   >
//                     {validandoCupon ? '...' : 'Aplicar'}
//                   </button>
//                 </div>
//                 {mensajeCupon && (
//                   <p className={`text-xs mt-2 font-medium ${mensajeCupon.tipo === 'exito' ? 'text-green-600' : 'text-red-500'}`}>
//                     {mensajeCupon.texto}
//                   </p>
//                 )}
//               </div>

//               {/* Botón Acción */}
//               <button
//                 onClick={() => router.push("/checkout/pago")}
//                 className="w-full py-5 rounded-lg bg-primary text-white font-bold text-xl shadow-lg shadow-yellow-500/30 hover:bg-primaryHover hover:scale-[1.02] transition-all transform active:scale-95 flex items-center justify-center gap-2"
//               >
//                 Elegir método de pago &rarr;
//               </button>

//               <div className="mt-6 text-center">
//                  <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Pago 100% Seguro</p>
//                  <div className="flex justify-center gap-3 opacity-60 grayscale">
//                     <span className="border px-2 py-1 rounded text-[10px] font-bold">VISA</span>
//                     <span className="border px-2 py-1 rounded text-[10px] font-bold">Mastercard</span>
//                     <span className="border px-2 py-1 rounded text-[10px] font-bold">PayPal</span>
//                     <span className="border px-2 py-1 rounded text-[10px] font-bold">Bizum</span>
//                  </div>
//               </div>
//             </div>
            
//             <div className="mt-8 text-center">
//                <Link 
//                  href="/checkout/envio"
//                  className="text-base text-gray-500 hover:text-[#333] underline decoration-gray-300 underline-offset-4"
//                >
//                  &larr; Volver al envío
//                </Link>
//             </div>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// }