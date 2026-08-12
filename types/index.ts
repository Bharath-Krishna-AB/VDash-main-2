export interface Checkpoint {
  id: number;
  title: string;
  duration: number;
  code: string;
  hint: string;
  qrText?: string;
}

export interface TeamData {
  name: string;
  contactNumber?: string;
  routeId?: string; // New field for route assignment
  checkpoints?: Checkpoint[]; // Keep for legacy/simplicity, populated from Route
  timerDuration: number;
  permittedCodes: string[];
  currentLevel: string;
  currentHint: string;
}

export interface RouteData {
  id: string;
  name: string;
  checkpoints: Checkpoint[];
}

export interface TeamsDataMap {
  [key: string]: TeamData;
}
