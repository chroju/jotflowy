export interface Destination {
  id: string;
  type: "node" | "calendar";
  nodeId?: string;
  name: string;
  defaultText: string;
}

export interface Settings {
  destinations: Destination[];
  selectedDestinationId: string;
}

export interface WorkflowyNode {
  id: string;
  name: string;
  note: string | null;
  priority: number;
  data?: { layoutMode?: string };
  createdAt: number;
  modifiedAt: number;
  completedAt: number | null;
}

export interface WorkflowyNodesResponse {
  nodes: WorkflowyNode[];
}

export interface CreateNodeResponse {
  item_id: string;
}

export interface WorkflowyNodeResponse {
  node: WorkflowyNode;
}

export interface HistoryGroup {
  date: string | null;
  dateId: string | null;
  items: WorkflowyNode[];
  hasMore: boolean;
}

export interface Env {
  ENCRYPTION_KEY: string;
  ALLOWED_ORIGINS: string;
}
