"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/components/Banner";
import ProductGrid from "@/components/ProductGrid";
import BannersSection from "@/components/BannersSection";
import BannerPrincipal from "@/components/BannerPrincipal";
import SeoText from "@/components/SeoText";
import SubscribeForm from "@/components/SubscribeForm";
import clienteAxios from "@/lib/axiosClient";

type Categoria = {
  _id: string;
  nombre: string;
};

type Producto = {
  _id: string;
  nombre: string;
  // añade aquí los campos que uses en ProductGrid (precio, imagenes, etc.)
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
  const [searchQuery, setSearchQuery] = useState("");
  const [productosDestacados, setProductosDestacados] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [busquedaActiva, setBusquedaActiva] = useState(false);

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const { data } = await clienteAxios.get<CategoriasResponse>("/categorias");
        if (data.ok) setCategories(data.categorias || []);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };
    cargarCategorias();
  }, []);

  // Buscar productos (destacados o por búsqueda)
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
      {/* 1. Banner */}
      <section className="max-w-7xl mx-auto">
        <Banner />
      </section>

      {/* 2. BannerPrincipal */}
      <section className="max-w-7xl mx-auto">
        <BannerPrincipal categories={categories} />
      </section>

      {/* 3. Productos Destacados / Búsqueda */}
      <section className="max-w-7xl mx-auto">
        <ProductGrid
          productosDestacados={productosDestacados}
          productosFiltrados={productosFiltrados}
          busquedaActiva={busquedaActiva}
        />
      </section>

      {/* 4. BannersSection */}
      <section className="max-w-7xl mx-auto">
        <BannersSection categories={categories} />
      </section>

      {/* 5. SEO + Newsletter */}
      <section className="max-w-6xl mx-auto">
        <SeoText />
        <SubscribeForm />
      </section>
    </div>
  );
}
