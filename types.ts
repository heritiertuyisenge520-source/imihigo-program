
export interface QuarterlyData {
  target: number;
  achievement: number;
}

export interface Indicator {
  id: string;
  name: string;
  baseline: string | number;
  sourceOfData: string;
  annualTarget: number;
  quarters: {
    1: QuarterlyData;
    2: QuarterlyData;
    3: QuarterlyData;
    4: QuarterlyData;
  };
}

export interface Output {
  id: string;
  name: string;
  indicators: Indicator[];
}

export interface Outcome {
  id: string;
  name: string;
  outputs: Output[];
}

export interface Sector {
  id: string;
  name: string;
  outcomes: Outcome[];
}

export interface Pillar {
  id: string;
  name: string;
  sectors: Sector[];
}

export type ViewMode = 'template' | 'dashboard' | 'fill' | 'analytics' | 'settings';

export enum Status {
  ON_TRACK = 'ON_TRACK',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}
