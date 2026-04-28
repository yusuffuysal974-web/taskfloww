"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeNewPosition, positionAfter } from "@/lib/position";

export async function createCard(
  columnId: string,
  boardId: string,
  title: string
) {
  const t = title.trim();
  if (!t) return { error: "Başlık boş olamaz" };

  const supabase = createClient();

  const { data: last } = await supabase
    .from("cards")
    .select("position")
    .eq("column_id", columnId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = positionAfter(last?.position ?? null);

  const { data, error } = await supabase
    .from("cards")
    .insert({ column_id: columnId, title: t, description: "", position })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return { ok: true, card: data };
}

export async function updateCard(
  id: string,
  boardId: string,
  fields: { title?: string; description?: string }
) {
  const update: Record<string, string> = {};
  if (fields.title !== undefined) {
    const t = fields.title.trim();
    if (!t) return { error: "Başlık boş olamaz" };
    update.title = t;
  }
  if (fields.description !== undefined) {
    update.description = fields.description;
  }

  const supabase = createClient();
  const { error } = await supabase.from("cards").update(update).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}

export async function deleteCard(id: string, boardId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}

/**
 * Kartı yeni sütuna ve/veya yeni indexe taşı.
 *
 * - Hedef sütundaki diğer kartların pozisyonlarına bakıp midpoint hesaplar.
 * - Tek UPDATE: yalnızca taşınan kart güncellenir.
 */
export async function moveCard(args: {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  newIndex: number;
  boardId: string;
}) {
  const { cardId, toColumnId, newIndex, boardId } = args;
  const supabase = createClient();

  const { data: others, error: fetchErr } = await supabase
    .from("cards")
    .select("id, position")
    .eq("column_id", toColumnId)
    .neq("id", cardId)
    .order("position", { ascending: true });

  if (fetchErr) return { error: fetchErr.message };

  const positions = (others ?? []).map((c) => c.position);
  const newPos = computeNewPosition(positions, newIndex);

  const { error } = await supabase
    .from("cards")
    .update({ column_id: toColumnId, position: newPos })
    .eq("id", cardId);

  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}
