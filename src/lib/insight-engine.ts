import "server-only";
import OpenAI from "openai";

type InsightInput = {
  currentStatus?: string | null;
  targetDecision?: string | null;
  deadlineWindow?: string | null;
  stuckLevel?: number | null;
  constraints?: string[] | null;
};

type NormalizedInsightInput = Required<InsightInput>;

export type InsightResponse = {
  summary: string;
  nextStep: string;
  strengths: string[];
  gaps: string[];
  personalizedSteps: string[];
};

type ConstraintSignals = {
  hasBudget: boolean;
  hasVisa: boolean;
  hasInternationalStatus: boolean;
  hasExplicitLocation: boolean;
  locationPhrase: string;
  internationalPhrase: string;
  visaPhrase: string;
  situationPhrase: string;
};

function normalize(value: string | null | undefined) {
  return (value || "").trim();
}

function asLower(value: string | null | undefined) {
  return normalize(value).toLowerCase();
}

function hasConstraint(constraints: string[] | null | undefined, keyword: string) {
  if (!constraints || constraints.length === 0) return false;
  const target = keyword.toLowerCase();
  return constraints.some((item) => asLower(item).includes(target));
}

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
  const text = normalize(constraint);
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
  const normalized = raw.map((item) => asLower(item));

  const hasVisa = normalized.some(
    (item) => item.includes("visa") || item.includes("residence permit") || item.includes("work permit")
  );
  const hasInternationalStatus = normalized.some(
    (item) =>
      item.includes("international") ||
      item.includes("foreign") ||
      item.includes("abroad") ||
      item.includes("expat")
  );
  const hasBudget = normalized.some(
    (item) => item.includes("budget") || item.includes("cost") || item.includes("finance")
  );

  const locationValue = raw
    .map((item) => extractLocationValue(item))
    .find((value) => Boolean(value));
  const hasExplicitLocation = Boolean(locationValue);

  const locationPhrase = locationValue ? `in ${locationValue}` : "in your target location";
  const internationalPhrase = hasInternationalStatus ? "as an international student" : "";
  const visaPhrase = hasVisa ? "with visa constraints" : "";
  const situationPhrase = !hasExplicitLocation && !hasInternationalStatus && !hasVisa
    ? "based on your situation"
    : "";

  return {
    hasBudget,
    hasVisa,
    hasInternationalStatus,
    hasExplicitLocation,
    locationPhrase,
    internationalPhrase,
    visaPhrase,
    situationPhrase,
  };
}

function buildConstraintContext(signals: ConstraintSignals) {
  const contextParts = [signals.locationPhrase, signals.internationalPhrase, signals.visaPhrase]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (signals.situationPhrase) {
    return `${signals.locationPhrase} ${signals.situationPhrase}`;
  }

  if (contextParts) return contextParts;
  return "in your target location based on your situation";
}

function inferFieldPhrase(targetDecision: string) {
  const text = asLower(targetDecision);

  if (text.includes("consult")) return "in consulting";
  if (text.includes("finance") || text.includes("bank")) return "in finance";
  if (text.includes("tech") || text.includes("software") || text.includes("data")) {
    return "in tech";
  }
  if (text.includes("marketing") || text.includes("brand")) return "in marketing";
  if (text.includes("design") || text.includes("creative")) return "in design";
  if (text.includes("product")) return "in product roles";

  return "in your field of interest";
}

function getHorizonLabel(deadlineWindow: string) {
  const text = asLower(deadlineWindow);

  if (text.includes("less than 2 weeks") || text.includes("2-4 weeks") || text.includes("2–4 weeks")) {
    return "short";
  }

  if (text.includes("1-3 months") || text.includes("1–3 months") || text.includes("3-6 months") || text.includes("3–6 months")) {
    return "medium";
  }

  if (text.includes("more than 6 months")) {
    return "long";
  }

  return "unknown";
}

function buildSummary(profile: NormalizedInsightInput) {
  const status = normalize(profile.currentStatus) || "learner";
  const decision = normalize(profile.targetDecision) || "clarify your next direction";
  const horizon = getHorizonLabel(profile.deadlineWindow || "");

  if (horizon === "short") {
    return `You are a ${status.toLowerCase()} aiming to ${decision.toLowerCase()} with a short decision horizon.`;
  }

  if (horizon === "medium") {
    return `You are a ${status.toLowerCase()} aiming to ${decision.toLowerCase()} with a moderate timeline to prepare.`;
  }

  if (horizon === "long") {
    return `You are a ${status.toLowerCase()} aiming to ${decision.toLowerCase()} with enough time to build a strong foundation.`;
  }

  return `You are a ${status.toLowerCase()} working to ${decision.toLowerCase()} and turning that goal into a clear action plan.`;
}

