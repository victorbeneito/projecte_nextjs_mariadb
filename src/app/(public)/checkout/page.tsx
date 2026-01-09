"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, clearCart, CartItem } from "@/lib/cartService";
import Link from "next/link";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { cliente, loading, token } = useClienteAuth();
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

  // 🔹 Estado para cupones
  const [codigo, setCodigo] = useState("");
  const [descuento, setDescuento] = useState(0);

  // Control de acceso + carga de carrito
  useEffect(() => {
    if (!loading && !cliente) {
      router.push("/auth?redirect=/checkout");
      return;
    }

    if (!loading && cliente) {
      if (!cliente.direccion || !cliente.ciudad || !cliente.codigoPostal) {
        router.push("/direcciones?next=/checkout/envio");
        return;
      }

      const cartItems = getCart();
      if (cartItems.length === 0) {
        router.push("/carrito");
        return;
      }

      setCarrito(cartItems);

      const totalCalc = cartItems.reduce(
        (acc, item) => acc + (item.precioFinal ?? item.precio) * item.cantidad,
        0
      );
      setTotal(totalCalc);
    }
  }, [cliente, loading, router]);

  const aplicarCupon = async () => {
    try {

    if (!token) {
  toast.error("Debes iniciar sesión para aplicar un cupón");
  return;
}      
      const res = await fetchWithAuth("/api/coupons/validate", token, {
        method: "POST",
        body: JSON.stringify({ codigo }),
      });

      if (res.valid) {
        setDescuento(res.descuento);
        toast.success(`Cupón válido: -${res.descuento}%`);
      } else {
        setDescuento(0);
        toast.error(res.error || "Cupón no válido");
      }
    } catch (error) {
      toast.error("Error validando el cupón");
      console.error(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí en el futuro: enviar pedido completo al backend
    clearCart();
    setPedidoEnviado(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500 text-sm animate-pulse">
          Comprobando autenticación...
        </p>
      </div>
    );
  }

  if (!cliente) return null;

  if (pedidoEnviado) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          🎉 ¡Pedido realizado con éxito!
        </h1>
        <p className="text-gray-700 mb-8">
          Gracias por tu compra. Te enviaremos un correo con la confirmación.
        </p>
        <Link
          href="/"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primaryHover transition"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  // 🔹 Calcular total con descuento
  const totalConDescuento = total - (total * descuento) / 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-10">
      {/* Datos de envío (solo lectura) */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold mb-4">Finalizar compra 🧾</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow space-y-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-700">
              Datos de envío
            </p>
            <p className="text-sm text-gray-800">
              {cliente.nombre} {cliente.apellidos}
            </p>
            <p className="text-sm text-gray-800">{cliente.email}</p>
            <p className="text-sm text-gray-800">{cliente.direccion}</p>
            <p className="text-sm text-gray-800">
              {cliente.codigoPostal} {cliente.ciudad}
            </p>
            <button
              type="button"
              onClick={() => router.push("/direcciones?next=/checkout/envio")}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Editar dirección
            </button>
          </div>

          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primaryHover transition"
          >
            Confirmar pedido
          </button>
        </form>
      </div>

      {/* Resumen del pedido */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
        {carrito.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center text-sm mb-3"
          >
            <div>
              <p className="font-medium">{item.nombre}</p>
              <p className="text-gray-500">
                {item.cantidad} ×{" "}
                {(item.precioFinal ?? item.precio).toFixed(2)} €
              </p>
            </div>
            <span className="font-medium text-gray-800">
              {((item.precioFinal ?? item.precio) * item.cantidad).toFixed(2)} €
            </span>
          </div>
        ))}

        <hr className="my-4" />

        {/* 🔹 Bloque de cupón */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ¿Tienes un cupón de descuento?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Introduce tu código"
              className="flex-1 border rounded-md p-2 text-sm"
            />
            <button
              type="button"
              onClick={aplicarCupon}
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Aplicar
            </button>
          </div>
          {descuento > 0 && (
            <p className="text-green-600 text-sm mt-2">
              Cupón aplicado: -{descuento}% de descuento
            </p>
          )}
        </div>

        <p className="text-lg font-semibold text-right">
          Total:{" "}
          <span className="text-primary text-2xl">
            {totalConDescuento.toFixed(2)} €
          </span>
        </p>
      </div>
    </div>
  );
}
