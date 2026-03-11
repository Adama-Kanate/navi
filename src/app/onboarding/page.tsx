"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [targetDecision, setTargetDecision] = useState("");
  const [deadlineWindow, setDeadlineWindow] = useState("");
  const [stuckLevel, setStuckLevel] = useState(5);
  const [constraints, setConstraints] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const decisionOptionsMap: Record<string, string[]> = {
    "Middle school student": [
      "Explore career interests",
      "Choose a study track",
      "Build confidence in one direction",
    ],
    "High school student": [
      "Choose a major",
      "Choose post-secondary options",
      "Explore careers",
      "Choose extracurricular direction",
    ],
    "University student": [
      "Choose an internship",
      "Choose a master's program",
      "Choose a first job",
      "Explore a specialization",
    ],
    "Master's student": [
      "Choose an internship",
      "Choose a first job",
      "Refine career direction",
      "Prepare for graduation",
    ],
    "Recent graduate": [
      "Choose a first job",
      "Clarify a career direction",
      "Switch careers",
      "Build a short-term action plan",
    ],
    "Working professional": [
      "Switch careers",
      "Clarify next career move",
      "Upskill for a new role",
      "Build a transition plan",
    ],
  };

  const decisionOptions = currentStatus
    ? decisionOptionsMap[currentStatus] || []
    : [];

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setCurrentStatus(data.current_status || "");
        setTargetDecision(data.target_decision || "");
        setDeadlineWindow(data.deadline_window || "");
        setStuckLevel(data.stuck_level || 5);
        setConstraints(Array.isArray(data.constraints) ? data.constraints.join(", ") : "");
      } else {
        setFullName((user.user_metadata?.full_name as string) || "");
      }

      setLoading(false);
    }

    loadUser();
  }, [router, supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const parsedConstraints = constraints
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      current_status: currentStatus,
      target_decision: targetDecision,
      deadline_window: deadlineWindow,
      stuck_level: stuckLevel,
      constraints: parsedConstraints,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage("Profile saved successfully.");
    setSaving(false);

    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <p className="text-slate-600">Loading onboarding...</p>
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
            Complete your profile
          </h1>
          <p className="mt-3 text-slate-600">
            Help Navi understand your situation and build a more relevant path.
          </p>

          <form onSubmit={handleSave} className="mt-8 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                Current status
              </label>
              <select
                value={currentStatus}
                onChange={(e) => {
                  setCurrentStatus(e.target.value);
                  setTargetDecision("");
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
                required
              >
                <option value="">Select your status</option>
                <option value="Middle school student">Middle school student</option>
                <option value="High school student">High school student</option>
                <option value="University student">University student</option>
                <option value="Master's student">Master's student</option>
                <option value="Recent graduate">Recent graduate</option>
                <option value="Working professional">Working professional</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                What decision are you trying to make?
              </label>
              <select
                value={targetDecision}
                onChange={(e) => setTargetDecision(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
                required
                disabled={!currentStatus}
              >
                <option value="">
                  {currentStatus ? "Select a decision" : "Select your status first"}
                </option>
                {decisionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                How soon is your next important deadline?
              </label>
              <select
                value={deadlineWindow}
                onChange={(e) => setDeadlineWindow(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
                required
              >
                <option value="">Select a timeframe</option>
                <option value="Less than 2 weeks">Less than 2 weeks</option>
                <option value="2–4 weeks">2–4 weeks</option>
                <option value="1–3 months">1–3 months</option>
                <option value="3–6 months">3–6 months</option>
                <option value="More than 6 months">More than 6 months</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                How stuck do you feel right now? ({stuckLevel}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={stuckLevel}
                onChange={(e) => setStuckLevel(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1F2A44]">
                Constraints
              </label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Budget, location, visa, language..."
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
              />
              <p className="mt-2 text-xs text-slate-500">
                Separate multiple constraints with commas.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 rounded-lg bg-[#1F2A44] px-4 py-3 text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save and continue"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </p>
          )}

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
