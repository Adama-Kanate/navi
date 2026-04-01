export const ONBOARDING_DRAFT_KEY = "navi:onboarding:draft";

export type OnboardingDraft = {
  fullName: string;
  currentStatus: string;
  targetDecision: string;
  deadlineWindow: string;
  stuckLevel: number;
  constraints: string;
};

export function loadOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    return {
      fullName: parsed.fullName || "",
      currentStatus: parsed.currentStatus || "",
      targetDecision: parsed.targetDecision || "",
      deadlineWindow: parsed.deadlineWindow || "",
      stuckLevel: typeof parsed.stuckLevel === "number" ? parsed.stuckLevel : 5,
      constraints: parsed.constraints || "",
    };
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage failures and keep the main flow running.
  }
}
