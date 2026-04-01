export type ProfileInsightInput = {
  current_status: string | null;
  target_decision: string | null;
  deadline_window: string | null;
  stuck_level: number | null;
};

function normalize(value: string | null | undefined) {
  return (value || "").trim();
}

function getHorizonLabel(deadlineWindow: string) {
  const lower = deadlineWindow.toLowerCase();

  if (lower.includes("less than 2 weeks") || lower.includes("2–4 weeks") || lower.includes("2-4 weeks")) {
    return "a short decision horizon";
  }

  if (lower.includes("1–3 months") || lower.includes("1-3 months") || lower.includes("3–6 months") || lower.includes("3-6 months")) {
    return "a medium decision horizon";
  }

  if (lower.includes("more than 6 months")) {
    return "a longer decision horizon";
  }

  return "an evolving decision horizon";
}

function getStuckTone(stuckLevel: number | null) {
  if (typeof stuckLevel !== "number") return "";
  if (stuckLevel >= 8) return " You are feeling quite stuck right now, so the plan prioritizes quick confidence-building steps.";
  if (stuckLevel >= 5) return " You have some uncertainty, so the plan focuses on clear and practical actions.";
  return " You already have momentum, so the plan helps you convert it into concrete progress.";
}

export function getProfileInsight(profile: ProfileInsightInput | null) {
  if (!profile) {
    return "You are building your direction, and this 30-day plan will help you move forward step by step.";
  }

  const status = normalize(profile.current_status) || "a learner";
  const decision = normalize(profile.target_decision).toLowerCase() || "clarify your next decision";
  const deadline = normalize(profile.deadline_window);

  const horizon = deadline ? getHorizonLabel(deadline) : "an open decision horizon";
  const stuckTone = getStuckTone(profile.stuck_level);

  return `You are a ${status.toLowerCase()} trying to ${decision} with ${horizon}.${stuckTone}`;
}
