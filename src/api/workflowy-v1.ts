import type { WorkflowyNode, WorkflowyNodesResponse, CreateNodeResponse } from "../types";

const BASE_URL = "https://beta.workflowy.com/api/v1";

export class WorkflowyClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Workflowy API error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async getNodes(parentId: string = "None"): Promise<WorkflowyNode[]> {
    const data = await this.request<WorkflowyNodesResponse>(
      `/nodes?parent_id=${encodeURIComponent(parentId)}`
    );
    return data.nodes.sort((a, b) => a.priority - b.priority);
  }

  async createNode(parentId: string, name: string, note?: string, position?: "top" | "bottom"): Promise<CreateNodeResponse> {
    return this.request<CreateNodeResponse>("/nodes", {
      method: "POST",
      body: JSON.stringify({
        parent_id: parentId,
        name,
        note: note || undefined,
        position: position || undefined,
      }),
    });
  }

  async findDailyNote(parentId: string, dateStr: string): Promise<WorkflowyNode | null> {
    const nodes = await this.getNodes(parentId);
    const date = new Date(dateStr + "T00:00:00");
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    const workflowyDateText = `${weekday}, ${month} ${day}, ${year}`;

    for (const node of nodes) {
      const text = node.name || "";
      if (text.includes(workflowyDateText) || text.includes(dateStr)) {
        return node;
      }
    }
    return null;
  }

  async getOrCreateDailyNote(parentId: string, dateStr?: string): Promise<string> {
    const targetDate = dateStr || formatDate(new Date());
    const existing = await this.findDailyNote(parentId, targetDate);
    if (existing) return existing.id;

    const formattedDate = `[${targetDate}]`;
    const result = await this.createNode(parentId, formattedDate);
    return result.item_id;
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
