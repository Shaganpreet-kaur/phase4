// services/storageService.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

type StorageKeys =
  | 'currentWeather'
  | 'forecast'
  | 'locations'
  | 'lastFetched';

const StorageService = {
  // Save data to local storage
  saveData: async (key: StorageKeys, data: any): Promise<void> => {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);

      // Update the last fetched timestamp
      if (key === 'currentWeather' || key === 'forecast') {
        await AsyncStorage.setItem('lastFetched', JSON.stringify({
          ...JSON.parse(await AsyncStorage.getItem('lastFetched') || '{}'),
          [key]: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error(`Error saving ${key} data:`, error);
    }
  },

  // Get data from local storage
  getData: async (key: StorageKeys): Promise<any> => {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      return jsonData != null ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error(`Error getting ${key} data:`, error);
      return null;
    }
  },

  // Check if data was fetched recently (within the given hours)
  isDataFresh: async (key: StorageKeys, hoursThreshold: number = 1): Promise<boolean> => {
    try {
      const lastFetchedJSON = await AsyncStorage.getItem('lastFetched');
      if (!lastFetchedJSON) return false;

      const lastFetched = JSON.parse(lastFetchedJSON);
      const timestamp = lastFetched[key];

      if (!timestamp) return false;

      const lastFetchedTime = new Date(timestamp).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceLastFetch = (currentTime - lastFetchedTime) / (1000 * 60 * 60);

      return hoursSinceLastFetch < hoursThreshold;
    } catch (error) {
      console.error(`Error checking if ${key} data is fresh:`, error);
      return false;
    }
  },

  // Get all saved locations
  getSavedLocations: async (): Promise<string[]> => {
    try {
      const locationsJSON = await AsyncStorage.getItem('locations');
      return locationsJSON != null ? JSON.parse(locationsJSON) : [];
    } catch (error) {
      console.error('Error getting saved locations:', error);
      return [];
    }
  },

  // Add a location to saved locations
  addLocation: async (location: string): Promise<void> => {
    try {
      const locations = await StorageService.getSavedLocations();
      if (!locations.includes(location)) {
        locations.push(location);
        await AsyncStorage.setItem('locations', JSON.stringify(locations));
      }
    } catch (error) {
      console.error('Error adding location:', error);
    }
  },

  // Remove a location from saved locations
  removeLocation: async (location: string): Promise<void> => {
    try {
      let locations = await StorageService.getSavedLocations();
      locations = locations.filter(loc => loc !== location);
      await AsyncStorage.setItem('locations', JSON.stringify(locations));
    } catch (error) {
      console.error('Error removing location:', error);
    }
  },

  // Clear all data (for debugging/testing)
  clearAllData: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
};

export default StorageService;
