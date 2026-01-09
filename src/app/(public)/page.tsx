"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Banner from "@/components/Banner";
import ProductGrid from "@/components/ProductGrid";
import BannersSection from "@/components/BannersSection"; // Revisa también este archivo si usa categorías
import BannerPrincipal from "@/components/BannerPrincipal";
import SeoText from "@/components/SeoText";
import SubscribeForm from "@/components/SubscribeForm";
import clienteAxios from "@/lib/axiosClient";

// Definimos los tipos alineados con MariaDB (ids numéricos)
type Categoria = {
  id: number;
  nombre: string;
};

type Producto = {
  id: number;
  nombre: string;
  precio: number;   // Añade campos básicos para evitar errores de TS
  imagenes: string[];
  stock: number;
};

type CategoriasResponse = {
  ok: boolean;
  categorias: Categoria[];
};

type ProductosResponse = {
  ok: boolean;
  productos: Producto[];
};

export default function HomePage() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // Aunque no veo el input aquí, asumo que está en BannerPrincipal o Navbar
  const [productosDestacados, setProductosDestacados] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [busquedaActiva, setBusquedaActiva] = useState(false);

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const { data } = await clienteAxios.get<CategoriasResponse>("/categorias"); // Asegúrate de tener esta ruta API
        if (data.ok) setCategories(data.categorias || []);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };
    cargarCategorias();
  }, []);

  // Buscar productos
  useEffect(() => {
    const buscarProductos = async () => {
      try {
        if (!searchQuery.trim()) {
          const { data } = await clienteAxios.get<ProductosResponse>("/productos");
          if (data.ok) {
            setProductosDestacados(data.productos);
            setProductosFiltrados([]);
            setBusquedaActiva(false);
          }
        } else {
          const { data } = await clienteAxios.get<ProductosResponse>(
            `/productos?q=${encodeURIComponent(searchQuery)}`
          );
          if (data.ok) {
            setProductosFiltrados(data.productos);
            setBusquedaActiva(true);
          }
        }
      } catch (error) {
        console.error("Error fetching productos:", error);
      }
    };

    buscarProductos();
  }, [searchQuery]);

  return (
    <div className="bg-fondo dark:bg-darkBg bg-w-full">
      <section className="max-w-7xl mx-auto">
        <Banner />
      </section>

      <section className="max-w-7xl mx-auto">
        {/* Si aquí salía error, asegúrate de haber modificado BannerPrincipal.tsx para aceptar 'id: number' */}
        <BannerPrincipal categories={categories} />
      </section>

      <section className="max-w-7xl mx-auto">
        {/* Si aquí salía error, asegúrate de haber modificado ProductGrid.tsx para aceptar 'id: number' */}
        <ProductGrid
          productosDestacados={productosDestacados}
          productosFiltrados={productosFiltrados}
          busquedaActiva={busquedaActiva}
        />
      </section>

      <section className="max-w-7xl mx-auto">
        {/* Posiblemente tengas que actualizar BannersSection también si usa categorías */}
        <BannersSection categories={categories} />
      </section>

      <section className="max-w-6xl mx-auto">
        <SeoText />
        <SubscribeForm />
      </section>
    </div>
  );
}