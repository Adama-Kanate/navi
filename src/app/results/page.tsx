"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";
import { getNextBestAction } from "@/lib/next-action";
import { getWhyPathFits } from "@/lib/path-fit";
import { getProfileInsight } from "@/lib/profile-insight";
import { saveOnboardingDraft } from "@/lib/onboarding-draft";

type Profile = {
  id: string;
  full_name: string | null;
  current_status: string | null;
  target_decision: string | null;
  deadline_window: string | null;
  stuck_level: number | null;
  constraints: string[] | null;
};

type Path = {
  id: string;
  title: string;
  category: string | null;
  short_description: string | null;
  status_target: string | null;
  decision_target: string | null;
};

type PathStep = {
  id: string;
  step_order: number;
  title: string;
  description: string | null;
};

type ApiInsight = {
  summary: string;
  nextStep: string;
  strengths: string[];
  gaps: string[];
  personalizedSteps?: string[];
};

export default function ResultsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [previewSteps, setPreviewSteps] = useState<PathStep[]>([]);
  const [nextAction, setNextAction] = useState("");
  const [error, setError] = useState("");
  const [insight, setInsight] = useState<ApiInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const profileInsight = getProfileInsight(profile);
  const introText = insight
    ? "Your insights are generated from your latest profile and answers."
    : "We are preparing your personalized insights from your latest profile data.";
  const nextBestActionText = (insight?.nextStep || nextAction || "Choose one clear action and complete it this week.").trim();
  const conciseNextBestAction =
    nextBestActionText.length > 110
      ? `${nextBestActionText.slice(0, nextBestActionText.lastIndexOf(" ", 105)).trim()}.`
      : nextBestActionText;
  const personalizedPlanItems =
    insight?.personalizedSteps?.filter((step) => typeof step === "string" && step.trim().length > 0) ||
    previewSteps.map((step) =>
      step.description ? `${step.title} - ${step.description}` : step.title
    );

  async function handleOpenActionPlan() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: taskRows } = await supabase
        .from("plan_tasks")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (taskRows && taskRows.length > 0) {
        router.push("/plan");
        return;
      }

      const { data: activePathRow } = await supabase
        .from("user_active_paths")
        .select("path_id")
        .eq("user_id", user.id)
        .single();

      if (activePathRow?.path_id) {
        const { data: pathRow } = await supabase
          .from("paths")
          .select("id")
          .eq("id", activePathRow.path_id)
          .single();

        if (pathRow?.id) {
          router.push(`/paths/${pathRow.id}`);
          return;
        }
      }

      router.push("/paths");
    } catch {
      router.push("/plan");
    }
  }

  function handleEditAnswers() {
    if (profile) {
      saveOnboardingDraft({
        fullName: profile.full_name || "",
        currentStatus: profile.current_status || "",
        targetDecision: profile.target_decision || "",
        deadlineWindow: profile.deadline_window || "",
        stuckLevel: typeof profile.stuck_level === "number" ? profile.stuck_level : 5,
        constraints: profile.constraints?.join(", ") || "",
      });
    }

    router.push("/onboarding");
  }

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, current_status, target_decision, deadline_window, stuck_level, constraints")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileData) {
        setError("We could not find your onboarding profile yet.");
        setNextAction(getNextBestAction(null));
        setLoading(false);
        return;
      }

      setProfile(profileData);

      let matchedPaths: Path[] = [];

      const { data: exactPaths } = await supabase
        .from("paths")
        .select("id, title, category, short_description, status_target, decision_target")
        .eq("status_target", profileData.current_status)
        .eq("decision_target", profileData.target_decision)
        .limit(3);

      if (exactPaths && exactPaths.length > 0) {
        matchedPaths = exactPaths;
      } else {
        const { data: decisionPaths } = await supabase
          .from("paths")
          .select("id, title, category, short_description, status_target, decision_target")
          .eq("decision_target", profileData.target_decision)
          .limit(3);

        if (decisionPaths && decisionPaths.length > 0) {
          matchedPaths = decisionPaths;
        } else {
          const { data: statusPaths } = await supabase
            .from("paths")
            .select("id, title, category, short_description, status_target, decision_target")
            .eq("status_target", profileData.current_status)
            .limit(3);

          matchedPaths = statusPaths || [];
        }
      }

      setPaths(matchedPaths.slice(0, 3));

      const topPath = matchedPaths[0] || null;

      if (topPath) {
        const { data: stepsData, error: stepsError } = await supabase
          .from("path_steps")
          .select("id, step_order, title, description")
          .eq("path_id", topPath.id)
          .order("step_order", { ascending: true })
          .limit(3);

        if (stepsError) {
          setError(stepsError.message);
          setPreviewSteps([]);
          setNextAction(getNextBestAction(profileData));
          setLoading(false);
          return;
        }

        const topSteps = stepsData || [];
        setPreviewSteps(topSteps);
        setNextAction(getNextBestAction(profileData));
      } else {
        setPreviewSteps([]);
        setNextAction(getNextBestAction(profileData));
      }

      setLoading(false);

      setInsightLoading(true);
      try {
        const insightResponse = await fetch("/api/generate-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentStatus: profileData.current_status,
            targetDecision: profileData.target_decision,
            deadlineWindow: profileData.deadline_window,
            stuckLevel: profileData.stuck_level,
            constraints: profileData.constraints,
          }),
        });

        if (insightResponse.ok) {
          const insightData = await insightResponse.json() as ApiInsight;
          setInsight(insightData);
        }
      } catch {
        console.warn("Failed to fetch insight from API, continuing without it.");
      } finally {
        setInsightLoading(false);
      }
    }

    loadResults();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-slate-600">Preparing your personalized plan...</p>
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
            Your personalized 30-day plan is ready
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            {introText}
          </p>

          {error && (
            <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1F2A44]">What Navi understands about you</h2>
            <p className="mt-3 text-slate-700">{insight?.summary || profileInsight}</p>
          </div>

          <div className="mt-8 rounded-2xl bg-[#F3F6FA] p-6 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold text-[#1F2A44]">Your next best action</h2>
            <div className="mt-4 rounded-xl border-l-4 border-l-[#1F2A44] bg-white p-4">
              <p className="text-lg font-semibold text-[#1F2A44]">
                {conciseNextBestAction}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1F2A44]">Your strengths</h2>
            {insight?.strengths && insight.strengths.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {insight.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-[#1F2A44]" />
                    <span className="text-slate-700">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-slate-600">We are building your strengths view from your profile data.</p>
            )}
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1F2A44]">Main gaps to address</h2>
            {insight?.gaps && insight.gaps.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {insight.gaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                    <span className="text-slate-700">{gap}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-slate-600">We are identifying your main blockers to prioritize the right actions.</p>
            )}
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#1F2A44]">Your personalized action plan</h2>
            {personalizedPlanItems.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {personalizedPlanItems.map((step, idx) => (
                  <li
                    key={`${idx}-${step}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#1F2A44] text-xs font-semibold text-white">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700">{step}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-slate-600">Your action plan will appear here once we have enough matching data.</p>
            )}
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Profile summary</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Current status</p>
                <p className="mt-1 font-medium text-[#1F2A44]">{profile?.current_status || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Target decision</p>
                <p className="mt-1 font-medium text-[#1F2A44]">{profile?.target_decision || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Deadline window</p>
                <p className="mt-1 font-medium text-[#1F2A44]">{profile?.deadline_window || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Stuck level</p>
                <p className="mt-1 font-medium text-[#1F2A44]">
                  {typeof profile?.stuck_level === "number" ? `${profile.stuck_level}/10` : "Not provided"}
                </p>
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Constraints</p>
                <p className="mt-1 font-medium text-[#1F2A44]">
                  {profile?.constraints && profile.constraints.length > 0
                    ? profile.constraints.join(", ")
                    : "No constraints provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[#1F2A44]">Your best matched paths</h2>
              <button
                onClick={() => router.push("/paths")}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                View all paths
              </button>
            </div>

            {paths.length === 0 ? (
              <p className="mt-4 text-slate-600">No matched paths yet. Update your onboarding details to refine suggestions.</p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {paths.map((path, idx) => (
                  <button
                    key={path.id}
                    onClick={() => router.push(`/paths/${path.id}`)}
                    className="rounded-xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <p className="text-sm text-slate-500">{path.category || "Path"}</p>
                    <h3 className="mt-2 text-lg font-semibold text-[#1F2A44]">{path.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{path.short_description || "No description available yet."}</p>
                    <div className="mt-3 rounded-lg bg-[#F3F6FA] p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Why this fits you</p>
                      <p className="mt-1 text-sm text-slate-700">{getWhyPathFits(profile, path, idx)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleEditAnswers}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Edit my answers
            </button>
            <button
              onClick={handleOpenActionPlan}
              className="rounded-lg bg-[#1F2A44] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Open action plan
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
