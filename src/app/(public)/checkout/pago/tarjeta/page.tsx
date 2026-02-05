"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCart } from "@/lib/cartService";

export default function RedsysPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans text-gray-500">Conectando con pasarela segura...</div>}>
      <RedsysForm />
    </Suspense>
  );
}

function RedsysForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Estados de datos
  const [importe, setImporte] = useState("0.00");
  const [fecha, setFecha] = useState("");
  const orderId = searchParams.get("orderId") || "12345";

  // Estados de la interfaz
  // 'form' = formulario tarjeta | 'loading' = procesando | 'success' = pago ok
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "" });

  // 1. Cargar datos iniciales
  useEffect(() => {
    const now = new Date();
    setFecha(now.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }).replace(",", ""));

    const cart = getCart();
    const subtotal = cart.reduce(
      (acc: number, item: any) => acc + (item.precioFinal ?? item.precio) * item.cantidad,
      0
    );

    let costeEnvio = 0;
    if (typeof window !== "undefined") {
      const envioData = localStorage.getItem("checkout_envio");
      if (envioData) {
        const data = JSON.parse(envioData);
        costeEnvio = data.coste || 0;
      }
    }

    // Aquí deberíamos restar el descuento si lo guardaste en localStorage, 
    // pero para la simulación visual, el total básico sirve.
    const totalFinal = subtotal + costeEnvio;
    setImporte(totalFinal.toFixed(2));
  }, []);

  // 2. Procesar el pago
  const handleFakePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading'); // Pasamos a estado "Cargando"

    // Simulamos espera del banco (2 segundos)
    setTimeout(() => {
      setStep('success'); // Pasamos a pantalla "Pago Correcto"
    }, 2000);
  };

  // 3. Volver a la tienda
  const finalizarCompra = () => {
    // Redirigir a tu página de confirmación final
    router.push(`/checkout/confirmacion?pedido=${orderId}`);
  };

  return (
    // ⚡ TRUCO: z-[9999] y fixed inset-0 hacen que esta capa tape el Header y Footer de tu tienda
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans text-gray-700 overflow-y-auto">
      
      {/* --- CABECERA AMARILLA (Estilo Redsys) --- */}
      <div className="w-full bg-[#f6b919] h-14 flex-shrink-0 shadow-sm flex items-center px-4 md:px-10 justify-between relative z-50">
        <div className="flex items-center gap-2">
           <div className="bg-white/20 p-1 rounded">
             <span className="font-bold text-white text-xl tracking-wider opacity-90">Redsys</span>
           </div>
        </div>
        <div className="text-white/80 text-xs hidden md:block">Pasarela de Pagos Segura</div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        
        {/* --- BARRA LATERAL IZQUIERDA (Simulada) --- */}
        <div className="hidden md:flex w-64 bg-[#333333] text-gray-300 flex-col py-6 text-xs font-semibold h-full">
           <div className="px-6 py-3 border-l-4 border-[#f6b919] text-white bg-gray-700/50 mb-1 flex justify-between items-center">
             <span>Comercio</span> <span>▸</span>
           </div>
           {/* Items decorativos */}
           {['Idiomas', 'Ayuda', 'Seguridad'].map(item => (
             <div key={item} className="px-6 py-3 hover:bg-gray-700 cursor-pointer border-l-4 border-transparent flex justify-between items-center opacity-70">
               <span>{item}</span> <span>▸</span>
             </div>
           ))}
        </div>

        {/* --- CONTENIDO CENTRAL --- */}
        <div className="flex-1 bg-gray-100 p-4 md:p-10 flex justify-center items-start overflow-y-auto">
           
           {/* PANTALLA 1: FORMULARIO DE PAGO */}
           {step === 'form' || step === 'loading' ? (
             <div className="bg-white shadow-xl max-w-4xl w-full flex flex-col md:flex-row rounded-sm overflow-hidden mt-4 border border-gray-200">
                {/* Columna Datos */}
                <div className="w-full md:w-5/12 border-r border-gray-200 bg-gray-50/50 p-6">
                   <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Datos de la operación</h3>
                   <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded shadow-sm">
                         <span className="font-bold text-gray-600">IMPORTE TOTAL</span>
                         <span className="font-bold text-xl text-black">{importe} €</span>
                      </div>
                      <div className="space-y-2 pt-2 text-xs md:text-sm">
                         <div className="flex justify-between"><span className="font-bold text-gray-500">Comercio:</span><span className="text-right font-medium">El Hogar de tus Sueños</span></div>
                         <div className="flex justify-between"><span className="font-bold text-gray-500">Nº Pedido:</span><span className="font-medium">{orderId}</span></div>
                         <div className="flex justify-between"><span className="font-bold text-gray-500">Fecha:</span><span className="font-medium">{fecha}</span></div>
                         <div className="flex justify-between"><span className="font-bold text-gray-500">Terminal:</span><span className="font-medium">001-VIRTUAL</span></div>
                      </div>
                   </div>
                </div>

                {/* Columna Formulario */}
                <div className="w-full md:w-7/12 p-8 bg-white relative">
                   {step === 'loading' && (
                     <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#f6b919] rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-gray-600">Validando operación...</p>
                        <p className="text-xs text-gray-400 mt-1">Por favor, no cierres esta ventana.</p>
                     </div>
                   )}

                   <div className="flex justify-between items-center mb-6 border-b pb-3">
                      <h3 className="font-bold text-gray-800 text-lg">Pagar con Tarjeta</h3>
                      <div className="flex gap-2 opacity-80">
                         {/* Logos Tarjetas CSS */}
                         <div className="h-6 w-10 bg-blue-900 rounded-sm flex items-center justify-center text-[8px] text-white font-serif italic">Visa</div>
                         <div className="h-6 w-10 bg-red-600 rounded-sm flex items-center justify-center text-[8px] text-white font-sans relative overflow-hidden"><div className="absolute w-6 h-6 bg-orange-500 rounded-full -left-2 mix-blend-screen"></div>MC</div>
                      </div>
                   </div>

                   <form onSubmit={handleFakePayment} className="space-y-6">
                      <div className="relative">
                         <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Número de tarjeta</label>
                         <input type="text" required maxLength={19} placeholder="0000 0000 0000 0000"
                           className="w-full border border-gray-300 rounded p-3 pl-3 focus:border-[#f6b919] focus:ring-1 focus:ring-[#f6b919] outline-none transition font-mono text-lg"
                           value={cardForm.number} onChange={e => setCardForm({...cardForm, number: e.target.value})}
                         />
                      </div>

                      <div className="flex gap-4">
                         <div className="w-1/2">
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Caducidad</label>
                            <input type="text" required placeholder="MM / AA" maxLength={5}
                              className="w-full border border-gray-300 rounded p-3 text-center focus:border-[#f6b919] focus:ring-1 focus:ring-[#f6b919] outline-none"
                              value={cardForm.expiry} onChange={e => setCardForm({...cardForm, expiry: e.target.value})}
                            />
                         </div>
                         <div className="w-1/2">
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">CVV</label>
                            <input type="text" required placeholder="123" maxLength={3}
                              className="w-full border border-gray-300 rounded p-3 text-center focus:border-[#f6b919] focus:ring-1 focus:ring-[#f6b919] outline-none"
                              value={cardForm.cvv} onChange={e => setCardForm({...cardForm, cvv: e.target.value})}
                            />
                         </div>
                      </div>

                      <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                         <button type="button" onClick={() => router.back()} className="w-1/2 bg-white border border-gray-300 text-gray-600 py-3 rounded hover:bg-gray-50 text-sm font-bold">Cancelar</button>
                         <button type="submit" className="w-1/2 bg-[#f6b919] text-white py-3 rounded shadow-md hover:bg-yellow-500 text-sm font-bold">Pagar</button>
                      </div>
                   </form>
                </div>
             </div>
           ) : (
             /* PANTALLA 2: PAGO CORRECTO (SUCCESS) */
             <div className="bg-white shadow-xl max-w-2xl w-full rounded-sm overflow-hidden mt-10 border border-gray-200 text-center p-10 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Operación Autorizada!</h2>
                <p className="text-gray-500 mb-8">El pago se ha realizado correctamente.</p>
                
                <div className="bg-gray-50 p-4 rounded border border-gray-100 mb-8 inline-block text-left w-full max-w-sm mx-auto">
                   <div className="flex justify-between text-sm mb-2"><span>Importe cargado:</span> <span className="font-bold">{importe} €</span></div>
                   <div className="flex justify-between text-sm mb-2"><span>Número de pedido:</span> <span className="font-bold">{orderId}</span></div>
                   <div className="flex justify-between text-sm"><span>Autorización:</span> <span className="font-mono text-xs bg-gray-200 px-1 rounded">auth-{Math.floor(Math.random()*100000)}</span></div>
                </div>

                <div>
                   <button 
                     onClick={finalizarCompra}
                     className="bg-blue-600 text-white px-8 py-3 rounded shadow-lg hover:bg-blue-700 font-bold transition-all transform hover:scale-105"
                   >
                     Continuar y Finalizar Pedido &rarr;
                   </button>
                   <p className="text-xs text-gray-400 mt-4">Serás redirigido a la tienda automáticamente...</p>
                </div>
             </div>
           )}

        </div>
      </div>

      {/* FOOTER SIMULADO */}
      <div className="bg-[#f5f5f5] py-3 border-t border-gray-300 text-center text-[10px] text-gray-400 flex justify-center gap-4">
          <span>Visa Secure</span> | <span>Mastercard ID Check</span> | <span>Redsys © 2026</span>
      </div>
    </div>
  );
}