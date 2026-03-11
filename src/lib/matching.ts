export function normalizeText(value: string | null | undefined) {
  if (!value) return "";

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

export function getDecisionBucket(value: string | null | undefined) {
  const text = normalizeText(value);

  if (!text) return "unknown";
  if (text.includes("internship")) return "internship";
  if (text.includes("master")) return "masters";
  if (
    text.includes("first job") ||
    text.includes("search first job") ||
    text.includes("seach first job")
  ) {
    return "first-job";
  }
  if (text.includes("switch") && text.includes("career")) return "switch-careers";
  if (text.includes("post secondary") || text.includes("postsecondary")) {
    return "post-secondary";
  }

  return text;
}

export function sameStatus(a: string | null | undefined, b: string | null | undefined) {
  return normalizeText(a) === normalizeText(b);
}

export function sameDecision(a: string | null | undefined, b: string | null | undefined) {
  const bucketA = getDecisionBucket(a);
  const bucketB = getDecisionBucket(b);
  return bucketA === bucketB;
}