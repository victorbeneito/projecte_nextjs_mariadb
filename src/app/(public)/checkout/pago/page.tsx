"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { getCart, CartItem } from "@/lib/cartService";

import PasarelaRedsys from "@/components/PasarelaRedsys"; 
import PasarelaPaypal from "@/components/PasarelaPaypal"; 

export default function PagoPage() {
  const router = useRouter();
  const { cliente } = useClienteAuth();

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  
  // Popups
  const [showRedsys, setShowRedsys] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
  
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

  // Recargo solo visual para contrareembolso
  const calcularTotalMostrado = () => {
    if (metodoPago === "contrareembolso") return (total + 3 + (total * 0.03)).toFixed(2);
    return total.toFixed(2);
  };

  const handlePagarClick = () => {
    if (!metodoPago) { alert("Selecciona un método de pago"); return; }

    const idSimulado = String(Math.floor(1000 + Math.random() * 9000));
    setPedidoTempId(idSimulado);

    // --- ENRUTAMIENTO DE PAGOS ---
    if (metodoPago === 'tarjeta') {
      setShowRedsys(true); 
    } else if (metodoPago === 'paypal') {
      setShowPaypal(true); 
    } else if (metodoPago === 'contrareembolso') {
       router.push('/checkout/pago/contrareembolso');
    } else if (metodoPago === 'transferencia') {
       router.push('/checkout/pago/transferencia');
    } else if (metodoPago === 'bizum') {
       router.push('/checkout/pago/bizum');
    }
  };

  const handleSuccess = () => {
    setShowRedsys(false);
    setShowPaypal(false);
    router.push(`/checkout/confirmacion?pedido=${pedidoTempId}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Método de pago 💳</h1>

      {/* Selector de Pagos Completo */}
      <div className="space-y-4">
        {[
          { id: "tarjeta", label: "💳 Pago con tarjeta (Redsys)", desc: "Pago seguro instantáneo" },
          { id: "paypal", label: "💰 Pagar con PayPal", desc: "Usa tu saldo o tarjeta" },
          { id: "bizum", label: "📱 Bizum", desc: "Envío inmediato al móvil" },
          { id: "transferencia", label: "🏦 Transferencia Bancaria", desc: "El pedido se enviará tras recibir el pago" },
          { id: "contrareembolso", label: "💵 Contrareembolso", desc: "+3€ y 3% comisión de gestión" },
        ].map((opt) => (
          <label key={opt.id} className={`block border rounded-lg p-4 cursor-pointer transition-colors ${metodoPago === opt.id ? "border-primary bg-yellow-50 ring-1 ring-primary" : "hover:border-primary"}`}>
            <div className="flex items-center">
              <input type="radio" name="pago" value={opt.id} checked={metodoPago === opt.id} onChange={() => setMetodoPago(opt.id)} className="mr-3 h-5 w-5 text-primary" />
              <div>
                  <span className="font-bold text-gray-800 block">{opt.label}</span>
                  <span className="text-xs text-gray-500">{opt.desc}</span>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-10 border-t pt-6 flex justify-between items-center">
        <div className="text-lg font-bold">Total: <span className="text-primary text-2xl">{calcularTotalMostrado()} €</span></div>
        <button onClick={handlePagarClick} className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primaryHover transition">
          {metodoPago === 'transferencia' || metodoPago === 'bizum' ? 'Ver Datos de Pago ->' : 'Pagar Ahora ->'}
        </button>
      </div>

      {/* Modales */}
      <PasarelaRedsys isOpen={showRedsys} onClose={() => setShowRedsys(false)} onSuccess={handleSuccess} importe={total.toFixed(2)} orderId={pedidoTempId} />
      <PasarelaPaypal isOpen={showPaypal} onClose={() => setShowPaypal(false)} onSuccess={handleSuccess} importe={total.toFixed(2)} orderId={pedidoTempId} />
    </div>
  );
}