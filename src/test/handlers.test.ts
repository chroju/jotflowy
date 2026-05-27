import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../../src/index";
import type { WorkflowyNode } from "../types";

const mockGetNodes = vi.fn();
const mockCompleteNode = vi.fn();
const mockUncompleteNode = vi.fn();
const mockDeleteNode = vi.fn();

vi.mock("../api/workflowy-v1", () => ({
  WorkflowyClient: vi.fn().mockImplementation(() => ({
    getNodes: mockGetNodes,
    createNode: vi.fn(),
    completeNode: mockCompleteNode,
    uncompleteNode: mockUncompleteNode,
    deleteNode: mockDeleteNode,
    getOrCreateDailyNote: vi.fn(),
    findDailyNote: vi.fn(),
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

describe("GET /api/history", () => {
  beforeEach(() => {
    mockGetNodes.mockReset();
  });

  describe("daily_note=false", () => {
    it("returns nodes as flat list", async () => {
      const nodes = [makeNode({ id: "n1" }), makeNode({ id: "n2" })];
      mockGetNodes.mockResolvedValue(nodes);

      const req = makeRequest("/api/history?parent_id=parent-1&daily_note=false");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as Array<{ items: WorkflowyNode[] }>;

      expect(res.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].items[0].id).toBe("n1");
    });
  });

  describe("daily_note=true", () => {
    it("returns at most 7 date groups by default", async () => {
      const dateNodes = Array.from({ length: 10 }, (_, i) => {
        const d = String(i + 1).padStart(2, "0");
        return makeNode({ id: `date-${i}`, name: `[2026-01-${d}]`, priority: i });
      });
      mockGetNodes
        .mockResolvedValueOnce(dateNodes)
        .mockResolvedValue([makeNode()]);

      const req = makeRequest("/api/history?parent_id=parent-1&daily_note=true");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as unknown[];

      expect(res.status).toBe(200);
      expect(data.length).toBeLessThanOrEqual(7);
    });

    it("respects before_date query parameter", async () => {
      const dateNodes = Array.from({ length: 10 }, (_, i) => {
        const d = String(10 - i).padStart(2, "0");
        return makeNode({ id: `date-${i}`, name: `[2026-01-${d}]`, priority: i });
      });
      mockGetNodes
        .mockResolvedValueOnce(dateNodes)
        .mockResolvedValue([makeNode()]);

      const req = makeRequest("/api/history?parent_id=parent-1&daily_note=true&before_date=2026-01-05");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as unknown[];

      expect(res.status).toBe(200);
      expect(data).toHaveLength(4); // 2026-01-04, 03, 02, 01
    });

    it("excludes date groups with no child nodes", async () => {
      const dateNodes = [
        makeNode({ id: "date-1", name: "[2026-01-02]", priority: 1 }),
        makeNode({ id: "date-2", name: "[2026-01-01]", priority: 0 }),
      ];
      mockGetNodes
        .mockResolvedValueOnce(dateNodes)
        .mockResolvedValueOnce([makeNode()])
        .mockResolvedValueOnce([]);

      const req = makeRequest("/api/history?parent_id=parent-1&daily_note=true");
      const res = await app.fetch(req, testEnv);
      const data = await res.json() as Array<{ dateId: string }>;

      expect(res.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].dateId).toBe("date-1");
    });
  });

  it("returns 400 when parent_id is missing", async () => {
    const req = makeRequest("/api/history?daily_note=true");
    const res = await app.fetch(req, testEnv);
    expect(res.status).toBe(400);
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
