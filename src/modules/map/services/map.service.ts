/**
 * Map Service
 * Handles map search and geolocation
 */

import {getBackendService} from '@services/backend';
import {logger} from '@services/logging';
import {MapSearchParams, MapSearchResult, GeoPoint} from '@types';
import {Geolocation, GeolocationResponse} from '@react-native-community/geolocation';

export class MapService {
  private backend = getBackendService();

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<GeoPoint> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: GeolocationResponse) => {
          const location: GeoPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          logger.debug('Current location obtained', {location});
          resolve(location);
        },
        error => {
          logger.error('Failed to get current location', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  /**
   * Search map with parameters
   */
  async searchMap(params: MapSearchParams): Promise<MapSearchResult> {
    try {
      logger.debug('Searching map', {params});

      // For custom backend
      const response = await this.backend.database.query<MapSearchResult>(
        'search/map',
        undefined,
        {limit: params.size},
      );

      logger.debug('Map search completed', {
        clustersCount: response[0]?.clusters?.length,
        pinsCount: response[0]?.pins?.length,
      });

      return response[0] || {clusters: [], pins: []};
    } catch (error) {
      logger.error('Failed to search map', error as Error, {params});
      throw error;
    }
  }

  /**
   * Text search (places, addresses)
   */
  async searchText(query: string, location?: GeoPoint): Promise<any[]> {
    try {
      logger.debug('Text search', {query, location});

      // Implementation would call text search endpoint
      const results: any[] = [];

      logger.debug('Text search completed', {resultsCount: results.length});
      return results;
    } catch (error) {
      logger.error('Failed to search text', error as Error, {query});
      throw error;
    }
  }

  /**
   * Watch location updates
   */
  watchLocation(callback: (location: GeoPoint) => void): () => void {
    const watchId = Geolocation.watchPosition(
      position => {
        const location: GeoPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        callback(location);
      },
      error => {
        logger.error('Location watch error', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Android
        fastestInterval: 2000, // Android
      },
    );

    // Return cleanup function
    return () => {
      Geolocation.clearWatch(watchId);
    };
  }
}

// Export singleton instance
export const mapService = new MapService();
