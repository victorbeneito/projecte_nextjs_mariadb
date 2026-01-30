"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PagoTransferencia() {
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
      <h1 className="text-3xl font-bold mb-6">Pago por transferencia 🏦</h1>
      <p className="text-gray-600 mb-6">
        Por favor, realiza la transferencia a la siguiente cuenta:
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left text-sm mb-6">
        <p><strong>Titular:</strong> El Hogar de tus Sueños S.L.</p>
        <p><strong>Banco:</strong> Banco Ejemplo</p>
        <p><strong>IBAN:</strong> ES00 1234 5678 9012 3456 7890</p>
        <p><strong>Concepto:</strong> Pedido Online #{Date.now()}</p>
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
