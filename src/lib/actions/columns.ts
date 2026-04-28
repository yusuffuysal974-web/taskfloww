"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeNewPosition, positionAfter } from "@/lib/position";

export async function createColumn(boardId: string, title: string) {
  const t = title.trim();
  if (!t) return { error: "Başlık boş olamaz" };

  const supabase = createClient();

  // En yüksek mevcut position'ı bul
  const { data: last } = await supabase
    .from("columns")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = positionAfter(last?.position ?? null);

  const { data, error } = await supabase
    .from("columns")
    .insert({ board_id: boardId, title: t, position })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return { ok: true, column: data };
}

export async function renameColumn(id: string, title: string, boardId: string) {
  const t = title.trim();
  if (!t) return { error: "Başlık boş olamaz" };
  const supabase = createClient();
  const { error } = await supabase.from("columns").update({ title: t }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}

export async function deleteColumn(id: string, boardId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("columns").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}

export async function moveColumn(
  columnId: string,
  boardId: string,
  newIndex: number
) {
  const supabase = createClient();

  // Aynı board'daki diğer sütunların pozisyonlarını çek (taşınan hariç)
  const { data: others, error: fetchErr } = await supabase
    .from("columns")
    .select("id, position")
    .eq("board_id", boardId)
    .neq("id", columnId)
    .order("position", { ascending: true });

  if (fetchErr) return { error: fetchErr.message };

  const positions = (others ?? []).map((c) => c.position);
  const newPos = computeNewPosition(positions, newIndex);

  const { error } = await supabase
    .from("columns")
    .update({ position: newPos })
    .eq("id", columnId);

  if (error) return { error: error.message };
  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}
