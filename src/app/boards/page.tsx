import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import CreateBoardForm from "@/components/CreateBoardForm";
import DeleteBoardButton from "@/components/DeleteBoardButton";

export const dynamic = "force-dynamic";

export default async function BoardsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">TaskFlow</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm hidden sm:block">{user?.email}</span>
            <form action={signOut}>
              <button className="text-sm text-slate-300 hover:text-white">Çıkış</button>
            </form>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-navy-900 mb-4">Tahtaların</h2>

        <CreateBoardForm />

        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition flex flex-col"
              >
                <Link href={`/boards/${b.id}`} className="flex-1">
                  <h3 className="font-semibold text-navy-900">{b.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(b.created_at).toLocaleDateString("tr-TR")}
                  </p>
                </Link>
                <DeleteBoardButton id={b.id} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Henüz tahtan yok. İlk tahtanı yukarıdan oluştur.</p>
        )}
      </section>
    </main>
  );
}
