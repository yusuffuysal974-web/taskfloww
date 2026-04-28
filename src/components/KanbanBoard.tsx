"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import type { Card, Column } from "@/lib/types";
import { createColumn } from "@/lib/actions/columns";
import { moveCard } from "@/lib/actions/cards";
import { moveColumn } from "@/lib/actions/columns";

type Props = {
  boardId: string;
  initialColumns: Column[];
  initialCards: Card[];
};

export default function KanbanBoard({ boardId, initialColumns, initialCards }: Props) {
  // ===== State =====
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [cards, setCards] = useState<Card[]>(initialCards);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [, startTransition] = useTransition();

  // ===== Sensors =====
  // PointerSensor: desktop mouse + basic touch
  // TouchSensor: long-press to start drag (avoids hijacking scroll)
  // KeyboardSensor: Tab + Space + arrow keys
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ===== Derived =====
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  // ===== Drag handlers =====
  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    const type = e.active.data.current?.type;
    if (type === "column") {
      const col = columns.find((c) => c.id === id) || null;
      setActiveColumn(col);
    } else if (type === "card") {
      const card = cards.find((c) => c.id === id) || null;
      setActiveCard(card);
    }
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;

    const activeType = active.data.current?.type;
    if (activeType !== "card") return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const overType = over.data.current?.type;

    const activeCardObj = cards.find((c) => c.id === activeId);
    if (!activeCardObj) return;

    // Determine target column
    let targetColumnId: string | undefined;
    if (overType === "card") {
      targetColumnId = cards.find((c) => c.id === overId)?.column_id;
    } else if (overType === "column") {
      targetColumnId = overId;
    }
    if (!targetColumnId) return;

    if (activeCardObj.column_id !== targetColumnId) {
      // Move card to new column (visual only — final position computed on dragEnd)
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, column_id: targetColumnId! } : c
        )
      );
    }
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveColumn(null);
    setActiveCard(null);

    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeType = active.data.current?.type;

    // ----- Column drag -----
    if (activeType === "column") {
      const fromIndex = columns.findIndex((c) => c.id === activeId);
      const toIndex = columns.findIndex((c) => c.id === overId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

      const newOrder = arrayMove(columns, fromIndex, toIndex);
      setColumns(newOrder); // optimistic

      startTransition(() => {
        moveColumn(activeId, boardId, toIndex).catch(() => {
          // rollback on failure
          setColumns(columns);
        });
      });
      return;
    }

    // ----- Card drag -----
    if (activeType === "card") {
      const activeCard = cards.find((c) => c.id === activeId);
      if (!activeCard) return;

      const overType = over.data.current?.type;
      let toColumnId: string;
      let toIndex: number;

      const cardsByColumn = (colId: string) =>
        cards.filter((c) => c.column_id === colId);

      if (overType === "card") {
        const overCard = cards.find((c) => c.id === overId);
        if (!overCard) return;
        toColumnId = overCard.column_id;
        const list = cardsByColumn(toColumnId);
        const overIndex = list.findIndex((c) => c.id === overId);
        const activeIndex = list.findIndex((c) => c.id === activeId);
        toIndex = activeIndex === -1 ? overIndex : overIndex;
      } else if (overType === "column") {
        toColumnId = overId;
        toIndex = cardsByColumn(toColumnId).filter((c) => c.id !== activeId).length;
      } else {
        return;
      }

      // Optimistic local reorder
      const fromIndex = cards
        .filter((c) => c.column_id === toColumnId)
        .findIndex((c) => c.id === activeId);

      const reordered =
        fromIndex !== -1
          ? (() => {
              // within same column reorder
              const list = cards.filter((c) => c.column_id === toColumnId);
              const moved = arrayMove(list, fromIndex, toIndex);
              return cards
                .filter((c) => c.column_id !== toColumnId)
                .concat(moved);
            })()
          : cards;

      setCards(reordered);

      startTransition(() => {
        moveCard({
          cardId: activeId,
          fromColumnId: activeCard.column_id,
          toColumnId,
          newIndex: toIndex,
          boardId,
        }).catch(() => setCards(initialCards));
      });
    }
  }

  // ===== Add column form =====
  async function handleAddColumn(e: React.FormEvent) {
    e.preventDefault();
    const title = newColumnTitle.trim();
    if (!title) return;
    setNewColumnTitle("");
    const res = await createColumn(boardId, title);
    if (res.ok && res.column) {
      setColumns((prev) => [...prev, res.column as Column]);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="overflow-x-auto">
        <div className="flex gap-4 p-4 min-h-[calc(100vh-72px)] items-start">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                cards={cards.filter((c) => c.column_id === col.id)}
                boardId={boardId}
                onCardCreated={(card) => setCards((prev) => [...prev, card])}
                onCardDeleted={(cardId) =>
                  setCards((prev) => prev.filter((c) => c.id !== cardId))
                }
                onCardUpdated={(updated) =>
                  setCards((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                  )
                }
                onColumnDeleted={(colId) =>
                  setColumns((prev) => prev.filter((c) => c.id !== colId))
                }
                onColumnRenamed={(colId, title) =>
                  setColumns((prev) =>
                    prev.map((c) => (c.id === colId ? { ...c, title } : c))
                  )
                }
              />
            ))}
          </SortableContext>

          {/* Add column */}
          <form
            onSubmit={handleAddColumn}
            className="w-72 shrink-0 bg-white border border-dashed border-slate-300 rounded-lg p-3"
          >
            <div className="flex gap-2">
              <input
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="+ Sütun ekle"
                className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="bg-accent text-white px-2 rounded-md hover:bg-accent-dark"
                aria-label="Sütun ekle"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <DragOverlay>
        {activeColumn ? (
          <div className="w-72 bg-white border border-accent rounded-lg p-3 shadow-2xl rotate-1">
            <h3 className="font-semibold text-navy-900">{activeColumn.title}</h3>
          </div>
        ) : null}
        {activeCard ? (
          <div className="bg-white border border-accent rounded-md p-3 shadow-2xl rotate-2 max-w-[18rem]">
            <p className="font-medium text-navy-900 text-sm">{activeCard.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
