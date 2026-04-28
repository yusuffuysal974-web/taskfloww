"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import type { Card } from "@/lib/types";
import { cn } from "@/lib/utils";
import { deleteCard, updateCard } from "@/lib/actions/cards";

type Props = {
  card: Card;
  boardId: string;
  onDeleted: () => void;
  onUpdated: (card: Card) => void;
};

export default function KanbanCard({ card, boardId, onDeleted, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");

  const sortable = useSortable({
    id: card.id,
    data: { type: "card" },
  });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  async function save() {
    const t = title.trim();
    if (!t) return;
    const updated = { ...card, title: t, description };
    onUpdated(updated);
    setOpen(false);
    await updateCard(card.id, boardId, { title: t, description });
  }

  async function handleDelete() {
    if (!confirm("Kart silinsin mi?")) return;
    onDeleted();
    setOpen(false);
    await deleteCard(card.id, boardId);
  }

  return (
    <>
      <div
        ref={sortable.setNodeRef}
        style={style}
        {...sortable.attributes}
        {...sortable.listeners}
        onClick={(e) => {
          // Avoid opening modal during drag
          if (sortable.isDragging) return;
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "bg-white border border-slate-200 rounded-md p-3 shadow-sm hover:shadow-md hover:border-slate-300 cursor-grab active:cursor-grabbing touch-none select-none",
          sortable.isDragging && "opacity-40"
        )}
      >
        <p className="text-sm font-medium text-navy-900 break-words">{card.title}</p>
        {card.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.description}</p>
        )}
      </div>

      {/* Edit Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-navy-900 mb-4">Kart düzenle</h2>
            <label className="block text-xs text-slate-500 mb-1">Başlık</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <label className="block text-xs text-slate-500 mb-1">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
            <div className="flex justify-between">
              <button
                onClick={handleDelete}
                className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-md flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" /> Sil
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  İptal
                </button>
                <button
                  onClick={save}
                  className="px-4 py-2 bg-navy-900 text-white rounded-md hover:bg-navy-800"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
