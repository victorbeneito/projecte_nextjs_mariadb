"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  // Redirigir solo desde la página de login si ya está logueado
  useEffect(() => {
    if (user) {
      router.replace("/admin");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (data.ok && data.token) {
        login(data.token);
        router.push("/admin");
      } else {
        setError(data.error || "Error en login");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Mientras decide si redirigir o no, puedes opcionalmente mostrar un loader
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6BAEC9] via-[#A8D7E6] to-[#F8F8F5] flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full border border-white/50">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#4A4A4A] mb-4">
            El Hogar de tus Sueños
          </h1>
          <p className="text-xl text-[#6BAEC9]">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-lg font-semibold text-[#4A4A4A] mb-3">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-5 border border-[#DDC9A3]/50 rounded-2xl bg-[#F8F8F5] text-lg focus:ring-4 focus:ring-[#6BAEC9]/30 focus:border-[#6BAEC9] transition-all"
              placeholder="correo admin"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-[#4A4A4A] mb-3">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-5 border border-[#DDC9A3]/50 rounded-2xl bg-[#F8F8F5] text-lg focus:ring-4 focus:ring-[#6BAEC9]/30 focus:border-[#6BAEC9] transition-all"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6BAEC9] to-[#A8D7E6] text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Iniciando..." : "🚀 Entrar al Panel"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#4A4A4A]/70">
            ¿Usuario nuevo?{" "}
            <Link
              href="/register"
              className="text-[#6BAEC9] font-semibold hover:underline"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
