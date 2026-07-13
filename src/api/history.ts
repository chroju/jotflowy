// Date-key helpers for probing Workflowy native calendar nodes.
// All arithmetic is done in UTC so results are timezone-independent.

export function addDays(iso: string, n: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + n);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateKeysBack(start: string, count: number): string[] {
  const keys: string[] = [];
  for (let i = 0; i < count; i++) {
    keys.push(addDays(start, -i));
  }
  return keys;
}
