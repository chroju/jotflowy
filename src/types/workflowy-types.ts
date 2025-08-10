export interface CreateBulletRequest {
  apiKey: string;
  title: string;
  note?: string;
  saveLocationUrl: string;
}

export interface CreateBulletResponse {
  save_location_url: string;
  save_location_title: string;
  save_location_note: string;
  new_bullet_url: string;
  new_bullet_title: string;
  new_bullet_children: BulletChild[];
  new_bullet_note: string | null;
  new_bullet_id: string;
}

export interface BulletChild {
  id: string;
  title: string;
  note?: string;
  children?: BulletChild[];
}

export interface SaveLocation {
  name: string;
  url: string;
  createDaily: boolean;
}

export interface DailyNoteCache {
  [date: string]: string; // date -> bullet URL
}

export class WorkflowyAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'WorkflowyAPIError';
  }
}