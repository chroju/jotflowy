import { describe, it, expect } from "vitest";
import { filterDailyNotesByBeforeDate, parseDateFromNodeName } from "../api/history";
import type { WorkflowyNode } from "../types";

function makeNode(overrides: Partial<WorkflowyNode> = {}): WorkflowyNode {
  return {
    id: "node-1",
    name: "Test Node",
    note: null,
    priority: 0,
    createdAt: 0,
    modifiedAt: 0,
    completedAt: null,
    ...overrides,
  };
}

describe("parseDateFromNodeName", () => {
  it("parses [YYYY-MM-DD] format", () => {
    expect(parseDateFromNodeName("[2026-05-27]")).toBe("2026-05-27");
  });

  it("parses Workflowy format (Mon, Jan 1, 2026)", () => {
    expect(parseDateFromNodeName("Tue, May 27, 2026")).toBe("2026-05-27");
  });

  it("returns null for unrecognized format", () => {
    expect(parseDateFromNodeName("some random text")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseDateFromNodeName("")).toBeNull();
  });
});

describe("filterDailyNotesByBeforeDate", () => {
  const nodes = [
    makeNode({ id: "1", name: "[2026-05-27]", priority: 1 }),
    makeNode({ id: "2", name: "[2026-05-26]", priority: 2 }),
    makeNode({ id: "3", name: "[2026-05-25]", priority: 3 }),
    makeNode({ id: "4", name: "[2026-05-24]", priority: 4 }),
    makeNode({ id: "5", name: "[2026-05-23]", priority: 5 }),
    makeNode({ id: "6", name: "[2026-05-22]", priority: 6 }),
    makeNode({ id: "7", name: "[2026-05-21]", priority: 7 }),
    makeNode({ id: "8", name: "[2026-05-20]", priority: 8 }),
    makeNode({ id: "9", name: "not a date node", priority: 9 }),
  ];

  it("returns latest 7 days when no before_date specified", () => {
    const result = filterDailyNotesByBeforeDate(nodes, null);
    expect(result).toHaveLength(7);
    expect(result[0].id).toBe("1");
    expect(result[6].id).toBe("7");
  });

  it("returns up to 7 days strictly older than before_date", () => {
    const result = filterDailyNotesByBeforeDate(nodes, "2026-05-25");
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe("4"); // 2026-05-24
    expect(result[4].id).toBe("8"); // 2026-05-20
  });

  it("excludes nodes without parseable dates", () => {
    const result = filterDailyNotesByBeforeDate(nodes, null);
    expect(result.every((n) => n.id !== "9")).toBe(true);
  });

  it("returns fewer than 7 if not enough nodes exist", () => {
    const few = nodes.slice(0, 3);
    const result = filterDailyNotesByBeforeDate(few, null);
    expect(result).toHaveLength(3);
  });

  it("returns empty array when before_date is older than all nodes", () => {
    const result = filterDailyNotesByBeforeDate(nodes, "2026-05-01");
    expect(result).toHaveLength(0);
  });
});
