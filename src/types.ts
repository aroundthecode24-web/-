export type HallwayType = 'single' | 'double' | 'narrow';

export interface HallwayPreset {
  id: HallwayType;
  name: string;
  widthCm: number;
  description: string;
  legalMinWidthCm: number; // Korean Fire Safety Standard (단면 120cm, 양면 150cm)
}

export interface ObstacleItem {
  id: string;
  name: string;
  category: 'mobility' | 'delivery' | 'household';
  widthCm: number; // Effective hallway obstruction in cm
  riskLevel: 'high' | 'medium' | 'low';
  icon: string;
  description: string;
  fireCodeRisk: string;
}

export type ActivityLevel = 'quiet' | 'walking' | 'running' | 'jumping' | 'ball';

export interface ActivityOption {
  id: ActivityLevel;
  name: string;
  dbAdded: number;
  icon: string;
  description: string;
}

export type MitigationItem = 'slippers' | 'mat' | 'socks' | 'pads';

export interface MitigationOption {
  id: MitigationItem;
  name: string;
  dbReduced: number;
  icon: string;
  description: string;
}

export type TimeOfDay = 'day' | 'evening' | 'night';

export interface TimeSlot {
  id: TimeOfDay;
  name: string;
  hours: string;
  legalThresholdDb: number; // 39dB day, 34dB night in Korea
  color: string;
  badge: string;
}

export interface DailyPromise {
  id: string;
  title: string;
  detail: string;
  category: 'noise' | 'hallway' | 'greeting';
  icon: string;
  completed: boolean;
}

export interface StickerStamp {
  id: string;
  date: string;
  stampType: 'star' | 'heart' | 'smile' | 'crown';
  comment: string;
}
