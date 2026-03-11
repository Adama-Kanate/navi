"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  current_status: string | null;
  target_decision: string | null;
};

export default function DecisionPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  const [interest, setInterest] = useState("");
  const [priority, setPriority] = useState("");
  const [environment, setEnvironment] = useState("");
  const [risk, setRisk] = useState("");

  useEffect(() => {
    async function loadProfileAndAnswers() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("current_status, target_decision")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        router.push("/onboarding");
        return;
      }

      setProfile(profileData);

      const { data: answersData } = await supabase
        .from("decision_answers")
        .select("dimension, answer")
        .eq("user_id", user.id);

      if (answersData) {
        const map = Object.fromEntries(
          answersData.map((item) => [item.dimension, item.answer])
        );

        setInterest(map.interest || "");
        setPriority(map.priority || "");
        setEnvironment(map.environment || "");
        setRisk(map.risk || "");
      }

      setLoading(false);
    }

    loadProfileAndAnswers();
  }, [router, supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("decision_answers")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    const payload = [
      { user_id: user.id, dimension: "interest", answer: interest },
      { user_id: user.id, dimension: "priority", answer: priority },
      { user_id: user.id, dimension: "environment", answer: environment },
      { user_id: user.id, dimension: "risk", answer: risk },
    ];

    const { error: insertError } = await supabase
      .from("decision_answers")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/dashboard");
  }

  function getIntroText() {
    if (!profile) return "Answer a few quick questions to clarify your direction.";

    return `You selected "${profile.target_decision || "a decision"}" as a ${
      profile.current_status || "user"
    }. These quick answers will help Navi refine your guidance.`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <p className="text-slate-600">Loading decision clarifier...</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-[#1F2A44]">
            Clarify your direction
          </h1>

          <p className="mt-3 text-slate-600">{getIntroText()}</p>

          <form onSubmit={handleSave} className="mt-8 grid gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                What interests you the most?
              </label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
                required
              >
                <option value="">Select one</option>
                <option value="analytical">Analytical</option>
                <option value="creative">Creative</option>
                <option value="technical">Technical</option>
                <option value="people-focused">People-focused</option>
                <option value="not-sure">Not sure yet</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                What matters most to you right now?
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
                required
              >
                <option value="">Select one</option>
                <option value="learning">Learning</option>
                <option value="income">Income</option>
                <option value="stability">Stability</option>
                <option value="impact">Impact</option>
                <option value="flexibility">Flexibility</option>
                <option value="exploration">Exploration</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                What type of environment fits you best?
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
                required
              >
                <option value="">Select one</option>
                <option value="structured">Structured</option>
                <option value="fast-paced">Fast-paced</option>
                <option value="academic">Academic</option>
                <option value="creative">Creative</option>
                <option value="not-sure">Not sure</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                How much uncertainty are you comfortable with?
              </label>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
                required
              >
                <option value="">Select one</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#1F2A44] px-4 py-3 text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Continue to your dashboard"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