function buildNextStep(profile: NormalizedInsightInput) {
  const decision = asLower(profile.targetDecision);
  const stuckLevel = typeof profile.stuckLevel === "number" ? profile.stuckLevel : 5;
  const horizon = getHorizonLabel(profile.deadlineWindow || "");

  if (horizon === "short") {
    return "Choose one high-impact task and complete it within the next 48 hours.";
  }

  if (stuckLevel >= 8) {
    return "Book one mentor conversation this week to validate your direction and reduce uncertainty.";
  }

  if (decision.includes("internship")) {
    return "Shortlist 3 internship targets and prepare one application this week.";
  }

  if (decision.includes("first job")) {
    return "Identify 2 realistic first-job roles and compare requirements before applying.";
  }

  if (decision.includes("master")) {
    return "Compare 3 master's programs and note deadlines, eligibility, and required documents.";
  }

  if (decision.includes("switch") && decision.includes("career")) {
    return "Pick one transition role and map 3 transferable skills to build this month.";
  }

  return "Select one direction and complete one concrete action in the next 7 days.";
}

function buildStrengths(profile: NormalizedInsightInput) {
  const strengths: string[] = [];

  if (normalize(profile.targetDecision)) {
    strengths.push("You have a defined decision goal, which improves focus.");
  }

  if (normalize(profile.deadlineWindow)) {
    strengths.push("You have a clear time horizon to prioritize actions.");
  }

  if (typeof profile.stuckLevel === "number" && profile.stuckLevel <= 5) {
    strengths.push("Your current confidence level supports steady execution.");
  }

  if (normalize(profile.currentStatus)) {
    strengths.push("Your current status helps tailor realistic next steps.");
  }

  if (strengths.length === 0) {
    strengths.push("You have already started reflecting on your direction, which is a strong first step.");
  }

  return strengths.slice(0, 3);
}

function buildGaps(profile: NormalizedInsightInput) {
  const gaps: string[] = [];
  const decision = asLower(profile.targetDecision);

  if (typeof profile.stuckLevel === "number" && profile.stuckLevel >= 7) {
    gaps.push("High uncertainty may delay decisions without external feedback.");
  }

  if (!normalize(profile.deadlineWindow)) {
    gaps.push("Your timeline is not yet defined, which makes prioritization harder.");
  }

  if (hasConstraint(profile.constraints, "budget")) {
    gaps.push("Budget constraints may limit options unless filtered early.");
  }

  if (hasConstraint(profile.constraints, "visa") || hasConstraint(profile.constraints, "location")) {
    gaps.push("Location or visa constraints may reduce available opportunities.");
  }

  if (decision.includes("first job")) {
    gaps.push("Role clarity and proof of readiness may still need refinement.");
  }

  if (decision.includes("internship")) {
    gaps.push("Application readiness and timing can become bottlenecks.");
  }

  if (gaps.length === 0) {
    gaps.push("The next gap is execution consistency over the next few weeks.");
  }

  return gaps.slice(0, 3);
}

