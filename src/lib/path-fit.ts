export type PathFitProfileInput = {
  current_status: string | null;
  target_decision: string | null;
  deadline_window: string | null;
  stuck_level: number | null;
  constraints?: string[] | null;
};

export type PathFitPathInput = {
  title: string;
  category: string | null;
  short_description: string | null;
};

type PathAngle = "decision" | "positioning" | "execution";

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

type ConstraintSignals = {
  hasExplicitLocation: boolean;
  locationPhrase: string;
  internationalPhrase: string;
  visaPhrase: string;
  situationPhrase: string;
};

function cleanLocationValue(rawValue: string) {
  const withoutTrailingClause = rawValue
    .split(/\b(with|and|as|for|who|while|where)\b/i)[0]
    .trim()
    .replace(/[.,;:]+$/, "")
    .trim();

  if (!withoutTrailingClause) return "";

  const words = withoutTrailingClause.split(/\s+/).filter(Boolean);
  if (words.length > 5) return "";

  return withoutTrailingClause;
}

function extractLocationValue(constraint: string) {
  const text = constraint.trim();
  if (!text) return "";

  const labeledMatch = text.match(/(?:location|country|city|region)\s*:\s*([^,.;]+)/i);
  if (labeledMatch?.[1]) {
    return cleanLocationValue(labeledMatch[1]);
  }

  const inMatch = text.match(/\b(?:in|at)\s+([A-Za-z][A-Za-z\s'-]{1,40})/i);
  if (inMatch?.[1]) {
    return cleanLocationValue(inMatch[1]);
  }

  return "";
}

function inferConstraintSignals(constraints: string[] | null | undefined): ConstraintSignals {
  const raw = constraints || [];
  const normalized = raw.map((c) => normalize(c));

  const locationValue = raw
    .map((c) => extractLocationValue(c))
    .find((value) => Boolean(value));
  const hasExplicitLocation = Boolean(locationValue);
  const hasVisa = normalized.some(
    (c) => c.includes("visa") || c.includes("residence permit") || c.includes("work permit")
  );
  const hasInternational = normalized.some(
    (c) => c.includes("international") || c.includes("foreign") || c.includes("abroad") || c.includes("expat")
  );

  return {
    hasExplicitLocation,
    locationPhrase: locationValue ? `in ${locationValue}` : "in your target location",
    internationalPhrase: hasInternational ? "as an international student" : "",
    visaPhrase: hasVisa ? "with visa constraints" : "",
    situationPhrase: !hasExplicitLocation && !hasInternational && !hasVisa
      ? "based on your situation"
      : "",
  };
}

function buildConstraintContext(signals: ConstraintSignals) {
  const context = [signals.locationPhrase, signals.internationalPhrase, signals.visaPhrase]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (signals.situationPhrase) {
    return `${signals.locationPhrase} ${signals.situationPhrase}`;
  }

  return context || "in your target location based on your situation";
}

function getDeadlineLabel(deadline: string) {
  if (deadline.includes("less than 2 weeks") || deadline.includes("2-4 weeks") || deadline.includes("2-4") || deadline.includes("2–4 weeks")) {
    return "a short horizon";
  }

  if (deadline.includes("1-3 months") || deadline.includes("1–3 months") || deadline.includes("3-6 months") || deadline.includes("3–6 months")) {
    return "a medium horizon";
  }

  if (deadline.includes("more than 6 months")) {
    return "a long horizon";
  }

  return "your timeline";
}

function getDeadlineSentence(deadline: string) {
  const label = getDeadlineLabel(deadline);
  if (label === "your timeline") {
    return "It matches your current timeline.";
  }
  return `It fits a ${label} timeline.`;
}

function getFieldPhrase(text: string) {
  if (includesAny(text, ["consult"])) return "in consulting";
  if (includesAny(text, ["finance", "bank"])) return "in finance";
  if (includesAny(text, ["tech", "software", "data", "engineering"])) return "in tech";
  if (includesAny(text, ["marketing", "brand"])) return "in marketing";
  if (includesAny(text, ["design", "creative"])) return "in design";
  if (includesAny(text, ["product"])) return "in product roles";
  return "in the options you are considering";
}

function getStatusPhrase(status: string) {
  const clean = status.trim();
  if (!clean) return "at your current stage";
  return `as a ${clean}`;
}

function getDecisionGoal(decision: string) {
  const clean = decision.trim();
  if (!clean) {
    return {
      base: "clarify your next move",
      compare: "compare your strongest options",
      position: "shape a direction that suits your strengths",
      execute: "turn your direction into a concrete plan",
    };
  }

  const lower = clean.toLowerCase();

  if (lower.startsWith("choose ")) {
    const topic = clean.slice(7).trim();
    return {
      base: `choose ${topic}`,
      compare: `compare options and choose ${topic}`,
      position: `position yourself for the right ${topic}`,
      execute: `prepare concrete steps to secure ${topic}`,
    };
  }

  if (includesAny(lower, ["switch careers", "career switch", "transition"])) {
    return {
      base: "switch careers",
      compare: "compare realistic career-switch options",
      position: "position your experience for a career switch",
      execute: "build a concrete transition plan",
    };
  }

  if (includesAny(lower, ["first job", "job", "internship", "role"])) {
    return {
      base: clean,
      compare: `compare realistic paths for ${clean}`,
      position: `position yourself for ${clean}`,
      execute: `move quickly on applications for ${clean}`,
    };
  }

  return {
    base: clean,
    compare: `compare options for ${clean}`,
    position: `position yourself clearly for ${clean}`,
    execute: `turn ${clean} into concrete next steps`,
  };
}

function withConstraintContext(baseSentence: string, contextPhrase: string) {
  if (!contextPhrase) return baseSentence;
  if (contextPhrase.includes("your target location") || contextPhrase.includes("visa")) {
    return `${baseSentence} It also stays realistic ${contextPhrase}.`;
  }
  return `${baseSentence} It stays realistic ${contextPhrase}.`;
}

function getPathAngle(pathText: string, cardIndex: number): PathAngle {
  const preferredByIndex: PathAngle[] = ["decision", "positioning", "execution"];
  const angleFromIndex = preferredByIndex[((cardIndex % 3) + 3) % 3];

  const decisionHint = includesAny(pathText, ["decision", "compare", "choose", "clarify", "option"]);
  const positioningHint = includesAny(pathText, ["position", "positioning", "direction", "brand", "network", "profile"]);
  const executionHint = includesAny(pathText, ["apply", "application", "execute", "plan", "step", "action"]);

  if (angleFromIndex === "decision" && (decisionHint || !positioningHint)) return "decision";
  if (angleFromIndex === "positioning" && (positioningHint || !executionHint)) return "positioning";
  if (angleFromIndex === "execution" && (executionHint || !decisionHint)) return "execution";

  if (decisionHint) return "decision";
  if (positioningHint) return "positioning";
  return "execution";
}

export function getWhyPathFits(
  profile: PathFitProfileInput | null,
  path: PathFitPathInput,
  cardIndex = 0
) {
  const title = normalize(path.title);
  const category = normalize(path.category);
  const description = normalize(path.short_description);
  const pathText = `${title} ${category} ${description}`.trim();

  if (!profile) {
    return "This path fits you because it gives you a clear structure to start taking concrete action right away.";
  }

  const rawStatus = profile.current_status?.trim() || "";
  const status = normalize(profile.current_status) || "learner";
  const decision = normalize(profile.target_decision);
  const deadline = normalize(profile.deadline_window);
  const stuckLevel = profile.stuck_level ?? 0;
  const decisionText = decision || "clarify your next decision";
  const fieldPhrase = getFieldPhrase(`${decisionText} ${pathText}`);
  const statusPhrase = getStatusPhrase(rawStatus || status);
  const decisionGoal = getDecisionGoal(profile.target_decision?.trim() || "");
  const signals = inferConstraintSignals(profile.constraints);
  const contextPhrase = buildConstraintContext(signals);
  const deadlineSentence = getDeadlineSentence(deadline);
  const pathAngle = getPathAngle(pathText, cardIndex);
  const supportPhrase =
    stuckLevel >= 8
      ? "It gives you structure when everything feels urgent."
      : "It keeps your momentum with practical next moves.";

  if (pathAngle === "decision") {
    const base = `This path helps you ${decisionGoal.compare} ${statusPhrase}, with clearer trade-offs ${fieldPhrase}.`;
    return withConstraintContext(`${base} ${supportPhrase}`, contextPhrase);
  }

  if (pathAngle === "positioning") {
    const base = `This option helps you ${decisionGoal.position} ${statusPhrase}, so your direction feels focused and credible.`;
    return withConstraintContext(`${base} ${supportPhrase}`, contextPhrase);
  }

  const executionBase = `This path helps you ${decisionGoal.execute} ${statusPhrase}, with clear steps you can act on now.`;
  const withContext = withConstraintContext(executionBase, contextPhrase);
  return `${withContext} ${deadlineSentence}`;
}
