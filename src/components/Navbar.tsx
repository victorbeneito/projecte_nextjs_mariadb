"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { getCart } from "@/lib/cartService";
import { FaShoppingCart } from "react-icons/fa";

import { useDebounce } from "use-debounce";

type Categoria = {
  id: number;
  nombre: string;
};

type NavbarProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  categories: Categoria[];
};

export default function Navbar({
  darkMode,
  setDarkMode,
  categories = [],
}: NavbarProps) {
  const router = useRouter();
  const { cliente, logout } = useClienteAuth();
  const [cartCount, setCartCount] = useState(0);

  // 🔍 Estado del buscador
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 400); // espera 0.4 s antes de aplicar la búsqueda

  useEffect(() => {
  const query = debouncedSearch.trim();
  if (!query) return; // ❌ no hace nada si está vacío
  router.push(`/productos?q=${encodeURIComponent(query)}`);
}, [debouncedSearch, router]);

  // 🧺 Contador de carrito
  const actualizarContador = () => {
    const cart = getCart();
    const totalCantidad = cart.reduce((acc, item) => acc + item.cantidad, 0);
    setCartCount(totalCantidad);
  };

  // 🧠 Escuchar cambios en el carrito
  useEffect(() => {
    actualizarContador();
    const handleStorageChange = () => actualizarContador();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="flex justify-between items-center bg-terciary text-neutral px-8 py-2 font-poppins dark:bg-darkNavBg dark:text-darkNavText transition-colors duration-300">
      {/* Izquierda - categorías */}
      <div className="flex space-x-6 overflow-x-auto">
        <Link href="/" className="hover:text-primary">
          Inicio
        </Link>

        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${cat.id}`}
            className="hover:text-primary text-neutral dark:text-darkNavText whitespace-nowrap"
          >
            {cat.nombre}
          </Link>
        ))}
      </div>

      {/* Derecha - búsqueda, modo oscuro, usuario, carrito */}
      <div className="flex items-center space-x-4">
        {/* 🔍 Buscador live */}
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1 rounded-md text-black"
        />

        {/* 🌙 Dark mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark Mode"
          className="bg-primary text-white rounded-full p-2 hover:bg-primaryHover transition-colors duration-300"
        >
          {darkMode ? "🌞" : "🌙"}
        </button>

        {/* 🛒 Carrito */}
        <Link href="/carrito" className="relative">
          <span className="text-2xl">
            <FaShoppingCart />
          </span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {/* 👤 Usuario */}
        {cliente ? (
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="px-3 py-1 rounded-xl bg-primary text-white font-semibold hover:bg-primaryHover transition"
            >
              Hola, {cliente.nombre}
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primaryHover transition"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}

