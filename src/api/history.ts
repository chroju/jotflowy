import type { WorkflowyNode } from "../types";

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

export function parseDateFromNodeName(name: string): string | null {
  const bracketMatch = name.match(/\[(\d{4}-\d{2}-\d{2})\]/);
  if (bracketMatch) return bracketMatch[1];

  const workflowyMatch = name.match(/\w{3}, (\w{3}) (\d{1,2}), (\d{4})/);
  if (workflowyMatch) {
    const month = MONTHS[workflowyMatch[1]];
    if (!month) return null;
    const day = workflowyMatch[2].padStart(2, "0");
    const year = workflowyMatch[3];
    return `${year}-${month}-${day}`;
  }

  return null;
}

export function filterDailyNotesByBeforeDate(
  nodes: WorkflowyNode[],
  beforeDate: string | null,
  limit = 7
): WorkflowyNode[] {
  const dated = nodes
    .map((node) => ({ node, dateStr: parseDateFromNodeName(node.name || "") }))
    .filter((item): item is { node: WorkflowyNode; dateStr: string } => item.dateStr !== null)
    .sort((a, b) => b.dateStr.localeCompare(a.dateStr));

  const filtered = beforeDate
    ? dated.filter((item) => item.dateStr < beforeDate)
    : dated;

  return filtered.slice(0, limit).map((item) => item.node);
}
