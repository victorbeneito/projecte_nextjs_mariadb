"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { getCart, clearCart, CartItem } from "@/lib/cartService";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

export default function ResumenPage() {
  const router = useRouter();
  const { cliente, token, loading } = useClienteAuth();

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  const [metodoEnvio, setMetodoEnvio] = useState<{ metodo: string; coste: number } | null>(null);
  const [metodoPago, setMetodoPago] = useState<{ metodo: string; recargo: number } | null>(null);
  const [codigo, setCodigo] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  useEffect(() => {
    if (!loading && !cliente) {
      router.push("/auth?redirect=/checkout/resumen");
      return;
    }

    const cartItems = getCart();
    if (!cartItems || cartItems.length === 0) {
      router.push("/carrito");
      return;
    }
    setCarrito(cartItems);

    const sub = cartItems.reduce(
      (acc, item) => acc + (item.precioFinal ?? item.precio) * item.cantidad,
      0
    );
    setSubtotal(sub);

    const envio = JSON.parse(localStorage.getItem("checkout_envio") || "null");
    const pago = JSON.parse(localStorage.getItem("checkout_pago") || "null");

    if (!envio || !pago) {
      router.push("/checkout/envio");
      return;
    }

    setMetodoEnvio(envio);
    setMetodoPago(pago);
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
    } catch {
      toast.error("Error validando el cupón");
    }
  };

  const confirmarPedido = async () => {
    if (!aceptaTerminos) {
      toast.error("Debes aceptar los términos del servicio antes de continuar");
      return;
    }

    if (!cliente || !token) {
      toast.error("Debes iniciar sesión antes de continuar.");
      return;
    }

    const envioCoste = metodoEnvio?.coste || 0;
    const pagoRecargo = metodoPago?.recargo || 0;
    const descuentoImporte = (subtotal * descuento) / 100;
    const totalFinal = subtotal + envioCoste + pagoRecargo - descuentoImporte;

    const body = {
      carrito,
      metodoEnvio,
      metodoPago,
      descuento,
      totalFinal,
      cuponCodigo: codigo,
      cliente,
    };

    try {
      const res = await fetchWithAuth("/api/pedidos/new", token, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.error) {
        toast.error(res.error || "Error al crear el pedido");
        return;
      }

      toast.success("Pedido creado correctamente ✅");
      clearCart();
      setPedidoConfirmado(true);
    } catch (err) {
      console.error("❌ Error al crear pedido:", err);
      toast.error("No se pudo crear el pedido. Inténtalo de nuevo.");
    }
  };

  if (loading) return <p className="text-center py-10 dark:text-white">Cargando...</p>;
  if (!cliente) return null;

  if (pedidoConfirmado)
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          🎉 ¡Pedido confirmado!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Gracias por tu compra. Te enviaremos un correo de confirmación.
        </p>
        <Link
          href="/"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primaryHover"
        >
          Volver al inicio
        </Link>
      </div>
    );

  const envioCoste = metodoEnvio?.coste || 0;
  const pagoRecargo = metodoPago?.recargo || 0;
  const descuentoImporte = (subtotal * descuento) / 100;
  const totalFinal = subtotal + envioCoste + pagoRecargo - descuentoImporte;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Resumen final del pedido 🧾
      </h1>

      {/* Datos de envío */}
      <div className="bg-white dark:bg-darkNavBg p-6 rounded-lg shadow mb-6 transition-colors duration-300">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Datos de envío</h2>
        <div className="text-gray-800 dark:text-gray-300 space-y-1">
          <p>
            {cliente.nombre} {cliente.apellidos}
          </p>
          <p>
            {cliente.direccion}, {cliente.codigoPostal} {cliente.ciudad}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Método:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">
            {metodoEnvio?.metodo === "ontime"
              ? "Mensajería Ontime"
              : "Recogida en tienda"}{" "}
            </span>
            ({envioCoste.toFixed(2)} €)
          </p>
        </div>
      </div>

      {/* Método de pago */}
      <div className="bg-white dark:bg-darkNavBg p-6 rounded-lg shadow mb-6 transition-colors duration-300">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Método de pago</h2>
        <p className="text-gray-800 dark:text-gray-200 capitalize">{metodoPago?.metodo || "No seleccionado"}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Recargo: {pagoRecargo.toFixed(2)} €
        </p>
      </div>

      {/* Carrito */}
      <div className="bg-white dark:bg-darkNavBg p-6 rounded-lg shadow mb-6 transition-colors duration-300">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Productos</h2>
        {Array.isArray(carrito) && carrito.length > 0 ? (
          <div className="space-y-3">
            {carrito.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2 last:border-0">
                <span>
                  {item.nombre} × {item.cantidad}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {((item.precioFinal ?? item.precio) * item.cantidad).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Tu carrito está vacío.</p>
        )}
        
        <hr className="my-4 dark:border-gray-700" />
        
        <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
                <span>Envío:</span>
                <span>{envioCoste.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
                <span>Recargo pago:</span>
                <span>{pagoRecargo.toFixed(2)} €</span>
            </div>
            {descuento > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Descuento (-{descuento}%):</span>
                <span>-{descuentoImporte.toFixed(2)} €</span>
            </div>
            )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-700">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total final:</span>
            <span className="text-2xl font-bold text-primary">
             {totalFinal.toFixed(2)} €
            </span>
        </div>
      </div>

      {/* Cupón */}
      <div className="bg-white dark:bg-darkNavBg p-6 rounded-lg shadow mb-6 transition-colors duration-300">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          ¿Tienes un cupón de descuento?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Introduce tu cupón"
            className="border dark:border-gray-600 rounded-md p-2 flex-1 text-sm bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-white focus:outline-none focus:border-primary"
          />
          <button
            onClick={aplicarCupon}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Aplicar
          </button>
        </div>
        {descuento > 0 && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-2">
            Cupón aplicado: -{descuento}% de descuento
          </p>
        )}
      </div>

      {/* Términos y botón */}
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          id="terminos"
          checked={aceptaTerminos}
          onChange={(e) => setAceptaTerminos(e.target.checked)}
          className="mr-2 h-4 w-4"
        />
        <label htmlFor="terminos" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
          Acepto los{" "}
          <Link
            href="/terminos"
            target="_blank"
            className="text-primary hover:underline"
          >
            términos y condiciones del servicio
          </Link>
          .
        </label>
      </div>

      <button
        onClick={confirmarPedido}
        disabled={!aceptaTerminos}
        className="w-full bg-primary text-white font-semibold py-3 rounded hover:bg-primaryHover transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirmar compra
      </button>
    </div>
  );
}