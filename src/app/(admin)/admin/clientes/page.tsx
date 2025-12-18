'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";


interface Cliente {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [editando, setEditando] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      if (data.ok) setClientes(data.clientes || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editando ? 'PUT' : 'POST';
      const url = editando ? `/api/clientes/${editando}` : '/api/clientes';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchClientes();
        setFormData({ nombre: '', email: '', telefono: '' });
        setEditando(null);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono
    });
    setEditando(cliente._id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar cliente?')) {
      await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
      fetchClientes();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">👥 Gestión Clientes</h1>

        {/* Botón volver al panel de administración */}
<div className="mb-12">
  <button
    onClick={() => router.push("/admin")}
    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6BAEC9] to-[#A8D7E6] hover:from-[#5FA0B3] hover:to-[#91C8D9] shadow-md transition-all duration-300"
  >
    ← Volver al Panel de Administración
  </button>
</div>

        
        {/* FORMULARIO */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Nombre completo"
              className="p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200"
              required
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@ejemplo.com"
              className="p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200"
              required
            />
            <input
              name="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              placeholder="Teléfono"
              className="p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-600"
            >
              {loading ? '⏳ Guardando...' : (editando ? '✏️ Actualizar' : '➕ Nuevo Cliente')}
            </button>
          </form>
        </div>

        {/* LISTA */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-2xl font-bold">Clientes ({clientes.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Nombre</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Teléfono</th>
                  <th className="px-8 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente._id} className="border-t hover:bg-gray-50">
                    <td className="px-8 py-6 font-medium text-gray-900">{cliente.nombre}</td>
                    <td className="px-8 py-6 text-gray-600">{cliente.email}</td>
                    <td className="px-8 py-6 text-gray-600">{cliente.telefono}</td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
