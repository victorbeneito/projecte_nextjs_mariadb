"use client";

import { useEffect, useState } from "react";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import toast from "react-hot-toast";

interface Coupon {
  id: string;
  codigo: string;
  descripcion: string;
  descuento: number;
  fechaExpiracion: string;
  usado?: boolean;
}

export default function CouponsPage() {
  const { token } = useClienteAuth();
  const [cupones, setCupones] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const loadCoupons = async () => {
      try {
        const res = await fetchWithAuth("/api/cupones", token);
        setCupones(res.coupons || []);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar los cupones");
      } finally {
        setLoading(false);
      }
    };
    loadCoupons();
  }, [token]);

  if (loading) return <p>Cargando cupones...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mis cupones</h1>

      {cupones.length === 0 ? (
        <p className="text-gray-500">No tienes cupones actualmente.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cupones.map((c) => {
            const expirado = new Date(c.fechaExpiracion) < new Date();
            const color = expirado
              ? "border-gray-300 bg-gray-100 text-gray-500"
              : c.usado
              ? "border-yellow-400 bg-yellow-50 text-yellow-700"
              : "border-green-500 bg-green-50 text-green-800";

            return (
              <div
                key={c.id}
                className={`border p-4 rounded-md shadow-sm ${color}`}
              >
                <h2 className="text-lg font-semibold">{c.codigo}</h2>
                <p className="text-sm">{c.descripcion}</p>
                <p className="mt-1 text-sm">
                  <strong>Descuento:</strong> {c.descuento}%
                </p>
                <p className="text-xs mt-2">
                  <strong>Expira:</strong>{" "}
                  {new Date(c.fechaExpiracion).toLocaleDateString()}
                </p>

                {expirado ? (
                  <p className="text-xs mt-2 text-red-500 font-medium">
                    Expirado
                  </p>
                ) : c.usado ? (
                  <p className="text-xs mt-2 text-yellow-600 font-medium">
                    Ya usado
                  </p>
                ) : (
                  <p className="text-xs mt-2 text-green-600 font-medium">
                    Disponible
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
