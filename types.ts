export interface RacketStats {
  attack: number; // 1-100
  speed: number;  // 1-100
  defense: number; // 1-100
}

export interface RacketData {
  id: string;
  brand: string;
  model: string;
  description: string;
  stats: RacketStats;
  originalImage: string; // Base64 or URL
  createdAt: number;
}

export enum AppView {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  COLLECTION = 'COLLECTION',
  DETAILS = 'DETAILS'
}

export interface AnalysisResponse {
  brand: string;
  model: string;
  description: string;
  stats: RacketStats;
}