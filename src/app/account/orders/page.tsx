"use client";

import { useEffect, useState } from "react";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

interface Producto {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// ✅ INTERFACE ACTUALIZADA A LA NUEVA BASE DE DATOS
interface Pedido {
  id: number;
  numeroPedido?: string;
  fechaPedido?: string;
  createdAt?: string;
  estado: string;
  
  // Datos planos (ya no son objetos)
  totalFinal: number;
  envioMetodo: string;
  envioCoste: number;
  pagoMetodo: string;
  
  productos: Producto[];
  clienteId?: string;
}

export default function OrdersPage() {
  const { token, cliente } = useClienteAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoAbierto, setPedidoAbierto] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !cliente?.id) return;

    const fetchPedidos = async () => {
      try {
        const data = await fetchWithAuth(
          `/api/pedidos?clienteId=${cliente.id}`,
          token
        );
        setPedidos(data.pedidos || []);
      } catch (err) {
        console.error("❌ Error al obtener pedidos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [token, cliente]);

  const togglePedido = (id: number) => {
    setPedidoAbierto((prev) => (prev === id ? null : id));
  };

  const formatPrice = (amount: number) => {
    return Number(amount || 0).toFixed(2);
  };

  if (loading) return <p>Cargando pedidos...</p>;
  if (!pedidos.length)
    return <p>No tienes pedidos registrados todavía.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Historial de pedidos</h1>

      <div className="divide-y divide-gray-200 border border-gray-200 rounded-md bg-white shadow-sm">
        {pedidos.map((pedido) => {
          const abierto = pedidoAbierto === pedido.id;
          const referencia = pedido.numeroPedido || pedido.id;

          return (
            <div key={pedido.id} className="p-4">
              {/* --- Cabecera del pedido --- */}
              <button
                onClick={() => togglePedido(pedido.id)}
                className="w-full flex justify-between items-center text-left font-medium text-gray-800 hover:text-blue-600"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">
                      Ref. pedido:
                    </span>{" "}
                    {referencia}
                  </p>
                  <p>
                    <span className="font-semibold">Fecha:</span>{" "}
                    {new Date(
                      pedido.fechaPedido ??
                        pedido.createdAt ??
                        ""
                    ).toLocaleDateString("es-ES")}
                  </p>
                  <p>
                    <span className="font-semibold">Método de pago:</span>{" "}
                    {/* ✅ CORREGIDO: Usamos pagoMetodo directo */}
                    {pedido.pagoMetodo || "–"}
                  </p>
                </div>

                <div className="text-right">
                  <p>
                    <span className="font-semibold">Total:</span>{" "}
                    {/* ✅ CORREGIDO: Usamos totalFinal directo */}
                    {formatPrice(pedido.totalFinal)} €
                  </p>
                  <p className="capitalize text-sm text-gray-600">
                    Estado: {pedido.estado}
                  </p>
                </div>
              </button>

              {/* --- Detalle desplegable con productos --- */}
              {abierto && (
                <div className="mt-4 border-t border-gray-200 pt-4 animate-fade-in">
                  <h3 className="text-lg font-semibold mb-3">
                    Productos
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse mb-4">
                      <thead>
                        <tr className="border-b bg-gray-100">
                          <th className="text-left p-2">Producto</th>
                          <th className="p-2 text-center">Unidades</th>
                          <th className="p-2 text-right">Precio</th>
                          <th className="p-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedido.productos.map((prod, index) => (
                          <tr
                            key={index}
                            className="border-b"
                          >
                            <td className="p-2">{prod.nombre}</td>
                            <td className="p-2 text-center">
                              {prod.cantidad}
                            </td>
                            <td className="p-2 text-right">
                              {formatPrice(prod.precioUnitario)} €
                            </td>
                            <td className="p-2 text-right">
                              {formatPrice(prod.subtotal)} €
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Info adicional */}
                  <div className="mb-4 text-sm">
                    <p>
                      <strong>Método de envío:</strong>{" "}
                      {/* ✅ CORREGIDO: Datos planos */}
                      {pedido.envioMetodo || "–"}{" "}
                      {pedido.envioCoste
                        ? `(Coste: ${formatPrice(pedido.envioCoste)} €)`
                        : ""}
                    </p>
                  </div>

                  {/* Botón cerrar */}
                  <button
                    onClick={() => setPedidoAbierto(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
                  >
                    Cerrar detalles
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}