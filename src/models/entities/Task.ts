export interface Task {
  id: number;
  description: string;
  state: boolean;
  hour: number | null;
  minute: number | null;
  order: number;
  projectId: number | null;
  cronId: number;
}
