"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart } from "@/lib/cartService";

export default function BizumPage() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    setOrderId(String(Math.floor(10000 + Math.random() * 90000)));
    const cart = getCart();
    if (cart.length === 0) { router.push("/carrito"); return; }
    const sub = cart.reduce((acc, item) => acc + (item.precioFinal ?? item.precio) * item.cantidad, 0);
    
    let envio = 0;
    if (typeof window !== "undefined") {
      const envioData = localStorage.getItem("checkout_envio");
      if (envioData) envio = JSON.parse(envioData).coste || 0;
    }
    setTotal(sub + envio);
  }, [router]);

  const handleConfirmar = () => {
    setLoading(true);
    setTimeout(() => {
        router.push(`/checkout/confirmacion?pedido=${orderId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-fondo py-12 px-4 flex justify-center items-start font-sans">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-[#e4e0d5] overflow-hidden">
        
        {/* Cabecera Bizum */}
        <div className="bg-gradient-to-r from-[#00bfa5] to-[#009688] text-white p-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wide italic">Bizum</h1>
            <p className="text-teal-100 text-sm mt-1">Pago inmediato y seguro desde tu móvil</p>
        </div>

        <div className="p-8 md:p-12 space-y-8">
            
            {/* Instrucciones */}
            <div className="text-center">
                <p className="text-gray-600 mb-6">
                    Para finalizar tu pedido, envía un Bizum por el importe total al siguiente número:
                </p>
                
                <div className="bg-gray-50 border-2 border-[#00bfa5] rounded-xl p-6 inline-block w-full max-w-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#00bfa5] text-white text-[10px] font-bold px-2 py-1 rounded-bl">OFICIAL</div>
                    
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Enviar dinero a:</p>
                    <p className="text-3xl font-extrabold text-gray-800 tracking-widest mb-4">+34 678 529 510</p>
                    
                    <div className="border-t border-gray-200 pt-3">
                         <p className="text-xs text-gray-500 uppercase font-bold mb-1">Concepto (Muy Importante)</p>
                         <p className="text-lg font-bold text-[#009688]">PEDIDO {orderId}</p>
                    </div>
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-end border-t pt-4">
                <span className="font-bold text-xl text-gray-800">Total a enviar:</span>
                <span className="font-extrabold text-3xl text-primary">{total.toFixed(2)} €</span>
            </div>

            {/* Botones */}
            <div className="space-y-3">
                <button 
                    onClick={handleConfirmar}
                    disabled={loading}
                    className="w-full bg-[#009688] text-white py-4 rounded-lg font-bold text-lg hover:bg-teal-700 transition shadow-lg flex justify-center items-center gap-2"
                >
                    {loading ? "Verificando..." : "Ya he enviado el Bizum"}
                </button>
                <button onClick={() => router.back()} className="w-full text-gray-400 hover:text-gray-600 text-sm">Cancelar</button>
            </div>
        </div>
      </div>
    </div>
  );
}