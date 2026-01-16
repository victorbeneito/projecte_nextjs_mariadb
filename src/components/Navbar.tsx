"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { getCart } from "@/lib/cartService";
import { FaShoppingCart } from "react-icons/fa";
import { useDebounce } from "use-debounce";
import { useTheme } from "next-themes"; // 👈 IMPORTANTE

type Categoria = {
  id: number;
  nombre: string;
};

export default function Navbar() {
  const router = useRouter();
  const { cliente, logout } = useClienteAuth();
  
  // 🌓 Hook del tema (next-themes)
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 400);
  const [categories, setCategories] = useState<Categoria[]>([]);

  // 1. Evitar error de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Cargar categorías
  useEffect(() => {
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.categorias) {
          setCategories(data.categorias);
        }
      })
      .catch((err) => console.error("Error cargando menú:", err));
  }, []);

  // 3. Buscador
  useEffect(() => {
    const query = debouncedSearch.trim();
    if (!query) return;
    router.push(`/productos?q=${encodeURIComponent(query)}`);
  }, [debouncedSearch, router]);

  // 4. Contador Carrito
  const actualizarContador = () => {
    const cart = getCart();
    const totalCantidad = cart.reduce((acc, item) => acc + item.cantidad, 0);
    setCartCount(totalCantidad);
  };

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

  // Evitamos renderizar hasta que sepamos el tema (para evitar parpadeos)
  if (!mounted) return null;

  return (
    <nav className="flex justify-between items-center bg-terciary text-neutral px-8 py-2 font-poppins dark:bg-darkNavBg dark:text-darkNavText transition-colors duration-300">
      
      {/* Izquierda - categorías */}
      <div className="flex space-x-6 overflow-x-auto items-center">
        <Link href="/" className="hover:text-primary font-bold">
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

      {/* Derecha */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1 rounded-md text-black border border-gray-300 focus:outline-none focus:border-primary"
        />

        {/* BOTÓN MODO OSCURO AUTOMÁTICO */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-primary hover:bg-primaryHover text-white rounded-full p-2 transition-colors w-10 h-10 flex items-center justify-center"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? "🌞" : "🌙"}
        </button>

        <Link href="/carrito" className="relative text-2xl hover:text-primary transition-colors">
          <FaShoppingCart />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {cliente ? (
          <div className="flex gap-2 items-center">
            <Link href="/account" className="px-3 py-1 bg-primary text-white rounded hover:bg-primaryHover transition-colors">
              Hola, {cliente.nombre}
            </Link>
            <button 
              onClick={handleLogout} 
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Salir
            </button>
          </div>
        ) : (
          <Link href="/auth" className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryHover transition-colors">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}