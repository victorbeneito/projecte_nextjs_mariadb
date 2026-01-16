"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { getCart, CartItem } from "@/lib/cartService";

export default function PagoPage() {
  const router = useRouter();
  const { cliente } = useClienteAuth();

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [envio, setEnvio] = useState<{ metodo: string; coste: number } | null>(null);
  const [metodoPago, setMetodoPago] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!cliente) {
      router.push("/auth");
      return;
    }

    const cart = getCart();
    if (cart.length === 0) {
      router.push("/carrito");
      return;
    }
    setCarrito(cart);

    const envioData = localStorage.getItem("checkout_envio");
    if (!envioData) {
      router.push("/checkout/envio");
      return;
    }

    const data = JSON.parse(envioData);
    setEnvio(data);

    const subtotal = cart.reduce(
      (acc, item) => acc + (item.precioFinal ?? item.precio) * item.cantidad,
      0
    );
    const totalConEnvio = subtotal + (data.coste || 0);
    setTotal(totalConEnvio);
  }, [router, cliente]);

  const handleConfirm = () => {
    if (!metodoPago) {
      alert("Selecciona un método de pago antes de continuar.");
      return;
    }

    let recargo = 0;
    if (metodoPago === "contrareembolso") {
      recargo = 3 + total * 0.03;
    }

    const pagoData = {
      metodo: metodoPago,
      recargo,
    };

    localStorage.setItem("checkout_pago", JSON.stringify(pagoData));
    router.push("/checkout/resumen");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Método de pago 💳
      </h1>

      {/* Opciones de pago */}
      <div className="space-y-4">
        {[
          { id: "tarjeta", label: "💳 Pago con tarjeta (Redsys)" },
          { id: "paypal", label: "💰 Pagar con PayPal" },
          { id: "transferencia", label: "🏦 Transferencia bancaria" },
          { id: "bizum", label: "📱 Bizum" },
          { id: "contrareembolso", label: "💵 Contrareembolso (+3 € + 3 %)" },
        ].map((opt) => (
          <label
            key={opt.id}
            className={`block border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
              metodoPago === opt.id
                ? "border-primary bg-primary/10"
                : "border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
            }`}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="pago"
                value={opt.id}
                className="mr-3"
                checked={metodoPago === opt.id}
                onChange={() => setMetodoPago(opt.id)}
              />
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {opt.label}
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Total + botón */}
      <div className="mt-10 border-t dark:border-gray-700 pt-6 flex justify-between items-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-white">
          Total provisional:{" "}
          <span className="text-primary text-2xl ml-2">{total.toFixed(2)} €</span>
        </p>

        <button
          onClick={handleConfirm}
          className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primaryHover transition"
        >
          Continuar al resumen →
        </button>
      </div>
    </div>
  );
}