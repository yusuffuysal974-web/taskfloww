"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createBoard(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Başlık boş olamaz" };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Yetkisiz" };

  const { data, error } = await supabase
    .from("boards")
    .insert({ title, owner_id: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/boards");
  redirect(`/boards/${data.id}`);
}

export async function deleteBoard(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("boards").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/boards");
  return { ok: true };
}

export async function renameBoard(id: string, title: string) {
  const t = title.trim();
  if (!t) return { error: "Başlık boş olamaz" };
  const supabase = createClient();
  const { error } = await supabase.from("boards").update({ title: t }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/boards/${id}`);
  return { ok: true };
}
