"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  current_status: string | null;
  target_decision: string | null;
};

type Path = {
  id: string;
  title: string;
  status_target: string | null;
  decision_target: string | null;
  short_description: string | null;
  why_it_fits: string | null;
  category: string | null;
};

export default function PathsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [paths, setPaths] = useState<Path[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPaths() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, current_status, target_decision")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        router.push("/onboarding");
        return;
      }

      const { data, error } = await supabase
        .from("paths")
        .select("*")
        .eq("status_target", profile.current_status)
        .eq("decision_target", profile.target_decision);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setPaths(data || []);
      setLoading(false);
    }

    loadPaths();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-slate-600">Loading paths...</p>
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
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-semibold text-[#1F2A44]">
            Your suggested paths
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            These paths are currently matched to your profile and decision focus.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {paths.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
              <p className="text-slate-600">
                No paths available yet for your current profile. Update your onboarding
                information or add more paths in Supabase.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {paths.map((path) => (
                <div key={path.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">{path.category || "Path"}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {path.title}
                  </h2>
                  <p className="mt-4 text-slate-600">{path.short_description}</p>

                  <div className="mt-5 rounded-xl bg-[#F3F6FA] p-4">
                    <p className="text-sm text-slate-500">Why it fits</p>
                    <p className="mt-2 text-slate-700">{path.why_it_fits}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
