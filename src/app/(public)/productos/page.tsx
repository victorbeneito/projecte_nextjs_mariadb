// src/app/(public)/productos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard'; // ajusta la ruta real

export default function ProductosPage() {


  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {



    const cargarProductos = async () => {
      try {
        const res = await fetch('/api/productos', {cache: 'no-store', });
        const data = await res.json();

        // según tu backend puede ser data o data.productos
        const lista = Array.isArray(data) ? data : data.productos;
        setProductos(lista || []);
      } catch (err: any) {
        setError('No se pudieron cargar los productos');
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  if (cargando) {
    return (
      <main className="min-h-screen bg-fondo px-4 py-12">
        <div className="max-w-5xl mx-auto text-[#777777]">Cargando productos...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-fondo px-4 py-12">
        <div className="max-w-5xl mx-auto text-red-500">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-fondo px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#333333] mb-6">
          Productos
        </h1>

        {productos.length === 0 ? (
          <p className="text-[#777777]">
            No hay productos disponibles.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((p) => (
              <ProductCard key={p._id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
