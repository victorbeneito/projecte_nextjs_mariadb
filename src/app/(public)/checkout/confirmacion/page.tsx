"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearCart, getCart, CartItem } from "@/lib/cartService";
import { useClienteAuth } from "@/context/ClienteAuthContext";

interface Envio {
  metodo: string;
  coste: number;
}

interface Pago {
  metodo: string;
  totalFinal: number;
}

export default function ConfirmacionPage() {
  const { cliente } = useClienteAuth();

  const [pedido, setPedido] = useState<{
    envio: Envio | null;
    pago: Pago | null;
    carrito: CartItem[];
  }>({
    envio: null,
    pago: null,
    carrito: [],
  });

  useEffect(() => {
    console.log("CLIENTE CONTEXTO:", cliente);       // ← y aquí
  }, [cliente]);

  // 1) Leer datos (envío, pago, carrito) y guardarlos en estado
  useEffect(() => {
    const envioRaw = localStorage.getItem("checkout_envio");
    const pagoRaw = localStorage.getItem("checkout_pago");
    const carrito = getCart();

    const datosPedido = {
      envio: envioRaw ? JSON.parse(envioRaw) : null,
      pago: pagoRaw ? JSON.parse(pagoRaw) : null,
      carrito,
    };

    setPedido(datosPedido);
  }, []);

  // 2) Limpiar carrito y datos de checkout después de pintar
  useEffect(() => {
    if (pedido.pago && pedido.carrito.length > 0) {
      clearCart();
      localStorage.removeItem("checkout_envio");
      localStorage.removeItem("checkout_pago");
      localStorage.removeItem("checkout_direccion");
    }
  }, [pedido]);

  // Si no hay datos suficientes, mostrar mensaje neutro
  if (!pedido.pago || pedido.carrito.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-semibold mb-6">
          No hay pedido pendiente
        </h1>
        <p className="text-gray-600 mb-4">
          Vuelve al carrito o realiza una nueva compra.
        </p>
        <Link
          href="/"
          className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primaryHover transition dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  const { envio, pago, carrito } = pedido;
  const numeroPedido = `PED-${Date.now().toString().slice(-6)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-8">
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          🎉 ¡Pedido confirmado!
        </h1>
        <p className="text-lg font-semibold text-green-800 mb-4">
          Número de pedido:{" "}
          <span className="font-mono bg-white px-3 py-1 rounded">
            {numeroPedido}
          </span>
        </p>
        <p className="text-gray-700">
          Gracias por tu compra. Te hemos enviado un email con la
          confirmación.
        </p>
      </div>

      {/* Resumen completo */}
      <div className="bg-white shadow-xl rounded-lg p-8 text-left space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">
          Resumen del pedido #{numeroPedido}
        </h2>

        {/* Cliente y dirección desde el contexto */}
        {cliente && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold mb-2">👤 Cliente</h3>
              <p className="text-lg font-medium">
                {cliente.nombre} {cliente.apellidos}
              </p>
              <p className="text-gray-700">{cliente.email}</p>
              <p className="text-sm text-gray-600">
                📞 {cliente.telefono || "No indicado"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📍 Dirección</h3>
              <p className="text-gray-700">
                {cliente.direccion || "Dirección no indicada"}
              </p>
              <p className="text-sm text-gray-600">
                {(cliente.codigoPostal || "CP no indicado") +
                  " " +
                  (cliente.ciudad || "")}
              </p>
            </div>
          </div>
        )}

        {/* Envío */}
        {envio && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">🚚 Método de envío</h3>
            <p className="text-lg">
              {envio.metodo === "tienda"
                ? "🏬 Recoger en tienda (gratis)"
                : `🚚 ${envio.metodo} · ${envio.coste}€`}
            </p>
          </div>
        )}

        {/* Pago */}
        {pago && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2">💳 Método de pago</h3>
            <p className="text-lg capitalize">
              {pago.metodo === "tarjeta" && "💳 Tarjeta (Redsys)"}
              {pago.metodo === "paypal" && "💰 PayPal"}
              {pago.metodo === "transferencia" &&
                "🏦 Transferencia bancaria"}
              {pago.metodo === "bizum" && "📱 Bizum"}
              {pago.metodo === "contrareembolso" &&
                "💵 Contrareembolso"}
            </p>
          </div>
        )}

        {/* Productos */}
        {carrito.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg mb-3">🛒 Productos</h3>
            <div className="divide-y divide-gray-200">
              {carrito.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.nombre}</p>
                    <p className="text-sm text-gray-600">
                      × {item.cantidad}
                    </p>
                  </div>
                  <p className="font-semibold text-lg">
                    {(item.precioFinal ?? item.precio).toFixed(2)}€
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4 text-right">
          <p className="text-3xl font-bold text-primary">
            Total: {pago.totalFinal.toFixed(2)}€
          </p>
        </div>
      </div>

      <Link
        href="/"
        className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primaryHover transition dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}
