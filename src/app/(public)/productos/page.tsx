'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

export default function ProductosPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() || ''; // ✅ lee ?q=

  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true);
        // ✅ Si hay palabra, la añadimos al fetch
        const url = q
          ? `/api/productos?q=${encodeURIComponent(q)}`
          : '/api/productos';

        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        console.log('🧾 API Productos:', data);

        const lista = Array.isArray(data) ? data : data.productos;
        setProductos(lista || []);
      } catch (err: any) {
        setError('No se pudieron cargar los productos');
      } finally {
        setCargando(false);
      }
    };
    cargarProductos();
  }, [q]); // ✅ vuelve a ejecutarse al cambiar el texto en URL

  if (cargando) {
    return (
      <main className="min-h-screen bg-fondo px-4 py-12">
        <div className="max-w-5xl mx-auto text-[#777777]">
          Cargando productos...
        </div>
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
          {q ? `Resultados para "${q}"` : 'Productos'}
        </h1>

        {productos.length === 0 ? (
          <p className="text-[#777777]">
            {q
              ? `No se encontraron productos con "${q}".`
              : 'No hay productos disponibles.'}
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
