export type NextActionProfileInput = {
  current_status: string | null;
  target_decision: string | null;
  deadline_window: string | null;
  stuck_level: number | null;
  constraints: string[] | null;
};

function normalizeText(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function hasConstraint(constraints: string[] | null, keyword: string) {
  if (!constraints || constraints.length === 0) return false;

  const normalizedKeyword = normalizeText(keyword);
  return constraints.some((item) => normalizeText(item).includes(normalizedKeyword));
}

export function getNextBestAction(profile: NextActionProfileInput | null) {
  if (!profile) {
    return "Complete your onboarding profile to unlock your first personalized action.";
  }

  const targetDecision = normalizeText(profile.target_decision);
  const currentStatus = normalizeText(profile.current_status);
  const deadlineWindow = normalizeText(profile.deadline_window);
  const stuckLevel = profile.stuck_level ?? 0;

  if (deadlineWindow.includes("less than 2 weeks")) {
    return "Pick one high-impact task and complete it in the next 48 hours.";
  }

  if (stuckLevel >= 8) {
    return "Book one mentor conversation to validate your direction.";
  }

  if (targetDecision.includes("internship")) {
    return "Shortlist 3 internship targets and prepare one application this week.";
  }

  if (targetDecision.includes("first job")) {
    return "Identify 2 realistic first-job roles and compare them before applying.";
  }

  if (targetDecision.includes("master")) {
    return "Compare 3 master's programs and note deadlines and required documents.";
  }

  if (targetDecision.includes("switch") && targetDecision.includes("career")) {
    return "Choose one transition role and map the top 3 skills to build this month.";
  }

  if (hasConstraint(profile.constraints, "budget")) {
    return "List 3 low-cost options aligned with your goal and choose one to pursue first.";
  }

  if (hasConstraint(profile.constraints, "location") || hasConstraint(profile.constraints, "visa")) {
    return "Filter your options by location constraints first, then shortlist 2 realistic paths.";
  }

  if (currentStatus.includes("high school")) {
    return "Compare 2 study directions and discuss your shortlist with one trusted advisor.";
  }

  if (currentStatus.includes("university") || currentStatus.includes("master")) {
    return "Define one concrete academic or career target and take one action this week.";
  }

  return "Pick one path and commit to one concrete action in the next 7 days.";
}
