import type { WorkflowyNode, WorkflowyNodesResponse, WorkflowyNodeResponse, CreateNodeResponse } from "../types";

const BASE_URL = "https://beta.workflowy.com/api/v1";

export class WorkflowyClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private fetchApi(path: string, options: RequestInit = {}): Promise<Response> {
    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await this.fetchApi(path, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Workflowy API error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  // 404 means the calendar node has not been created yet
  private async request404AsNull<T>(path: string): Promise<T | null> {
    const res = await this.fetchApi(path);
    if (res.status === 404) return null;
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

  // Children of a native calendar node (date key such as "2026-07-13").
  // 404 = the calendar node doesn't exist yet, i.e. no notes for that day.
  async getCalendarNodes(dateKey: string): Promise<WorkflowyNode[]> {
    const data = await this.request404AsNull<WorkflowyNodesResponse>(
      `/nodes?parent_id=${encodeURIComponent(dateKey)}`
    );
    if (!data) return [];
    return data.nodes.sort((a, b) => a.priority - b.priority);
  }

  // Single node lookup. Accepts node IDs and calendar keys ("today", "YYYY-MM-DD").
  async getNode(idOrKey: string): Promise<WorkflowyNode | null> {
    const data = await this.request404AsNull<WorkflowyNodeResponse>(
      `/nodes/${encodeURIComponent(idOrKey)}`
    );
    return data?.node ?? null;
  }

  async completeNode(nodeId: string): Promise<void> {
    await this.request(`/nodes/${encodeURIComponent(nodeId)}/complete`, {
      method: "POST",
    });
  }

  async uncompleteNode(nodeId: string): Promise<void> {
    await this.request(`/nodes/${encodeURIComponent(nodeId)}/uncomplete`, {
      method: "POST",
    });
  }

  async deleteNode(nodeId: string): Promise<void> {
    await this.request(`/nodes/${encodeURIComponent(nodeId)}`, {
      method: "DELETE",
    });
  }
}
