"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface Cupon {
  id: number;
  codigo: string;
  tipo_descuento: "porcentaje" | "fijo";
  valor_descuento: number;
  cantidad_total: number;
  usos_consumidos: number;
  restantes: number;
  limite_usuario: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export default function CuponesPage() {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [formData, setFormData] = useState({
    codigo: "",
    tipo_descuento: "porcentaje" as any,
    valor_descuento: 0,
    cantidad_total: 100,
    limite_usuario: 1,
    fecha_inicio: "",
    fecha_fin: ""
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCupones();
  }, []);

  const fetchCupones = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Cupon[]>("/api/cupones");
      console.log("Cupones:", res.data); // DEBUG
      setCupones(res.data);
    } catch (error) {
      console.error("Error fetching cupones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (editingId) {
      await axios({
        method: 'PUT' as const,
        url: '/api/cupones',
        data: { id: editingId, ...formData }
      });
      setEditingId(null);
    } else {
      await axios.post("/api/cupones", formData);
    }
    // Limpiar...
    setFormData({
      codigo: "",
      tipo_descuento: "porcentaje" as any,
      valor_descuento: 0,
      cantidad_total: 100,
      limite_usuario: 1,
      fecha_inicio: "",
      fecha_fin: ""
    });
    fetchCupones();
    alert(editingId ? "Actualizado!" : "Creado!");
  } catch (error: any) {
    alert(error.response?.data?.error || "Error");
  }
};


  const handleEdit = (cupon: Cupon) => {
    setFormData({
      codigo: cupon.codigo,
      tipo_descuento: cupon.tipo_descuento as "porcentaje" | "fijo",
      valor_descuento: cupon.valor_descuento,
      cantidad_total: cupon.cantidad_total,
      limite_usuario: cupon.limite_usuario,
      fecha_inicio: cupon.fecha_inicio.slice(0, 16), // Formato datetime-local
      fecha_fin: cupon.fecha_fin.slice(0, 16)
    });
    setEditingId(cupon.id);
  };

  const handleDelete = async (id: number) => {
  if (!confirm(`¿Eliminar cupón "${cupones.find(c => c.id === id)?.codigo}"?`)) return;
  try {
    await axios({
      method: 'DELETE' as const,
      url: '/api/cupones',
      data: { id }
    });
    fetchCupones();
    alert("Cupón eliminado!");
  } catch (error) {
    alert("Error al eliminar");
  }
};

  const handleClear = () => {
    setFormData({
      codigo: "",
      tipo_descuento: "porcentaje",
      valor_descuento: 0,
      cantidad_total: 100,
      limite_usuario: 1,
      fecha_inicio: "",
      fecha_fin: ""
    });
    setEditingId(null);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Cupones</h1>
        <button 
          onClick={fetchCupones}
          disabled={loading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          {loading ? "Cargando..." : "🔄 Refrescar"}
        </button>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Código Cupón *</label>
          <input 
            type="text" 
            required
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            placeholder="EJ: VERANO2026"
            value={formData.codigo}
            onChange={e => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo Descuento *</label>
          <select 
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={formData.tipo_descuento}
            onChange={e => setFormData({...formData, tipo_descuento: e.target.value as any})}
          >
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="fijo">Importe Fijo (€)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Valor ({formData.tipo_descuento === 'porcentaje' ? '%' : '€'}) *
          </label>
          <input 
            type="number" 
            required
            min="0" 
            max={formData.tipo_descuento === 'porcentaje' ? "100" : ""}
            step={formData.tipo_descuento === 'porcentaje' ? "0.1" : "0.01"}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={formData.valor_descuento}
            onChange={e => setFormData({...formData, valor_descuento: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cantidad Total *</label>
          <input 
            type="number" 
            required
            min="1"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={formData.cantidad_total}
            onChange={e => setFormData({...formData, cantidad_total: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Usos por Cliente *</label>
          <input 
            type="number" 
            required
            min="1"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={formData.limite_usuario}
            onChange={e => setFormData({...formData, limite_usuario: Number(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha Inicio *</label>
          <input 
            type="datetime-local" 
            required
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={formData.fecha_inicio}
            onChange={e => setFormData({...formData, fecha_inicio: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha Fin *</label>
          <input 
            type="datetime-local" 
            required
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={formData.fecha_fin}
            onChange={e => setFormData({...formData, fecha_fin: e.target.value})}
          />
        </div>

        <div className="md:col-span-2 mt-4 flex gap-2">
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition"
          >
            {editingId ? `✏️ Actualizar ${formData.codigo}` : "➕ Crear Cupón"}
          </button>
          {(formData.codigo || editingId) && (
            <button 
              type="button"
              onClick={handleClear}
              className="flex-1 bg-gray-500 text-white py-2 rounded font-medium hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 transition"
            >
              🗑️ Limpiar
            </button>
          )}
        </div>
      </form>

      {/* TABLA */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
              <th className="p-3 font-semibold">Código</th>
              <th className="p-3 font-semibold">Descuento</th>
              <th className="p-3 font-semibold">Restantes</th>
              <th className="p-3 font-semibold">Usos Total</th>
              <th className="p-3 font-semibold">Validez</th>
              <th className="p-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 animate-pulse">
                  🔄 Cargando cupones...
                </td>
              </tr>
            ) : cupones.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No hay cupones creados. ¡Crea el primero!
                </td>
              </tr>
            ) : (
              cupones.map(cupon => (
                <tr key={cupon.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="p-3 font-bold text-blue-600 dark:text-blue-400">
                    {cupon.codigo}
                  </td>
                  <td className="p-3 font-semibold">
                    <span className="text-lg">
                      {cupon.valor_descuento.toFixed(2)} 
                      {cupon.tipo_descuento === 'porcentaje' ? '%' : '€'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      cupon.restantes === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                      cupon.restantes < 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {cupon.restantes}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                    {cupon.usos_consumidos}/{cupon.cantidad_total}
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(cupon.fecha_inicio).toLocaleDateString('es-ES')} -{' '}
                    {new Date(cupon.fecha_fin).toLocaleDateString('es-ES')}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button 
                      onClick={() => handleEdit(cupon)}
                      className="text-yellow-500 hover:text-yellow-600 font-medium px-3 py-1 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900 transition"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(cupon.id)}
                      className="text-red-500 hover:text-red-600 font-medium px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900 transition"
                    >
                      🗑️ Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
        Total cupones: {cupones.length} | Usos totales: {cupones.reduce((total, c) => total + c.usos_consumidos, 0)}
      </div>
    </div>
  );
}
