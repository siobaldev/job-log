// parseJsonLoose stays exactly as it is
export function parseJsonLoose(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start)
    throw new Error("No JSON object found");
  return JSON.parse(cleaned.slice(start, end + 1));
}
