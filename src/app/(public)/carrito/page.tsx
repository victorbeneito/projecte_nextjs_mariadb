"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCart,
  setCart,
  removeFromCart,
  clearCart,
  CartItem,
} from "@/lib/cartService";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import toast from "react-hot-toast";

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const { cliente, loading } = useClienteAuth();

  useEffect(() => {
    const items = getCart();
    setCarrito(items);
  }, []);

  useEffect(() => {
    const nuevoTotal = carrito.reduce(
      (acc, item) => acc + (item.precioFinal ?? item.precio) * item.cantidad,
      0
    );
    setTotal(nuevoTotal);
  }, [carrito]);

  const updateQuantity = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    const updated = carrito.map((item) =>
      item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    );
    setCart(updated);
    setCarrito(updated);
  };

  const handleRemove = (id: number) => {
    removeFromCart(id);
    setCarrito(getCart());
  };

  const handleClearCart = () => {
    if (confirm("¿Vaciar todo el carrito?")) {
      clearCart();
      setCarrito([]);
    }
  };

  const handleFinalizarCompra = () => {
    if (loading) return;

    if (carrito.length === 0) {
      toast.error("Tu carrito está vacío.");
      return;
    }

    if (!cliente) {
      toast.error("Debes iniciar sesión para continuar.");
      // router.push("/auth?redirect=/account/info?redirect=/checkout/envio");
      router.push("/auth?redirect=/account/info?redirect=/checkout/direcciones");
      return;
    }

    if (!cliente.direccion || !cliente.codigoPostal || !cliente.ciudad) {
      toast("Por favor completa tu dirección antes de continuar 🏠");
      // router.push("/account/info?redirect=/checkout/envio");
      router.push("/account/info?redirect=/checkout/direcciones");
      return;
    }
    // router.push("/checkout/envio");
    router.push("/checkout/direcciones");
  };

  if (carrito.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold mb-6 dark:text-white">
          Tu carrito está vacío 🛒
        </h1>
        <Link
          href="/productos"
          className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primaryHover transition"
        >
          Ir a comprar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Tu carrito 🛍️
      </h1>

      {/* Lista de productos */}
      <div className="bg-white dark:bg-darkNavBg shadow rounded-lg overflow-hidden divide-y dark:divide-gray-700 transition-colors duration-300">
        {carrito.map((item) => (
          <div key={item.id} className="p-4 flex items-center gap-4">
            <img
              src={item.imagen || "/no-image.jpg"}
              alt={item.nombre}
              className="w-20 h-20 object-cover rounded border dark:border-gray-600"
            />

            <div className="flex-1">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {item.nombre}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.tamanoSeleccionado && (
                  <span>Tamaño: {item.tamanoSeleccionado} · </span>
                )}
                {item.colorSeleccionado && (
                  <span>Color: {item.colorSeleccionado} · </span>
                )}
                {item.tiradorSeleccionado && (
                  <span>Tirador: {item.tiradorSeleccionado}</span>
                )}
              </p>
              <p className="mt-1 text-gray-700 dark:text-gray-300 font-medium">
                {(item.precioFinal ?? item.precio).toFixed(2)} €
              </p>
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded dark:bg-gray-700 dark:hover:bg-gray-600"
                disabled={item.cantidad <= 1}
              >
                –
              </button>

              <span className="font-medium w-6 text-center dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600">
                {item.cantidad}
              </span>

              <button
                onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
              >
                +
              </button>

              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium ml-2"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen y acciones */}
      <div className="bg-white dark:bg-darkNavBg shadow rounded-lg p-6 text-right space-y-4 transition-colors duration-300">
        <p className="text-lg text-gray-700 dark:text-gray-200">
          Total:{" "}
          <span className="text-2xl font-bold text-primary">
            {total.toFixed(2)} €
          </span>
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleClearCart}
            className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300"
          >
            Vaciar carrito
          </button>

          <button
            onClick={handleFinalizarCompra}
            className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primaryHover transition dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Finalizar compra →
          </button>
        </div>
      </div>
    </div>
  );
}