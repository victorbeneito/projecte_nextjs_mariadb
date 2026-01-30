"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PagoBizum() {
  const router = useRouter();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const pagoData = localStorage.getItem("checkout_pago");
    if (!pagoData) {
      router.push("/checkout/pago");
      return;
    }
    setTotal(JSON.parse(pagoData).totalFinal);
  }, [router]);

  const handleConfirm = () => {
    localStorage.setItem("checkout_pedido_pendiente", "true");
    router.push("/checkout/confirmacion");
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-6">Pago con Bizum 📱</h1>
      <p className="text-gray-600 mb-6">
        Realiza tu pago Bizum al siguiente número:
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 inline-block text-left">
        <p><strong>Teléfono:</strong> 600 123 456</p>
        <p><strong>Titular:</strong> El Hogar de tus Sueños S.L.</p>
      </div>

      <p className="mb-8">
        Total del pedido:{" "}
        <span className="font-semibold text-primary">{total.toFixed(2)} €</span>
      </p>

      <button
        onClick={handleConfirm}
        className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primaryHover transition dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        Confirmar pedido →
      </button>
    </div>
  );
}
