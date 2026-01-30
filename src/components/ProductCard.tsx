"use client";

import React from "react";
import Link from "next/link";

interface ProductCardProps {
  producto: any;
}

export default function ProductCard({ producto }: ProductCardProps) {
  if (!producto) return null;

  const urlImagen =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes[0]
      : "/img/no-image.jpg";

  return (
    <Link href={`/productos/${producto.id}`} className="block">
      <div
        className="font-poppins bg-white rounded-lg shadow-sm p-4 flex flex-col items-center border border-gray-200
                   hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full max-w-[360px] mx-auto
                   cursor-pointer dark:bg-darkNavBg dark:text-darkNavText"
      >
        <div>
          <img
            src={urlImagen}
            alt={producto.nombre}
            className="w-full h-72 object-contain mb-3 rounded-md"
          />
          <div className="p-4 text-center">
            <h3 className="text-md font-semibold text-center mb-1 line-clamp-2">
              {producto.nombre}
            </h3>

            <p className="font-orienta text-gray-500 text-sm text-center mb-2 dark:text-darkNavText">
              {typeof producto.categoria === "object"
                ? producto.categoria?.nombre
                : "Sin categoría"}
            </p>

            <p className="text-accent font-bold mb-3 dark:text-darkNavText">
              {producto.precio
                ? `${producto.precio.toFixed(2)} €`
                : "Sin precio"}
            </p>
          </div>
        </div>

        <div className="p-3">
          <button
            type="button"
            className="mt-auto bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primaryHover transition-colors duration-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            onClick={(e) => e.preventDefault()}
          >
            Comprar
          </button>
        </div>
      </div>
    </Link>
  );
}
