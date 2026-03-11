"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

type Path = {
  id: string;
  title: string;
  category: string | null;
  short_description: string | null;
  why_it_fits: string | null;
  status_target: string | null;
  decision_target: string | null;
};

export default function PathDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<Path | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPath() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const pathId = Array.isArray(params.id) ? params.id[0] : params.id;

      const { data, error } = await supabase
        .from("paths")
        .select("*")
        .eq("id", pathId)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setPath(data);
      setLoading(false);
    }

    loadPath();
  }, [params.id, router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <p className="text-slate-600">Loading path...</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {path && (
            <>
              <p className="text-sm text-slate-500">{path.category || "Path"}</p>

              <h1 className="mt-2 text-4xl font-semibold text-[#1F2A44]">
                {path.title}
              </h1>

              <p className="mt-6 text-lg text-slate-600">
                {path.short_description}
              </p>

              <div className="mt-8 rounded-2xl bg-[#F3F6FA] p-6">
                <p className="text-sm text-slate-500">Why this path fits you</p>
                <p className="mt-3 text-slate-700">{path.why_it_fits}</p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Matched status</p>
                  <p className="mt-2 font-semibold text-[#1F2A44]">
                    {path.status_target || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Matched decision</p>
                  <p className="mt-2 font-semibold text-[#1F2A44]">
                    {path.decision_target || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => router.push("/paths")}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50"
                >
                  Back to paths
                </button>

                <button
                  onClick={() => router.push("/mentors")}
                  className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                >
                  View matching mentors
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
