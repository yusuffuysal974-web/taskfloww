"use client";

import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/actions/auth";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await signUp(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">TaskFlow</h1>
        <p className="text-slate-500 text-sm mb-6">Yeni hesap oluştur</p>
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
            minLength={6}
            placeholder="Şifre (en az 6 karakter)"
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-navy-900 text-white py-2 rounded-md hover:bg-navy-800 disabled:opacity-50"
          >
            {pending ? "Oluşturuluyor…" : "Hesap oluştur"}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4 text-center">
          Hesabın var mı?{" "}
          <Link href="/login" className="text-accent-dark font-semibold hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </main>
  );
}
