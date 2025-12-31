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

interface Pedido {
  _id: string;
  numeroPedido?: string;
  fechaPedido?: string;
  createdAt?: string;
  estado: string;
  envio: { metodo: string; coste: number };
  pago: { metodo: string; totalFinal: number; metodoPago?: string };
  productos: Producto[];
  clienteId?: string;
}

export default function OrdersPage() {
  const { token, cliente } = useClienteAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoAbierto, setPedidoAbierto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !cliente?._id) return;

    const fetchPedidos = async () => {
      try {
        // ✅ Usa el clienteId en la query para obtener solo sus pedidos
        const data = await fetchWithAuth(
          `/api/pedidos?clienteId=${cliente._id}`,
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

  const togglePedido = (id: string) => {
    setPedidoAbierto((prev) => (prev === id ? null : id));
  };

  if (loading) return <p>Cargando pedidos...</p>;
  if (!pedidos.length)
    return <p>No tienes pedidos registrados todavía.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Historial de pedidos</h1>

      <div className="divide-y divide-gray-200 border border-gray-200 rounded-md bg-white shadow-sm">
        {pedidos.map((pedido) => {
          const abierto = pedidoAbierto === pedido._id;
          const referencia =
            pedido.numeroPedido || pedido._id.slice(-6).toUpperCase();

          return (
            <div key={pedido._id} className="p-4">
              {/* --- Cabecera del pedido --- */}
              <button
                onClick={() => togglePedido(pedido._id)}
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
                    {pedido.pago?.metodo || "–"}
                  </p>
                </div>

                <div className="text-right">
                  <p>
                    <span className="font-semibold">Total:</span>{" "}
                    {pedido.pago?.totalFinal?.toFixed(2)} €
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
                        {pedido.productos.map((prod) => (
                          <tr
                            key={prod.productoId}
                            className="border-b"
                          >
                            <td className="p-2">{prod.nombre}</td>
                            <td className="p-2 text-center">
                              {prod.cantidad}
                            </td>
                            <td className="p-2 text-right">
                              {prod.precioUnitario.toFixed(2)} €
                            </td>
                            <td className="p-2 text-right">
                              {prod.subtotal.toFixed(2)} €
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
                      {pedido.envio?.metodo || "–"}{" "}
                      {pedido.envio?.coste
                        ? `(Coste: ${pedido.envio.coste} €)`
                        : ""}
                    </p>
                    <p>
                      <strong>Pago:</strong>{" "}
                      {pedido.pago?.metodo || "–"}
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


// "use client";

// import { useEffect, useState } from "react";
// import { useClienteAuth } from "@/context/ClienteAuthContext";
// import { fetchWithAuth } from "@/utils/fetchWithAuth";

// interface Producto {
//   productoId: string;
//   nombre: string;
//   cantidad: number;
//   precioUnitario: number;
//   subtotal: number;
// }

// interface Pedido {
//   _id: string;
//   numeroPedido?: string;
//   fechaPedido?: string;
//   createdAt?: string;
//   estado: string;
//   envio: { metodo: string; coste: number };
//   pago: { metodo: string; totalFinal: number; metodoPago?: string };
//   productos: Producto[];
// }

// export default function OrdersPage() {
//   const { token } = useClienteAuth();
//   const [pedidos, setPedidos] = useState<Pedido[]>([]);
//   const [pedidoAbierto, setPedidoAbierto] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!token) return;
//     const fetchPedidos = async () => {
//       try {
//         const data = await fetchWithAuth("/api/pedidos", token);
//         setPedidos(data.pedidos);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPedidos();
//   }, [token]);

//   const togglePedido = (id: string) => {
//     setPedidoAbierto((prev) => (prev === id ? null : id));
//   };

//   if (loading) return <p>Cargando pedidos...</p>;
//   if (!pedidos.length) return <p>No tienes pedidos registrados todavía.</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Historial de pedidos</h1>

//       <div className="divide-y divide-gray-200 border border-gray-200 rounded-md bg-white shadow-sm">
//         {pedidos.map((pedido) => {
//           const abierto = pedidoAbierto === pedido._id;
//           const referencia =
//             pedido.numeroPedido || pedido._id.slice(-6).toUpperCase();

//           return (
//             <div key={pedido._id} className="p-4">
//               {/* --- Cabecera del pedido --- */}
//               <button
//                 onClick={() => togglePedido(pedido._id)}
//                 className="w-full flex justify-between items-center text-left font-medium text-gray-800 hover:text-blue-600"
//               >
//                 <div>
//                   <p className="text-sm text-gray-500">
//                     <span className="font-semibold text-gray-800">
//                       Ref. pedido:
//                     </span>{" "}
//                     {referencia}
//                   </p>
//                   <p>
//                     <span className="font-semibold">Fecha:</span>{" "}
//                     {new Date(
//                       pedido.fechaPedido ?? pedido.createdAt ?? ""
//                     ).toLocaleDateString("es-ES")}
//                   </p>
//                   <p>
//                     <span className="font-semibold">Método de pago:</span>{" "}
//                     {pedido.pago?.metodo || "–"}
//                   </p>
//                 </div>

//                 <div className="text-right">
//                   <p>
//                     <span className="font-semibold">Total:</span>{" "}
//                     {pedido.pago?.totalFinal?.toFixed(2)} €
//                   </p>
//                   <p className="capitalize text-sm text-gray-600">
//                     Estado: {pedido.estado}
//                   </p>
//                 </div>
//               </button>

//               {/* --- Detalle desplegable con productos --- */}
//               {abierto && (
//                 <div className="mt-4 border-t border-gray-200 pt-4 animate-fade-in">
//                   <h3 className="text-lg font-semibold mb-3">Productos</h3>

//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm border-collapse mb-4">
//                       <thead>
//                         <tr className="border-b bg-gray-100">
//                           <th className="text-left p-2">Producto</th>
//                           <th className="p-2 text-center">Unidades</th>
//                           <th className="p-2 text-right">Precio</th>
//                           <th className="p-2 text-right">Subtotal</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {pedido.productos.map((prod) => (
//                           <tr key={prod.productoId} className="border-b">
//                             <td className="p-2">{prod.nombre}</td>
//                             <td className="p-2 text-center">{prod.cantidad}</td>
//                             <td className="p-2 text-right">
//                               {prod.precioUnitario.toFixed(2)} €
//                             </td>
//                             <td className="p-2 text-right">
//                               {prod.subtotal.toFixed(2)} €
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Info adicional */}
//                   <div className="mb-4 text-sm">
//                     <p>
//                       <strong>Método de envío:</strong>{" "}
//                       {pedido.envio?.metodo || "–"}{" "}
//                       {pedido.envio?.coste
//                         ? `(Coste: ${pedido.envio.coste} €)`
//                         : ""}
//                     </p>
//                     <p>
//                       <strong>Pago:</strong> {pedido.pago?.metodo || "–"}
//                     </p>
//                   </div>

//                   {/* Botón cerrar */}
//                   <button
//                     onClick={() => setPedidoAbierto(null)}
//                     className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
//                   >
//                     Cerrar detalles
//                   </button>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
