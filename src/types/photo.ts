export interface PhotoRecord {
  id: string;
  companyId: string;
  projectId: string;
  userId: string;
  frontId: string;
  activity?: string;
  deviceTimestamp: string;
  serverTimestamp?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  filePath: string;
  imageData: string; // base64 for offline storage
  hashSha256?: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  showTimestamp: boolean;
  showGps: boolean;
  errorMessage?: string;
}

export interface Company {
  id: string;
  name: string;
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  companyId: string;
  fronts: Front[];
}

export interface Front {
  id: string;
  name: string;
  projectId: string;
  templateId: string;
}

export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador';
  companyId: string;
}

export interface SyncStatus {
  pending: number;
  syncing: number;
  synced: number;
  error: number;
  lastSync?: string;
}