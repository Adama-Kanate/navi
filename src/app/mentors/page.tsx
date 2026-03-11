"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

type Mentor = {
  id: string;
  full_name: string;
  title: string | null;
  short_bio: string | null;
  booking_url: string | null;
};

export default function MentorsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMentors() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("current_status, target_decision")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        router.push("/onboarding");
        return;
      }

      const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .eq("expertise_status", profile.current_status)
        .eq("expertise_decision", profile.target_decision);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setMentors(data || []);
      setLoading(false);
    }

    loadMentors();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-slate-600">Loading mentors...</p>
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
            Suggested mentors
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            These mentors are currently aligned with your profile and decision focus.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {mentors.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
              <p className="text-slate-600">
                No mentors available yet for your current profile.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">{mentor.title || "Mentor"}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {mentor.full_name}
                  </h2>
                  <p className="mt-4 text-slate-600">{mentor.short_bio}</p>

                  <a
                    href={mentor.booking_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                  >
                    Book a session
                  </a>
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
