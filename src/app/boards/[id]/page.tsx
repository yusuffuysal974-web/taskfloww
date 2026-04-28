import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import KanbanBoard from "@/components/KanbanBoard";
import type { Card, Column } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!board) notFound();

  const { data: columns } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", params.id)
    .order("position", { ascending: true });

  const columnIds = (columns ?? []).map((c) => c.id);
  const { data: cards } = columnIds.length
    ? await supabase
        .from("cards")
        .select("*")
        .in("column_id", columnIds)
        .order("position", { ascending: true })
    : { data: [] as Card[] };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/boards" className="text-slate-300 hover:text-white shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold truncate">{board.title}</h1>
          </div>
          <form action={signOut}>
            <button className="text-sm text-slate-300 hover:text-white">Çıkış</button>
          </form>
        </div>
      </header>

      <KanbanBoard
        boardId={board.id}
        initialColumns={(columns ?? []) as Column[]}
        initialCards={(cards ?? []) as Card[]}
      />
    </main>
  );
}
