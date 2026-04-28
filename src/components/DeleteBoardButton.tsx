"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteBoard } from "@/lib/actions/boards";

export default function DeleteBoardButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => {
        if (confirm("Tahta silinsin mi? Tüm sütunlar ve kartlar silinir.")) {
          start(() => {
            deleteBoard(id);
          });
        }
      }}
      disabled={pending}
      className="text-slate-400 hover:text-red-600 mt-3 self-end"
      aria-label="Tahtayı sil"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
