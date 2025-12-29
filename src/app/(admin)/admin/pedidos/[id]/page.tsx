"use client";
export const dynamic = "force-dynamic";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Pedido {
  _id: string;
  numeroPedido?: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    cp: string;
  };
  envio: {
    metodo: string;
    coste: number;
  };
  pago: {
    metodo: string;
    totalFinal: number;
  };
  productos: {
    productoId: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  estado: string;
  fecha: string;
  totalFinal?: number;
}

export default function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅  Solución oficial: desempaquetar los params con React.use()
  const { id } = React.use(params);
  const router = useRouter();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅  Obtener pedido
  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await fetch(`/api/pedidos/${id}`);
        const data = await res.json();
        setPedido(data.pedido);
        setEstado(data.pedido?.estado || "pendiente");
      } catch (err) {
        console.error("Error al obtener pedido:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPedido();
  }, [id]);

  // ✅  Actualizar pedido
  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) {
        alert("✅ Pedido actualizado correctamente");
        router.push("/admin/pedidos");
      } else {
        alert("Error al actualizar el pedido");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ✅  Renderizado
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando pedido...
      </div>
    );

  if (!pedido)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Pedido no encontrado.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8F8F5] py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">
          🧾 Detalles del Pedido
        </h1>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#6BAEC9]/10 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
            <div>
              <p className="text-gray-500 text-sm">ID Pedido:</p>
              <p className="font-mono text-[#6BAEC9]">{pedido._id}</p>
              <p className="mt-1 text-gray-700 text-sm">
      Nº Pedido:{" "}
      <span className="font-semibold">{pedido.numeroPedido}</span>
    </p>
              <p className="mt-2 text-gray-500 text-sm">
                Fecha:{" "}
                {new Date(pedido.fecha).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Estado del pedido:
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="border border-[#6BAEC9]/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#6BAEC9]"
              >
                <option value="pendiente">Pendiente</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Datos del cliente */}
          <section>
            <h2 className="text-xl font-semibold text-[#4A4A4A] mb-3">
              👤 Datos del Cliente
            </h2>
            <div className="text-gray-700 space-y-1 pl-2">
              <p>
                <strong>Nombre:</strong> {pedido.cliente.nombre}
              </p>
              <p>
                <strong>Email:</strong> {pedido.cliente.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {pedido.cliente.telefono}
              </p>
              <p>
                <strong>Dirección:</strong> {pedido.cliente.direccion},{" "}
                {pedido.cliente.cp} {pedido.cliente.ciudad}
              </p>
            </div>
          </section>

          {/* Envío */}
          <section>
            <h2 className="text-xl font-semibold text-[#4A4A4A] mb-3">🚚 Envío</h2>
            <p className="text-gray-700 pl-2">
              Método:{" "}
              {pedido.envio.metodo === "tienda"
                ? "🏬 Recoger en tienda"
                : "Ontime 24–72 h"}
              <br />
              Coste: <strong>{pedido.envio?.coste ? pedido.envio.coste.toFixed(2) : "0.00"} €</strong>
            </p>
          </section>

          {/* Pago */}
          <section>
            <h2 className="text-xl font-semibold text-[#4A4A4A] mb-3">💳 Pago</h2>
            <p className="text-gray-700 pl-2">
              Método:{" "}
              {pedido.pago.metodo === "tarjeta"
                ? "💳 Tarjeta (Redsys)"
                : pedido.pago.metodo === "paypal"
                ? "💰 PayPal"
                : pedido.pago.metodo === "transferencia"
                ? "🏦 Transferencia bancaria"
                : pedido.pago.metodo === "bizum"
                ? "📱 Bizum"
                : "💵 Contrareembolso"}
              <br />
              Total pagado:
<strong className="text-[#F7A38B] text-lg">
  {pedido.pago?.totalFinal ? pedido.pago.totalFinal.toFixed(2) : "0.00"} €
</strong>
            </p>
          </section>

          {/* Productos */}
          <section>
            <h2 className="text-xl font-semibold text-[#4A4A4A] mb-3">
              🛍️ Productos del Pedido
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F8F5]">
                  <tr>
                    <th className="text-left px-4 py-2">Producto</th>
                    <th className="text-center px-4 py-2">Cantidad</th>
                    <th className="text-center px-4 py-2">Unitario (€)</th>
                    <th className="text-right px-4 py-2">Subtotal (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.productos.map((p) => (
                    <tr key={p.productoId} className="border-t">
                      <td className="px-4 py-2">{p.nombre}</td>
                      <td className="px-4 py-2 text-center">{p.cantidad}</td>
                      <td className="px-4 py-2 text-center">
                        {p.precioUnitario.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-[#6BAEC9]">
                        {p.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 🧾 Total del pedido */}
<div className="text-right mt-4 pr-4 border-t pt-4">
  <p className="text-lg font-bold text-[#4A4A4A]">
    Total del Pedido:{" "}
    <span className="text-[#6BAEC9]">
      {pedido.pago?.totalFinal
  ? pedido.pago.totalFinal.toFixed(2)
  : pedido.totalFinal
  ? pedido.totalFinal.toFixed(2)
  : "0.00"} €

    </span>
  </p>
</div>

          </section>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => router.push("/admin/pedidos")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-gray-400 to-gray-300 hover:from-gray-500 hover:to-gray-400 shadow-md transition-all duration-300"
          >
            ← Volver a Pedidos
          </button>

          <button
            onClick={handleUpdate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6BAEC9] to-[#A8D7E6] hover:from-[#5FA0B3] hover:to-[#91C8D9] shadow-md transition-all duration-300"
          >
            💾 Actualizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}



// "use client";
// export const dynamic = "force-dynamic";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";


// interface Pedido {
//   _id: string;
//   cliente: {
//     nombre: string;
//     email: string;
//     telefono: string;
//     direccion: string;
//     ciudad: string;
//     cp: string;
//   };
//   envio: {
//     metodo: string;
//     coste: number;
//   };
//   pago: {
//     metodo: string;
//     totalFinal: number;
//   };
//   productos: {
//     productoId: string;
//     nombre: string;
//     cantidad: number;
//     precioUnitario: number;
//     subtotal: number;
//   }[];
//   estado: string;
//   fecha: string;
// }

// export default function PedidoDetallePage({ params }: { params: { id: string } }) {
//   const router = useRouter();
//   const [pedido, setPedido] = useState<Pedido | null>(null);
//   const [estado, setEstado] = useState("");
//   const [loading, setLoading] = useState(true);
//   const { id } = params;

//   useEffect(() => {
//     const fetchPedido = async () => {
//       try {
//         const res = await fetch(`/api/pedidos/${id}`);
//         const data = await res.json();
//         setPedido(data.pedido);
//         setEstado(data.pedido?.estado || "pendiente");
//       } catch (err) {
//         console.error("Error al obtener pedido:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPedido();
//   }, [id]);

//   const handleUpdate = async () => {
//     try {
//       const res = await fetch(`/api/pedidos/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ estado }),
//       });
//       if (res.ok) {
//         alert("✅ Pedido actualizado correctamente");
//         router.push("/admin/pedidos");
//       } else {
//         alert("Error al actualizar el pedido");
//       }
//     } catch (err) {
//       console.error("Error:", err);
//     }
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-500">
//         Cargando pedido...
//       </div>
//     );
//   if (!pedido)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-500">
//         Pedido no encontrado.
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-[#F8F8F5] py-8 px-6">
//       <div className="max-w-5xl mx-auto">
//         <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">
//           🧾 Detalles del Pedido
//         </h1>

//         {/* Card principal */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#6BAEC9]/10 space-y-6">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
//             <div>
//               <p className="text-gray-500 text-sm">ID Pedido:</p>
//               <p className="font-mono text-[#6BAEC9]">{pedido._id}</p>
//               <p className="mt-2 text-gray-500 text-sm">
//                 Fecha:{" "}
//                 {new Date(pedido.fecha).toLocaleDateString("es-ES", {
//                   day: "2-digit",
//                   month: "2-digit",
//                   year: "numeric",
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </p>
//             </div>

//             <div className="mt-4 md:mt-0">
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Estado del pedido:
//               </label>
//               <select
//                 value={estado}
//                 onChange={(e) => setEstado(e.target.value)}
//                 className="border border-[#6BAEC9]/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#6BAEC9]"
//               >
//                 <option value="pendiente">Pendiente</option>
//                 <option value="enviado">Enviado</option>
//                 <option value="entregado">Entregado</option>
//                 <option value="cancelado">Cancelado</option>
//               </select>
//             </div>
//           </div>

//           {/* Datos del cliente */}
//           <section>
//             <h2 className="text-xl font-semibold text-[#4A4A4A] mb-3">
//               👤 Datos del Cliente
//             </h2>
//             <div className="text-gray-700 space-y-1 pl-2">
//               <p>
//                 <strong>Nombre:</strong> {pedido.cliente.nombre}
//               </p>
//               <p>
//                 <strong>Email:</strong> {pedido.cliente.email}
//               </p>
//               <p>
//                 <strong>Teléfono:</strong> {pedido.cliente.telefono}
//               </p>
//               <p>
//                 <strong>Dirección:</strong> {pedido.cliente.direccion},{" "}
//                 {pedido.cliente.cp} {pedido.cliente.ciudad}
//               </p>
//             </div>
//           </section>

//           {/* Envío */}
//           <section>
//             <h2 className="text-xl font-semibold text-[#4A4A4A] mb-3">
//               🚚 Envío
//             </h2>
//             <p className="text-gray-700 pl-2">
//               Método:{" "}
//               {pedido.envio.metodo === "tienda"
//                 ? "🏬 Recoger en tienda"
//                 : "Ontime 24–72 h"}
//               <br />
//               Coste: <strong>{pedido.envio.coste.toFixed(2)} €</strong>
//             </p>
//           </section>

//           {/* Pago */}
//           <section>
//             <h2 className="text-xl font-semibold text-[#4A4A4A] mb-3">
//               💳 Pago
//             </h2>
//             <p className="text-gray-700 pl-2">
//               Método:{" "}
//               {pedido.pago.metodo === "tarjeta"
//                 ? "💳 Tarjeta (Redsys)"
//                 : pedido.pago.metodo === "paypal"
//                 ? "💰 PayPal"
//                 : pedido.pago.metodo === "transferencia"
//                 ? "🏦 Transferencia bancaria"
//                 : pedido.pago.metodo === "bizum"
//                 ? "📱 Bizum"
//                 : "💵 Contrareembolso"}
//               <br />
//               Total pagado:{" "}
//               <strong className="text-[#F7A38B] text-lg">
//                 {pedido.pago.totalFinal.toFixed(2)} €
//               </strong>
//             </p>
//           </section>

//           {/* Productos */}
//           <section>
//             <h2 className="text-xl font-semibold text-[#4A4A4A] mb-3">
//               🛍️ Productos del Pedido
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-[#F8F8F5]">
//                   <tr>
//                     <th className="text-left px-4 py-2">Producto</th>
//                     <th className="text-center px-4 py-2">Cantidad</th>
//                     <th className="text-center px-4 py-2">Unitario (€)</th>
//                     <th className="text-right px-4 py-2">Subtotal (€)</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {pedido.productos.map((p) => (
//                     <tr key={p.productoId} className="border-t">
//                       <td className="px-4 py-2">{p.nombre}</td>
//                       <td className="px-4 py-2 text-center">{p.cantidad}</td>
//                       <td className="px-4 py-2 text-center">
//                         {p.precioUnitario.toFixed(2)}
//                       </td>
//                       <td className="px-4 py-2 text-right font-semibold text-[#6BAEC9]">
//                         {p.subtotal.toFixed(2)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </section>
//         </div>

//         {/* Botones de acción */}
//         <div className="flex justify-end gap-4 mt-8">
//           <button
//             onClick={() => router.push("/admin/pedidos")}
//             className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-gray-400 to-gray-300 hover:from-gray-500 hover:to-gray-400 shadow-md transition-all duration-300"
//           >
//             ← Volver a Pedidos
//           </button>

//           <button
//             onClick={handleUpdate}
//             className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6BAEC9] to-[#A8D7E6] hover:from-[#5FA0B3] hover:to-[#91C8D9] shadow-md transition-all duration-300"
//           >
//             💾 Actualizar Pedido
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

