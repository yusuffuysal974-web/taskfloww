"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import KanbanCard from "./KanbanCard";
import { createCard } from "@/lib/actions/cards";
import { deleteColumn, renameColumn } from "@/lib/actions/columns";
import type { Card, Column } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  column: Column;
  cards: Card[];
  boardId: string;
  onCardCreated: (card: Card) => void;
  onCardDeleted: (cardId: string) => void;
  onCardUpdated: (card: Card) => void;
  onColumnDeleted: (colId: string) => void;
  onColumnRenamed: (colId: string, title: string) => void;
};

export default function KanbanColumn({
  column,
  cards,
  boardId,
  onCardCreated,
  onCardDeleted,
  onCardUpdated,
  onColumnDeleted,
  onColumnRenamed,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  // Sortable for the column itself (provides droppable behavior too)
  const sortable = useSortable({
    id: column.id,
    data: { type: "column" },
  });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  const cardIds = cards.map((c) => c.id);

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    const t = newCardTitle.trim();
    if (!t) return;
    setNewCardTitle("");
    setAdding(false);
    const res = await createCard(column.id, boardId, t);
    if (res.ok && res.card) onCardCreated(res.card as Card);
  }

  async function handleRename() {
    const t = editTitle.trim();
    if (!t || t === column.title) {
      setEditing(false);
      setEditTitle(column.title);
      return;
    }
    setEditing(false);
    onColumnRenamed(column.id, t);
    await renameColumn(column.id, t, boardId);
  }

  async function handleDelete() {
    if (!confirm(`"${column.title}" sütunu silinsin mi?`)) return;
    onColumnDeleted(column.id);
    await deleteColumn(column.id, boardId);
  }

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        "w-72 shrink-0 bg-slate-100 rounded-lg flex flex-col max-h-[calc(100vh-100px)]",
        sortable.isDragging && "opacity-40"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-slate-200">
        <button
          {...sortable.attributes}
          {...sortable.listeners}
          className="text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Sütunu sürükle"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        {editing ? (
          <div className="flex-1 flex items-center gap-1">
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") { setEditing(false); setEditTitle(column.title); }
              }}
              className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        ) : (
          <h3
            className="flex-1 font-semibold text-navy-900 text-sm cursor-text"
            onDoubleClick={() => setEditing(true)}
          >
            {column.title}
            <span className="ml-2 text-xs text-slate-400 font-normal">{cards.length}</span>
          </h3>
        )}
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-slate-400 hover:text-slate-700"
          aria-label="Sütunu düzenle"
        >
          {editing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleDelete}
          className="text-slate-400 hover:text-red-600"
          aria-label="Sütunu sil"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[60px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              boardId={boardId}
              onDeleted={() => onCardDeleted(card.id)}
              onUpdated={onCardUpdated}
            />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">Henüz kart yok</p>
        )}
      </div>

      {/* Add card */}
      <div className="p-2 border-t border-slate-200">
        {adding ? (
          <form onSubmit={handleAddCard} className="space-y-2">
            <textarea
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Kart başlığı"
              rows={2}
              className="w-full px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard(e as unknown as React.FormEvent);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-accent text-white text-sm py-1 rounded-md hover:bg-accent-dark"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setNewCardTitle(""); }}
                className="text-slate-500 hover:text-slate-700 px-2"
                aria-label="İptal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-navy-900 py-1.5 rounded-md hover:bg-slate-200"
          >
            <Plus className="w-4 h-4" /> Kart ekle
          </button>
        )}
      </div>
    </div>
  );
}
