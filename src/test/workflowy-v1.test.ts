import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkflowyClient } from "../api/workflowy-v1";
import type { WorkflowyNode } from "../types";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

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

function okResponse(body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
}

describe("WorkflowyClient", () => {
  const client = new WorkflowyClient("test-api-key");

  describe("getNodes", () => {
    it("returns nodes sorted by priority", async () => {
      const nodes = [
        makeNode({ id: "b", priority: 2 }),
        makeNode({ id: "a", priority: 1 }),
      ];
      mockFetch.mockReturnValue(okResponse({ nodes }));

      const result = await client.getNodes("parent-1");
      expect(result[0].id).toBe("a");
      expect(result[1].id).toBe("b");
    });

    it("calls correct endpoint with parent_id", async () => {
      mockFetch.mockReturnValue(okResponse({ nodes: [] }));
      await client.getNodes("my-parent");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("parent_id=my-parent"),
        expect.any(Object)
      );
    });

    it("throws on HTTP error", async () => {
      mockFetch.mockReturnValue(
        Promise.resolve(new Response("Not Found", { status: 404 }))
      );
      await expect(client.getNodes()).rejects.toThrow("404");
    });
  });

  describe("createNode", () => {
    it("sends correct request body", async () => {
      mockFetch.mockReturnValue(okResponse({ item_id: "new-id" }));
      await client.createNode("parent-1", "My Node", "my note", "top");

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body).toMatchObject({
        parent_id: "parent-1",
        name: "My Node",
        note: "my note",
        position: "top",
      });
    });

    it("omits undefined note and position", async () => {
      mockFetch.mockReturnValue(okResponse({ item_id: "new-id" }));
      await client.createNode("parent-1", "My Node");

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.note).toBeUndefined();
      expect(body.position).toBeUndefined();
    });
  });

  describe("findDailyNote", () => {
    it("finds node matching ISO date string", async () => {
      const nodes = [makeNode({ id: "daily-1", name: "[2026-02-14]" })];
      mockFetch.mockReturnValue(okResponse({ nodes }));

      const result = await client.findDailyNote("parent-1", "2026-02-14");
      expect(result?.id).toBe("daily-1");
    });

    it("finds node matching Workflowy date format", async () => {
      const nodes = [makeNode({ id: "daily-1", name: "Sat, Feb 14, 2026" })];
      mockFetch.mockReturnValue(okResponse({ nodes }));

      const result = await client.findDailyNote("parent-1", "2026-02-14");
      expect(result?.id).toBe("daily-1");
    });

    it("returns null when no matching node", async () => {
      mockFetch.mockReturnValue(okResponse({ nodes: [] }));
      const result = await client.findDailyNote("parent-1", "2026-02-14");
      expect(result).toBeNull();
    });
  });

  describe("getOrCreateDailyNote", () => {
    it("returns existing node ID if found", async () => {
      const nodes = [makeNode({ id: "existing-daily", name: "[2026-02-14]" })];
      mockFetch.mockReturnValue(okResponse({ nodes }));

      const id = await client.getOrCreateDailyNote("parent-1", "2026-02-14");
      expect(id).toBe("existing-daily");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("creates node if not found and returns new ID", async () => {
      mockFetch
        .mockReturnValueOnce(okResponse({ nodes: [] }))
        .mockReturnValueOnce(okResponse({ item_id: "new-daily" }));

      const id = await client.getOrCreateDailyNote("parent-1", "2026-02-14");
      expect(id).toBe("new-daily");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("completeNode", () => {
    it("calls correct endpoint", async () => {
      mockFetch.mockReturnValue(okResponse({}));
      await client.completeNode("node-abc");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/nodes/node-abc/complete"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("uncompleteNode", () => {
    it("calls correct endpoint", async () => {
      mockFetch.mockReturnValue(okResponse({}));
      await client.uncompleteNode("node-abc");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/nodes/node-abc/uncomplete"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});