function buildPersonalizedSteps(profile: NormalizedInsightInput) {
  const steps: string[] = [];
  const decision = asLower(profile.targetDecision);
  const status = asLower(profile.currentStatus);
  const horizon = getHorizonLabel(profile.deadlineWindow || "");
  const signals = inferConstraintSignals(profile.constraints);
  const fieldPhrase = inferFieldPhrase(profile.targetDecision || "");
  const contextPhrase = buildConstraintContext(signals);
  const locationPhrase = signals.locationPhrase;
  const visaPhrase = signals.visaPhrase;
  const careerPathDecision =
    decision.includes("job") ||
    decision.includes("internship") ||
    decision.includes("career") ||
    decision.includes("role") ||
    decision.includes("position");

  if (horizon === "short") {
    steps.push("Choose one priority direction and complete the first concrete action within 48 hours.");
  } else if (horizon === "medium") {
    steps.push("Block two focused sessions this week to compare options and move one decision task forward.");
  } else {
    steps.push("Define a four-week milestone and split it into weekly actions you can track.");
  }

  steps.push(
    `Shortlist three realistic options ${fieldPhrase} ${locationPhrase} and rank them by fit, feasibility, and timeline by the end of this week.`
  );

  if (careerPathDecision) {
    steps.push(
      `Reach out to two professionals working ${fieldPhrase} this week and ask one specific question about entry requirements.`
    );
  } else {
    steps.push(
      "Collect feedback from two trusted people on your top direction and use it to refine your decision criteria."
    );
  }

  if (decision.includes("internship")) {
    steps.push("Tailor one resume and one cover letter for your top internship target and submit at least two applications this week.");
  } else if (decision.includes("first job")) {
    steps.push("Prepare one targeted first-job application package and submit at least two applications this week.");
  } else if (decision.includes("master")) {
    steps.push("Build one comparison sheet for three programs and start one key requirement for your top option this week.");
  } else if (decision.includes("switch") && decision.includes("career")) {
    steps.push(`Define one transition target ${fieldPhrase} and complete one proof-of-skill task this week.`);
  } else {
    steps.push("Select your top two directions and complete one measurable test action for each this week.");
  }

  if (status.includes("high school")) {
    steps.push("Discuss your top option with one teacher or advisor and convert the feedback into one immediate action.");
  } else if (status.includes("university") || status.includes("master")) {
    steps.push("Use campus or alumni resources to schedule one feedback conversation on your chosen direction this week.");
  } else if (status.includes("working professional")) {
    steps.push("Reserve two non-negotiable calendar slots this week for career progress tasks.");
  }

  if (signals.hasBudget) {
    steps.push(`Apply a budget filter first and keep only options ${locationPhrase} that fit your current financial constraints.`);
  }

  if (signals.hasVisa || signals.locationPhrase !== "in your target location") {
    const visaContext = visaPhrase ? ` ${visaPhrase}` : "";
    steps.push(`Validate eligibility criteria ${locationPhrase}${visaContext} before applications to avoid spending time on ineligible options.`);
  }

  if (typeof profile.stuckLevel === "number" && profile.stuckLevel >= 8) {
    steps.push(`Book one mentor or peer accountability check-in this week ${contextPhrase} to reduce decision paralysis.`);
  }

  const uniqueSteps = Array.from(new Set(steps));

  if (uniqueSteps.length < 3) {
    uniqueSteps.push("Define one clear weekly target and track completion at the end of the week.");
  }
  if (uniqueSteps.length < 3) {
    uniqueSteps.push("Schedule one feedback conversation to validate your current direction.");
  }

  return uniqueSteps.slice(0, 5);
}

