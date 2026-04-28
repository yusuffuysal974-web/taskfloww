"use client";

import { useState } from "react";
import { createBoard } from "@/lib/actions/boards";

export default function CreateBoardForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await createBoard(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
    // On success: createBoard calls redirect(), so this code path is never reached.
  }

  return (
    <form action={action} className="mb-8">
      <div className="flex gap-2">
        <input
          name="title"
          placeholder="Yeni tahta başlığı (örn. Sprint 12)"
          required
          className="flex-1 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-dark disabled:opacity-50"
        >
          {pending ? "..." : "Oluştur"}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </form>
  );
}
