"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await signIn(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">TaskFlow</h1>
        <p className="text-slate-500 text-sm mb-6">Hesabınla giriş yap</p>
        <form action={action} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="E-posta"
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Şifre"
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-navy-900 text-white py-2 rounded-md hover:bg-navy-800 disabled:opacity-50"
          >
            {pending ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4 text-center">
          Hesabın yok mu?{" "}
          <Link href="/signup" className="text-accent-dark font-semibold hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </main>
  );
}
