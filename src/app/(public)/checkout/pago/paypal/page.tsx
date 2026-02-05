"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { getCart, CartItem } from "@/lib/cartService";
import PasarelaRedsys from "@/components/PasarelaRedsys"; // Tu componente Redsys
import PasarelaPaypal from "@/components/PasarelaPaypal"; // 👈 NUEVO: Importar Paypal

export default function PagoPage() {
  const router = useRouter();
  const { cliente } = useClienteAuth();

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  
  // --- ESTADOS PARA LOS POPUPS ---
  const [showRedsys, setShowRedsys] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false); // 👈 Estado para PayPal
  
  const [pedidoTempId, setPedidoTempId] = useState("");

  useEffect(() => {
    if (!cliente) { router.push("/auth"); return; }
    const cart = getCart();
    if (cart.length === 0) { router.push("/carrito"); return; }
    setCarrito(cart);

    let costeEnvio = 0;
    const envioData = localStorage.getItem("checkout_envio");
    if (envioData) costeEnvio = JSON.parse(envioData).coste || 0;

    const subtotal = cart.reduce((acc, item) => acc + (item.precioFinal ?? item.precio) * item.cantidad, 0);
    setTotal(subtotal + costeEnvio);
  }, [router, cliente]);

  const calcularTotalConRecargo = () => {
    if (metodoPago === "contrareembolso") return (total + (3 + total * 0.03)).toFixed(2);
    return total.toFixed(2);
  };

  const handlePagarClick = () => {
    if (!metodoPago) { alert("Selecciona un método de pago"); return; }

    // Generamos ID simulado
    const idSimulado = String(Math.floor(1000 + Math.random() * 9000));
    setPedidoTempId(idSimulado);

    // LÓGICA DE DIRECCIONAMIENTO
    if (metodoPago === 'tarjeta') {
      setShowRedsys(true); // Abrir Redsys
    } else if (metodoPago === 'paypal') {
      setShowPaypal(true); // 👈 Abrir PayPal
    } else {
      // Bizum, Contrareembolso, etc. van directos por ahora
      router.push(`/checkout/confirmacion?pedido=${idSimulado}`);
    }
  };

  // Callback común para cuando acaban los popups
  const handleSuccess = () => {
    setShowRedsys(false);
    setShowPaypal(false);
    router.push(`/checkout/confirmacion?pedido=${pedidoTempId}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Método de pago 💳</h1>

      {/* Selector de Pagos */}
      <div className="space-y-4">
        {[
          { id: "tarjeta", label: "💳 Pago con tarjeta (Redsys)" },
          { id: "paypal", label: "💰 Pagar con PayPal" },
          { id: "bizum", label: "📱 Bizum" },
          { id: "contrareembolso", label: "💵 Contrareembolso (+3 € + 3%)" },
        ].map((opt) => (
          <label key={opt.id} className={`block border rounded-lg p-4 cursor-pointer transition-colors ${metodoPago === opt.id ? "border-primary bg-yellow-50" : "hover:border-primary"}`}>
            <div className="flex items-center">
              <input type="radio" name="pago" value={opt.id} checked={metodoPago === opt.id} onChange={() => setMetodoPago(opt.id)} className="mr-3 h-5 w-5 text-primary" />
              <span className="font-medium text-gray-800">{opt.label}</span>
            </div>
          </label>
        ))}
      </div>

      {/* Botón Pagar */}
      <div className="mt-10 border-t pt-6 flex justify-between items-center">
        <div className="text-lg font-bold">Total: <span className="text-primary text-2xl">{calcularTotalConRecargo()} €</span></div>
        <button onClick={handlePagarClick} className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primaryHover transition">
          Pagar Ahora &rarr;
        </button>
      </div>

      {/* --- POPUPS DE PASARELAS --- */}
      
      {/* 1. REDSYS */}
      <PasarelaRedsys 
        isOpen={showRedsys}
        onClose={() => setShowRedsys(false)}
        onSuccess={handleSuccess}
        importe={total.toFixed(2)}
        orderId={pedidoTempId}
      />

      {/* 2. PAYPAL (NUEVO) */}
      <PasarelaPaypal
        isOpen={showPaypal}
        onClose={() => setShowPaypal(false)}
        onSuccess={handleSuccess}
        importe={total.toFixed(2)}
        orderId={pedidoTempId}
      />
      
    </div>
  );
}