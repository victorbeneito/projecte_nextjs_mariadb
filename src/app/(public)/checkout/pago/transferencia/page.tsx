"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart } from "@/lib/cartService";

export default function TransferenciaPage() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Generar ID de pedido anticipado para que lo pongan en el concepto
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
    // Simular proceso
    setTimeout(() => {
        router.push(`/checkout/confirmacion?pedido=${orderId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-fondo py-12 px-4 flex justify-center items-start font-sans">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-[#e4e0d5] overflow-hidden">
        
        <div className="bg-[#006dff] text-white p-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wide">Transferencia Bancaria</h1>
            <p className="text-blue-100 text-sm mt-1">Realiza el pago cómodamente desde tu banco</p>
        </div>

        <div className="p-8 md:p-12 space-y-8">
            
            {/* Aviso */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-blue-800">
                   <strong>Importante:</strong> Tu pedido no se enviará hasta que hayamos recibido el importe en nuestra cuenta (1-2 días laborables).
                </p>
            </div>

            {/* Datos Bancarios */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center">
                <p className="text-gray-500 text-xs uppercase font-bold mb-2">Entidad Bancaria</p>
                <h3 className="text-xl font-bold text-[#006dff] mb-4">Banco Sabadell</h3>
                
                <p className="text-gray-500 text-xs uppercase font-bold mb-2">IBAN para realizar el ingreso</p>
                <div className="bg-white border border-gray-200 p-3 rounded-lg inline-block shadow-sm mb-4">
                    <code className="text-lg md:text-2xl font-mono font-bold text-gray-800 tracking-wider">
                        ES82 0081 0319 0452 7458 0563
                    </code>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-left max-w-sm mx-auto">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Beneficiario</p>
                        <p className="font-medium text-gray-800">El Hogar de tus Sueños</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Concepto</p>
                        <p className="font-bold text-red-600 bg-red-50 inline-block px-1 rounded">Pedido #{orderId}</p>
                    </div>
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-end border-t pt-4">
                <span className="font-bold text-xl text-gray-800">Importe a transferir:</span>
                <span className="font-extrabold text-3xl text-primary">{total.toFixed(2)} €</span>
            </div>

            {/* Botones */}
            <div className="space-y-3">
                <button 
                    onClick={handleConfirmar}
                    disabled={loading}
                    className="w-full bg-[#006dff] text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2"
                >
                    {loading ? "Procesando..." : "Confirmar Pedido"}
                </button>
                <button onClick={() => router.back()} className="w-full text-gray-400 hover:text-gray-600 text-sm">Cancelar</button>
            </div>
        </div>
      </div>
    </div>
  );
}