function normalizeInput(input: InsightInput): NormalizedInsightInput {
  return {
    currentStatus: input.currentStatus ?? null,
    targetDecision: input.targetDecision ?? null,
    deadlineWindow: input.deadlineWindow ?? null,
    stuckLevel: input.stuckLevel ?? null,
    constraints: input.constraints ?? [],
  };
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseInsightResponse(raw: string): { data: InsightResponse | null; reason?: "parse_failure" | "schema_validation_failure" } {
  let parsed: Partial<InsightResponse>;

  try {
    parsed = JSON.parse(raw) as Partial<InsightResponse>;
    console.log("PARSED AI JSON:", parsed);
  } catch (error) {
    console.log("AI VALIDATION ERROR: JSON.parse failed", error);
    return { data: null, reason: "parse_failure" };
  }

  if (typeof parsed.summary !== "string") {
    console.log("AI VALIDATION ERROR: missing or invalid field 'summary'");
    return { data: null, reason: "schema_validation_failure" };
  }

  if (typeof parsed.nextStep !== "string") {
    console.log("AI VALIDATION ERROR: missing or invalid field 'nextStep'");
    return { data: null, reason: "schema_validation_failure" };
  }

  if (!isStringArray(parsed.strengths)) {
    console.log("AI VALIDATION ERROR: missing or invalid field 'strengths' (expected string[])");
    return { data: null, reason: "schema_validation_failure" };
  }

  if (!isStringArray(parsed.gaps)) {
    console.log("AI VALIDATION ERROR: missing or invalid field 'gaps' (expected string[])");
    return { data: null, reason: "schema_validation_failure" };
  }

  if (!isStringArray(parsed.personalizedSteps)) {
    console.log("AI VALIDATION ERROR: missing or invalid field 'personalizedSteps' (expected string[])");
    return { data: null, reason: "schema_validation_failure" };
  }

  if (parsed.personalizedSteps.length < 3 || parsed.personalizedSteps.length > 5) {
    console.log("AI VALIDATION ERROR: 'personalizedSteps' must contain between 3 and 5 items");
    return { data: null, reason: "schema_validation_failure" };
  }

  const result: InsightResponse = {
    summary: parsed.summary.trim(),
    nextStep: parsed.nextStep.trim(),
    strengths: parsed.strengths.map((item) => item.trim()).filter(Boolean),
    gaps: parsed.gaps.map((item) => item.trim()).filter(Boolean),
    personalizedSteps: parsed.personalizedSteps.map((item) => item.trim()).filter(Boolean),
  };

  if (result.summary.length === 0) {
    console.log("AI VALIDATION ERROR: 'summary' is empty after trimming");
    return { data: null, reason: "schema_validation_failure" };
  }

  if (result.nextStep.length === 0) {
    console.log("AI VALIDATION ERROR: 'nextStep' is empty after trimming");
    return { data: null, reason: "schema_validation_failure" };
  }

  if (result.strengths.length === 0) {
    console.log("AI VALIDATION ERROR: 'strengths' has no non-empty values");
    return { data: null, reason: "schema_validation_failure" };
  }

  if (result.gaps.length === 0) {
    console.log("AI VALIDATION ERROR: 'gaps' has no non-empty values");
    return { data: null, reason: "schema_validation_failure" };
  }

  if (result.personalizedSteps.length < 3 || result.personalizedSteps.length > 5) {
    console.log("AI VALIDATION ERROR: 'personalizedSteps' has invalid count after trimming");
    return { data: null, reason: "schema_validation_failure" };
  }

  return { data: result };
}

export function generateInsightRuleBased(input: InsightInput): InsightResponse {
  const normalized = normalizeInput(input);

  return {
    summary: buildSummary(normalized),
    nextStep: buildNextStep(normalized),
    strengths: buildStrengths(normalized),
    gaps: buildGaps(normalized),
    personalizedSteps: buildPersonalizedSteps(normalized),
  };
}

export async function generateInsightAI(input: InsightInput): Promise<InsightResponse> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("AI FALLBACK: missing api key");
    console.log("AI FALLBACK");
    return generateInsightRuleBased(input);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const normalizedInput = normalizeInput(input);

    console.log("AI CALLED");

    const response = await openai.responses.create({
      model,
      temperature: 0.4,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are a career guidance assistant. Return strict JSON only with this exact schema: {\"summary\": string, \"nextStep\": string, \"strengths\": string[], \"gaps\": string[], \"personalizedSteps\": string[]} and keep personalizedSteps length between 3 and 5. No markdown.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Generate insights for this profile:\n${JSON.stringify(normalizedInput)}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "insight_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              nextStep: { type: "string" },
              strengths: {
                type: "array",
                items: { type: "string" },
              },
              gaps: {
                type: "array",
                items: { type: "string" },
              },
              personalizedSteps: {
                type: "array",
                minItems: 3,
                maxItems: 5,
                items: { type: "string" },
              },
            },
            required: ["summary", "nextStep", "strengths", "gaps", "personalizedSteps"],
          },
        },
      },
    });

    console.log("RAW AI RESPONSE:", response);

    const raw =
      response.output_text ||
      (response.output?.[0] as { content?: Array<{ text?: string }> } | undefined)?.content?.[0]?.text ||
      "";

    console.log("RAW AI TEXT:", raw);

    if (!raw) {
      console.log("AI FALLBACK: empty raw text");
      console.log("AI FALLBACK");
      return generateInsightRuleBased(input);
    }

    const parsedResult = parseInsightResponse(raw);
    if (!parsedResult.data) {
      if (parsedResult.reason === "parse_failure") {
        console.log("AI FALLBACK: parse failure");
      } else {
        console.log("AI FALLBACK: schema validation failure");
      }
      console.log("AI FALLBACK");
      return generateInsightRuleBased(input);
    }

    console.log("AI SUCCESS");

    return parsedResult.data;
  } catch (error) {
    console.log("AI FALLBACK: runtime error", error);
    console.log("AI FALLBACK");
    return generateInsightRuleBased(input);
  }
}

export async function generateInsight(input: InsightInput): Promise<InsightResponse> {
  if (process.env.USE_AI === "true") {
    return generateInsightAI(input);
  }

  return generateInsightRuleBased(input);
}
