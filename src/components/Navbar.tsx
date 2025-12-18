"use client";

import React from "react";
import Link from "next/link";


type Categoria = {
  _id: string;
  nombre: string;
};

type NavbarProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  categories: any[];
  onSearch?: (text: string) => void;
  searchQuery?: string;
};

export default function Navbar({
  darkMode,
  setDarkMode,
  categories = [],
  onSearch,
  searchQuery = "",
}: NavbarProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSearch?.(e.target.value);
  }

  return (
    <nav className="flex justify-between items-center bg-terciary text-neutral text-stroke-2 text-stroke-black px-8 py-2 font-poppins dark:bg-darkNavBg dark:text-darkNavText transition-colors duration-300">
      <div className="flex space-x-6 overflow-x-auto">
        <Link href="/" className="hover:text-primary">
          Inicio
        </Link>
        {categories.map((cat: Categoria) => (
          <Link
            key={cat._id}
            href={`/categorias/${cat._id}`}
            className="hover:text-primary text-neutral dark:text-darkNavText whitespace-nowrap"
          >
            {cat.nombre}
          </Link>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={handleChange}
          className="px-3 py-1 rounded-md text-black"
        />

        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark Mode"
          className="bg-primary text-neutral rounded-full p-2 hover:bg-primaryHover transition-colors duration-300"
        >
          {darkMode ? "🌞" : "🌙"}
        </button>

        {/* <button className="bg-primary text-neutral px-4 py-2 rounded-base" disabled>
          Iniciar sesión
        </button> */}

        <Link
          href="/auth"
          className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primaryHover"
        >
          Iniciar sesión
        </Link>
      </div>
    </nav>
  );
}
