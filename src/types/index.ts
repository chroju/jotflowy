export interface Destination {
  id: string;
  nodeId: string;
  name: string;
  dailyNoteEnabled: boolean;
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

export interface Env {
  ENCRYPTION_KEY: string;
  ALLOWED_ORIGINS: string;
}
