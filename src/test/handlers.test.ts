import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../../src/index";
import type { WorkflowyNode } from "../types";

const mockGetNodes = vi.fn();
const mockCreateNode = vi.fn();
const mockGetCalendarNodes = vi.fn();
const mockGetNode = vi.fn();
const mockCompleteNode = vi.fn();
const mockUncompleteNode = vi.fn();
const mockDeleteNode = vi.fn();

vi.mock("../api/workflowy-v1", () => ({
  WorkflowyClient: vi.fn().mockImplementation(() => ({
    getNodes: mockGetNodes,
    createNode: mockCreateNode,
    getCalendarNodes: mockGetCalendarNodes,
    getNode: mockGetNode,
    completeNode: mockCompleteNode,
    uncompleteNode: mockUncompleteNode,
    deleteNode: mockDeleteNode,
  })),
}));

vi.mock("../api/crypto", () => ({
  decrypt: vi.fn().mockResolvedValue("test-api-key"),
  encrypt: vi.fn().mockResolvedValue("encrypted"),
}));

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

function makeRequest(path: string, options: RequestInit = {}) {
  return new Request(`http://localhost${path}`, {
    ...options,
    headers: {
      "Cookie": "auth=encrypted-token",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

const testEnv = {
  ENCRYPTION_KEY: "test-key",
  ALLOWED_ORIGINS: "http://localhost",
};

describe("POST /api/send", () => {
  beforeEach(() => {
    mockCreateNode.mockReset();
    mockGetCalendarNodes.mockReset();
    mockGetNodes.mockReset();
    mockCreateNode.mockResolvedValue({ item_id: "created-id" });
  });

  it("creates node under 'today' for calendar target", async () => {
    const req = makeRequest("/api/send", {
      method: "POST",
      body: JSON.stringify({ targetType: "calendar", name: "Hello", note: "world" }),
    });
    const res = await app.fetch(req, testEnv);
    const data = await res.json() as { item_id: string };

    expect(res.status).toBe(200);
    expect(data.item_id).toBe("created-id");
    expect(mockCreateNode).toHaveBeenCalledTimes(1);
    expect(mockCreateNode).toHaveBeenCalledWith("today", "Hello", "world");
    expect(mockGetNodes).not.toHaveBeenCalled();
    expect(mockGetCalendarNodes).not.toHaveBeenCalled();
  });

  it("creates node under parentId for node target", async () => {
    const req = makeRequest("/api/send", {
      method: "POST",
      body: JSON.stringify({ targetType: "node", parentId: "parent-1", name: "Hello" }),
    });
    const res = await app.fetch(req, testEnv);

    expect(res.status).toBe(200);
    expect(mockCreateNode).toHaveBeenCalledWith("parent-1", "Hello", undefined);
  });

  it("returns 400 when parentId is missing for node target", async () => {
    const req = makeRequest("/api/send", {
      method: "POST",
      body: JSON.stringify({ targetType: "node", name: "Hello" }),
    });
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(400);
    expect(mockCreateNode).not.toHaveBeenCalled();
  });

  it("returns 400 for unknown targetType", async () => {
    const req = makeRequest("/api/send", {
      method: "POST",
      body: JSON.stringify({ targetType: "inbox", name: "Hello" }),
    });
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(400);
    expect(mockCreateNode).not.toHaveBeenCalled();
  });
});

describe("GET /api/history", () => {
  beforeEach(() => {
    mockGetNodes.mockReset();
    mockGetCalendarNodes.mockReset();
    mockGetNode.mockReset();
  });

  describe("node destination", () => {
    it("returns nodes as flat list", async () => {
      const nodes = [makeNode({ id: "n1" }), makeNode({ id: "n2" })];
      mockGetNodes.mockResolvedValue(nodes);

      const req = makeRequest("/api/history?parent_id=parent-1");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as Array<{ items: WorkflowyNode[] }>;

      expect(res.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].items[0].id).toBe("n1");
    });

    it("returns 400 when parent_id is missing", async () => {
      const req = makeRequest("/api/history");
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(400);
    });
  });

  describe("calendar destination", () => {
    // Helper: days in `nonEmpty` return one child; everything else is empty (404 -> [])
    function stubCalendar(nonEmpty: Record<string, WorkflowyNode[]>) {
      mockGetCalendarNodes.mockImplementation((key: string) =>
        Promise.resolve(nonEmpty[key] ?? [])
      );
      mockGetNode.mockImplementation((key: string) =>
        Promise.resolve(makeNode({ id: `day-${key}` }))
      );
    }

    it("returns up to 7 date groups, newest first, with ISO date and dateId", async () => {
      const nonEmpty: Record<string, WorkflowyNode[]> = {};
      for (let d = 4; d <= 10; d++) {
        const key = `2026-01-${String(d).padStart(2, "0")}`;
        nonEmpty[key] = [makeNode({ id: `item-${key}` })];
      }
      stubCalendar(nonEmpty);

      const req = makeRequest("/api/history?calendar=true&local_date=2026-01-10");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as Array<{ date: string; dateId: string; items: WorkflowyNode[]; hasMore: boolean }>;

      expect(res.status).toBe(200);
      expect(data).toHaveLength(7);
      expect(data[0].date).toBe("2026-01-10");
      expect(data[6].date).toBe("2026-01-04");
      expect(data[0].dateId).toBe("day-2026-01-10");
      expect(data[0].items[0].id).toBe("item-2026-01-10");
      expect(data[6].hasMore).toBe(true);
    });

    it("starts probing at local_date + 1 to cover timezone skew", async () => {
      stubCalendar({ "2026-01-11": [makeNode({ id: "tomorrow-item" })] });

      const req = makeRequest("/api/history?calendar=true&local_date=2026-01-10");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as Array<{ date: string }>;

      expect(res.status).toBe(200);
      expect(mockGetCalendarNodes).toHaveBeenCalledWith("2026-01-11");
      expect(data.some((g) => g.date === "2026-01-11")).toBe(true);
    });

    it("skips empty days and stops at the scan cap with hasMore=false", async () => {
      // Only 2 non-empty days within the 31-day window
      stubCalendar({
        "2026-01-08": [makeNode({ id: "a" })],
        "2025-12-20": [makeNode({ id: "b" })],
      });

      const req = makeRequest("/api/history?calendar=true&local_date=2026-01-10");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as Array<{ date: string; hasMore: boolean }>;

      expect(res.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].date).toBe("2026-01-08");
      expect(data[1].date).toBe("2025-12-20");
      expect(data[1].hasMore).toBe(false);
      expect(mockGetCalendarNodes).toHaveBeenCalledTimes(31);
    });

    it("stops probing early once 7 groups are found", async () => {
      const nonEmpty: Record<string, WorkflowyNode[]> = {};
      for (let d = 1; d <= 11; d++) {
        const key = `2026-01-${String(d).padStart(2, "0")}`;
        nonEmpty[key] = [makeNode()];
      }
      stubCalendar(nonEmpty);

      const req = makeRequest("/api/history?calendar=true&local_date=2026-01-10");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as unknown[];

      expect(res.status).toBe(200);
      expect(data).toHaveLength(7);
      expect(mockGetCalendarNodes.mock.calls.length).toBeLessThan(31);
    });

    it("paginates from the day before before_date", async () => {
      stubCalendar({
        "2026-01-05": [makeNode({ id: "at-boundary" })],
        "2026-01-04": [makeNode({ id: "older" })],
      });

      const req = makeRequest("/api/history?calendar=true&before_date=2026-01-05");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as Array<{ date: string }>;

      expect(res.status).toBe(200);
      expect(mockGetCalendarNodes).not.toHaveBeenCalledWith("2026-01-05");
      expect(data).toHaveLength(1);
      expect(data[0].date).toBe("2026-01-04");
    });

    it("sets dateId to null when day node lookup fails", async () => {
      mockGetCalendarNodes.mockImplementation((key: string) =>
        Promise.resolve(key === "2026-01-10" ? [makeNode()] : [])
      );
      mockGetNode.mockRejectedValue(new Error("boom"));

      const req = makeRequest("/api/history?calendar=true&local_date=2026-01-10");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as Array<{ dateId: string | null }>;

      expect(res.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].dateId).toBeNull();
    });

    it("returns empty array when no notes exist in the scan window", async () => {
      stubCalendar({});

      const req = makeRequest("/api/history?calendar=true&local_date=2026-01-10");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as unknown[];

      expect(res.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("returns 400 when neither local_date nor before_date is given", async () => {
      const req = makeRequest("/api/history?calendar=true");
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(400);
    });

    it("returns 400 for malformed date", async () => {
      const req = makeRequest("/api/history?calendar=true&local_date=today");
      const res = await app.fetch(req, testEnv);
      expect(res.status).toBe(400);
    });
  });
});

describe("DELETE /api/nodes/:id", () => {
  beforeEach(() => {
    mockDeleteNode.mockReset();
  });

  it("calls deleteNode and returns ok", async () => {
    mockDeleteNode.mockResolvedValue(undefined);
    const req = makeRequest("/api/nodes/node-abc", { method: "DELETE" });
    const res = await app.fetch(req, testEnv);
    const data = await res.json() as { ok: boolean };

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockDeleteNode).toHaveBeenCalledWith("node-abc");
  });
});
