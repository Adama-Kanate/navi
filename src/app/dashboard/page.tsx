"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

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
};

type ActivePath = {
  id: string;
  title: string;
  category: string | null;
  short_description: string | null;
};

type Mentor = {
  id: string;
  full_name: string;
  title: string | null;
  short_bio: string | null;
  booking_url: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  week_number: number | null;
};

type DecisionAnswer = {
  dimension: string;
  answer: string;
};

type PathStep = {
  id: string;
  step_order: number;
};

function normalizeTaskStatus(status: string | null) {
  return (status || "").trim().toLowerCase().replace(/\s+/g, "");
}

function isDoneStatus(status: string | null) {
  return normalizeTaskStatus(status) === "done";
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activePath, setActivePath] = useState<ActivePath | null>(null);
  const [pathSteps, setPathSteps] = useState<PathStep[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileData) {
        router.push("/onboarding");
        return;
      }

      setProfile(profileData);

      const { data: activePathRow } = await supabase
        .from("user_active_paths")
        .select("path_id")
        .eq("user_id", user.id)
        .single();

      if (activePathRow?.path_id) {
        const { data: activePathData } = await supabase
          .from("paths")
          .select("id, title, category, short_description")
          .eq("id", activePathRow.path_id)
          .single();

        if (activePathData) {
          setActivePath(activePathData);
        }

        const { data: stepsData } = await supabase
          .from("path_steps")
          .select("id, step_order")
          .eq("path_id", activePathRow.path_id);

        setPathSteps(stepsData || []);
      }

      const { data: answersData } = await supabase
        .from("decision_answers")
        .select("dimension, answer")
        .eq("user_id", user.id);

      if (answersData) {
        const map = Object.fromEntries(
          (answersData as DecisionAnswer[]).map((item) => [item.dimension, item.answer])
        );
        setAnswersMap(map);
      }

      // Paths: exact match → decision fallback → status fallback
      let pathsData: Path[] | null = null;

      const { data: exactPaths } = await supabase
        .from("paths")
        .select("id, title, category, short_description")
        .eq("status_target", profileData.current_status)
        .eq("decision_target", profileData.target_decision);

      if (exactPaths && exactPaths.length > 0) {
        pathsData = exactPaths;
      } else {
        const { data: decisionPaths } = await supabase
          .from("paths")
          .select("id, title, category, short_description")
          .eq("decision_target", profileData.target_decision);

        if (decisionPaths && decisionPaths.length > 0) {
          pathsData = decisionPaths;
        } else {
          const { data: statusPaths } = await supabase
            .from("paths")
            .select("id, title, category, short_description")
            .eq("status_target", profileData.current_status);

          pathsData = statusPaths || [];
        }
      }

      setPaths(pathsData || []);

      // Mentors: exact match → decision fallback → status fallback
      let mentorsData: Mentor[] | null = null;

      const { data: exactMentors } = await supabase
        .from("mentors")
        .select("id, full_name, title, short_bio, booking_url")
        .eq("expertise_status", profileData.current_status)
        .eq("expertise_decision", profileData.target_decision);

      if (exactMentors && exactMentors.length > 0) {
        mentorsData = exactMentors;
      } else {
        const { data: decisionMentors } = await supabase
          .from("mentors")
          .select("id, full_name, title, short_bio, booking_url")
          .eq("expertise_decision", profileData.target_decision);

        if (decisionMentors && decisionMentors.length > 0) {
          mentorsData = decisionMentors;
        } else {
          const { data: statusMentors } = await supabase
            .from("mentors")
            .select("id, full_name, title, short_bio, booking_url")
            .eq("expertise_status", profileData.current_status);

          mentorsData = statusMentors || [];
        }
      }

      setMentors(mentorsData || []);

      const { data: tasksData, error: tasksError } = await supabase
        .from("plan_tasks")
        .select("id, title, description, status, week_number")
        .eq("user_id", user.id)
        .order("week_number", { ascending: true });

      if (tasksError) {
        setError(tasksError.message);
        setLoading(false);
        return;
      }

      setTasks(tasksData || []);
      setLoading(false);
    }

    loadDashboard();
  }, [router, supabase]);

  async function toggleTaskStatus(taskId: string, currentStatus: string | null) {
    const nextStatus = currentStatus === "done" ? "todo" : "done";

    const { error } = await supabase
      .from("plan_tasks")
      .update({ status: nextStatus })
      .eq("id", taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: nextStatus } : task
        )
      );
    }
  }

  function getSuggestedNextStep() {
    if (!profile) return "Complete your profile to unlock your next steps.";

    const interest = answersMap.interest;
    const priority = answersMap.priority;
    const environment = answersMap.environment;
    const risk = answersMap.risk;

    if (profile.target_decision === "Choose a first job") {
      if (interest === "analytical") {
        return "Identify 2 analytical roles and compare the skills they require.";
      }
      if (interest === "people-focused") {
        return "Compare 2 people-oriented roles and speak with one professional in that area.";
      }
      if (priority === "stability") {
        return "Focus on stable first-job options and compare their entry requirements.";
      }
      return "Clarify 2 target roles and identify the skills and experiences each one requires.";
    }

    if (profile.target_decision === "Choose an internship") {
      if (interest === "technical") {
        return "Shortlist 3 technical internships and prepare one tailored application this week.";
      }
      return "Shortlist 3 internship targets and prepare one tailored application this week.";
    }

    if (profile.target_decision === "Choose a master's program") {
      if (priority === "learning") {
        return "Compare 3 master's programs with strong learning outcomes and note their deadlines.";
      }
      return "Compare 3 programs, review deadlines, and note the required documents.";
    }

    if (profile.target_decision === "Switch careers") {
      if (risk === "low") {
        return "Define one low-risk transition path and test it with one small practical step.";
      }
      return "Define one realistic transition path and validate it with a small practical test.";
    }

    if (profile.target_decision === "Choose post-secondary options") {
      if (environment === "academic") {
        return "Compare 3 academically strong post-secondary options that fit your constraints.";
      }
      return "Build a shortlist of post-secondary options that match your strengths and constraints.";
    }

    if (profile.target_decision === "Build confidence in one direction") {
      return "Choose one realistic direction and test it through one simple discussion or activity.";
    }

    if (profile.target_decision === "Explore career interests") {
      return "Write down 3 interests and connect each one to a possible study or career direction.";
    }

    if (profile.target_decision === "Choose a study track") {
      return "Compare your available study tracks and ask one trusted adult for feedback.";
    }

    return "Identify one realistic path and break it into small actions for the next 7 days.";
  }

  const stepOrders = new Set(pathSteps.map((s) => s.step_order));
  const totalSteps = pathSteps.length;
  const completedSteps = tasks.filter(
    (t) => isDoneStatus(t.status) && t.week_number !== null && stepOrders.has(t.week_number)
  ).length;
  const stepProgressPercentage =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const nextActionTask = [...tasks]
    .sort((a, b) => (a.week_number ?? Number.MAX_SAFE_INTEGER) - (b.week_number ?? Number.MAX_SAFE_INTEGER))
    .find((task) => !isDoneStatus(task.status));

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-slate-600">Loading dashboard...</p>
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
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-4xl font-semibold text-[#1F2A44]">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
            </h1>

            <p className="mt-3 text-lg text-slate-600">
              Here is your current Navi profile and decision context.
            </p>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Current status</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1F2A44]">
                  {profile?.current_status || "Not provided"}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Target decision</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1F2A44]">
                  {profile?.target_decision || "Not provided"}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Next important deadline</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1F2A44]">
                  {profile?.deadline_window || "Not provided"}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Stuck level</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1F2A44]">
                  {profile?.stuck_level ? `${profile.stuck_level}/10` : "Not provided"}
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Constraints</p>

              {profile?.constraints && profile.constraints.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.constraints.map((constraint) => (
                    <span
                      key={constraint}
                      className="rounded-full bg-[#DCE6F2] px-3 py-1 text-sm text-[#1F2A44]"
                    >
                      {constraint}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-slate-600">No constraints provided yet.</p>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-[#1F2A44] p-6 text-white">
              <p className="text-sm text-slate-200">Suggested next step</p>
              <h2 className="mt-2 text-2xl font-semibold">{getSuggestedNextStep()}</h2>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Current path</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {activePath ? activePath.title : "No active path yet"}
                  </h2>
                </div>

                {activePath ? (
                  <button
                    onClick={() => router.push(`/paths/${activePath.id}`)}
                    className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                  >
                    Resume this path
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/paths")}
                    className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                  >
                    Explore paths
                  </button>
                )}
              </div>

              {activePath && (
                <div className="mt-4 rounded-xl bg-[#F3F6FA] p-4">
                  <p className="text-sm text-slate-500">{activePath.category || "Path"}</p>
                  <p className="mt-2 text-slate-700">{activePath.short_description}</p>

                  {totalSteps > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-500">Your progress</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#1F2A44]">
                          {completedSteps} / {totalSteps} steps completed
                        </p>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-[#1F2A44] transition-all"
                          style={{ width: `${stepProgressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Suggested paths</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {paths.length > 0
                      ? `${paths.length} path${paths.length > 1 ? "s" : ""} matched to your profile`
                      : "No matched paths yet"}
                  </h2>
                </div>

                <button
                  onClick={() => router.push("/paths")}
                  className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                >
                  View my paths
                </button>
              </div>

              {paths.length > 0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {paths.slice(0, 2).map((path) => (
                    <div key={path.id} className="rounded-xl bg-[#F3F6FA] p-4">
                      <p className="text-sm text-slate-500">{path.category || "Path"}</p>
                      <h3 className="mt-2 text-lg font-semibold text-[#1F2A44]">
                        {path.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {path.short_description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Suggested mentors</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {mentors.length > 0
                      ? `${mentors.length} mentor${mentors.length > 1 ? "s" : ""} matched to your profile`
                      : "No matched mentors yet"}
                  </h2>
                </div>

                <button
                  onClick={() => router.push("/mentors")}
                  className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                >
                  View mentors
                </button>
              </div>

              {mentors.length > 0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {mentors.slice(0, 2).map((mentor) => (
                    <div key={mentor.id} className="rounded-xl bg-[#F3F6FA] p-4">
                      <p className="text-sm text-slate-500">{mentor.title || "Mentor"}</p>
                      <h3 className="mt-2 text-lg font-semibold text-[#1F2A44]">
                        {mentor.full_name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">{mentor.short_bio}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Next action</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {nextActionTask ? nextActionTask.title : "Your current plan is complete"}
                  </h2>
                </div>

                <button
                  onClick={() => router.push(nextActionTask ? "/plan" : "/paths")}
                  className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                >
                  {nextActionTask ? "Open this task" : "Explore paths"}
                </button>
              </div>

              {nextActionTask && (
                <div className="mt-4 rounded-xl bg-[#F3F6FA] p-4">
                  <p className="text-sm text-slate-500">From your current action plan</p>
                  <p className="text-sm text-slate-500">
                    Week {nextActionTask.week_number || "—"} • {nextActionTask.status || "todo"}
                  </p>
                  {nextActionTask.description && (
                    <p className="mt-2 text-sm text-slate-600">{nextActionTask.description}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={() => router.push("/onboarding")}
                className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
              >
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
