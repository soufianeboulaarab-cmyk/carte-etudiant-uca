"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { saveToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.endsWith("@uca.ma")) {
      setError("Seuls les emails @uca.ma sont autorisés.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn.email({ email, password });
      console.log('BetterAuth response:', res);
      if (res.error) {
        setError(res.error.message || "Email ou mot de passe incorrect.");
        return;
      }
      if (res.data?.token) {
        saveToken(res.data.token);
      }
      if ((res.data?.user as { role?: string } | undefined)?.role === 'SCOLARITE') {
        router.push("/");
      } else {
        router.push("/card");
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#102447] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-[#102447] mb-2">E-Carte UCA</h1>
        <p className="text-gray-500 text-sm mb-6">
          Connectez-vous avec votre email @uca.ma
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@uca.ma"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#102447]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#102447]"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#102447] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1a3a6b] transition disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Pas encore de compte ?{" "}
          <a href="/register" className="text-[#102447] font-medium underline">
            S&apos;inscrire
          </a>
        </p>
      </div>
    </main>
  );
}