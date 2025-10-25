/**
 * Map Module Types
 */

import {GeoPoint, MapSearchParams, MapSearchResult, SearchFilters, AgeBucket} from '@types';

export interface MapState {
  currentLocation: GeoPoint | null;
  searchResults: MapSearchResult | null;
  filters: SearchFilters;
  selectedPin: string | null;
  loading: boolean;
  error: string | null;
}

export interface MapConfig {
  initialZoom: number;
  clusterRadius: number;
  maxZoom: number;
  minZoom: number;
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  initialZoom: 14,
  clusterRadius: 50,
  maxZoom: 18,
  minZoom: 10,
};
