"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PagoContrareembolso() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [recargo, setRecargo] = useState(0);

  useEffect(() => {
    const pagoData = localStorage.getItem("checkout_pago");
    if (!pagoData) {
      router.push("/checkout/pago");
      return;
    }
    const data = JSON.parse(pagoData);
    setTotal(data.totalFinal);
    const extra = 3 + data.totalFinal * 0.03;
    setRecargo(extra);
  }, [router]);

  const handleConfirm = () => {
    localStorage.setItem("checkout_pedido_pendiente", "true");
    router.push("/checkout/confirmacion");
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-6">Pago contrareembolso 💵</h1>
      <p className="text-gray-600 mb-6">
        El pago se realizará al entregar el pedido.  
        Este método tiene un suplemento fijo de 3 € + 3 % del total.
      </p>

      <p className="text-lg mb-1">Importe pedido: {total.toFixed(2)} €</p>
      <p className="text-lg mb-6">Recargo: {recargo.toFixed(2)} €</p>

      <p className="text-xl font-semibold mb-8">
        Total final:{" "}
        <span className="text-primary">
          {(total + recargo).toFixed(2)} €
        </span>
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
