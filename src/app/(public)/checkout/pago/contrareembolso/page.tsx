"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, CartItem } from "@/lib/cartService";

export default function ContrareembolsoPage() {
  const router = useRouter();
  
  // Estados de importes
  const [subtotal, setSubtotal] = useState(0);
  const [costeEnvio, setCosteEnvio] = useState(0);
  
  // Recargos
  const RECARGO_FIJO = 3.00;
  const RECARGO_PORCENTAJE = 0.03; // 3%

  const [recargoPorcentualCalculado, setRecargoPorcentualCalculado] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Cargar carrito
    const cart = getCart();
    if (cart.length === 0) {
       router.push("/carrito");
       return;
    }

    // 2. Calcular Subtotal Productos
    const sub = cart.reduce((acc, item) => acc + (item.precioFinal ?? item.precio) * item.cantidad, 0);
    setSubtotal(sub);

    // 3. Cargar Envío
    let envio = 0;
    if (typeof window !== "undefined") {
      const envioData = localStorage.getItem("checkout_envio");
      if (envioData) {
        const data = JSON.parse(envioData);
        envio = data.coste || 0;
      }
    }
    setCosteEnvio(envio);

    // 4. Calcular Recargos
    const baseImponible = sub + envio;
    const variable = baseImponible * RECARGO_PORCENTAJE;
    
    setRecargoPorcentualCalculado(variable);
    setTotalFinal(baseImponible + RECARGO_FIJO + variable);

  }, [router]);

  const handleConfirmarPedido = () => {
    setLoading(true);
    
    // Generar ID de pedido simulado
    const idPedido = Math.floor(10000 + Math.random() * 90000);

    // Simular un pequeño proceso de guardado
    setTimeout(() => {
        router.push(`/checkout/confirmacion?pedido=${idPedido}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-fondo py-12 px-4 flex justify-center items-start font-sans">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-[#e4e0d5] overflow-hidden">
        
        {/* Cabecera */}
        <div className="bg-gray-800 text-white p-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wide">Pago Contrareembolso</h1>
            <p className="text-gray-300 text-sm mt-1">Pagas en efectivo al recibir el paquete</p>
        </div>

        <div className="p-8 md:p-12">
            
            {/* Aviso Importante */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
                <div className="flex gap-3">
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <div>
                        <h3 className="font-bold text-yellow-800 text-sm uppercase">Información del recargo</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            La agencia de transporte cobra una comisión por la gestión del dinero en efectivo. Este método de pago tiene un <strong>coste fijo de 3,00€</strong> más un <strong>3% del total</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Desglose de Precios */}
            <h3 className="font-bold text-gray-800 text-lg mb-4 border-b pb-2">Desglose del Importe</h3>
            <div className="space-y-3 text-base text-gray-600 mb-8">
                <div className="flex justify-between">
                    <span>Subtotal Pedido</span>
                    <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                    <span>Gastos de Envío</span>
                    <span>{costeEnvio === 0 ? "Gratis" : `${costeEnvio.toFixed(2)} €`}</span>
                </div>
                
                {/* Recargos destacados */}
                <div className="flex justify-between text-red-600 bg-red-50 px-2 py-1 rounded">
                    <span>Recargo Gestión (Fijo)</span>
                    <span>+ {RECARGO_FIJO.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-red-600 bg-red-50 px-2 py-1 rounded">
                    <span>Comisión Transportista (3%)</span>
                    <span>+ {recargoPorcentualCalculado.toFixed(2)} €</span>
                </div>

                <div className="border-t pt-4 mt-4 flex justify-between items-end">
                    <span className="font-bold text-xl text-gray-800">Total a Pagar al Mensajero:</span>
                    <span className="font-extrabold text-3xl text-primary">{totalFinal.toFixed(2)} €</span>
                </div>
                <p className="text-xs text-right text-gray-400 mt-1">* Ten preparado el importe exacto en efectivo.</p>
            </div>

            {/* Botón de Compromiso */}
            <div className="space-y-4">
                <button 
                    onClick={handleConfirmarPedido}
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Procesando pedido...
                        </>
                    ) : (
                        <>
                           Confirmar pedido y Pagar al recibir &rarr;
                        </>
                    )}
                </button>
                
                <button 
                    onClick={() => router.back()}
                    className="w-full text-gray-500 font-medium text-sm hover:text-gray-800 hover:underline"
                >
                    Cancelar y elegir otro método de pago
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}