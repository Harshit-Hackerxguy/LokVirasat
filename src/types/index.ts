export type Coordinates = [longitude: number, latitude: number];

export enum HeritageCategory {
  Monument = 'Monument',
  Natural = 'Natural',
  Folklore = 'Folklore',
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
