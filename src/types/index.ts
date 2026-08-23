export type Coordinates = [longitude: number, latitude: number];

export enum HeritageCategory {
  Monument = 'Monument',
  SacredGrove = 'Sacred Grove',
  FolkloreSite = 'Folklore Site',
  AncientRuins = 'Ancient Ruins',
  TraditionalCraftHub = 'Traditional Craft Hub',
}

export interface HeritageSite {
  id: string;
  name: string;
  coordinates: Coordinates;
  description: string;
  category: HeritageCategory;
  zoomLevel: number;
  pitch: number;
  bearing: number;
}

export enum IssueType {
  Damage = 'Damage',
  Cleanliness = 'Cleanliness',
  Infrastructure = 'Infrastructure',
  Accessibility = 'Accessibility',
}

export interface ConditionReport {
  id: string;
  siteId: string;
  issueType: IssueType;
  photoUrl: string;
  exifCoords: Coordinates;
  verified: boolean;
  description: string;
}
