export function formatDate(iso?: string | null) {
  if (!iso)
    return "";
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
