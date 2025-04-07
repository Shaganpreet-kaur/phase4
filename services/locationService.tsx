// services/locationService.tsx
import * as Location from 'expo-location';
import WeatherService from './API';

const LocationService = {
  getCurrentLocation: async (): Promise<{ latitude: number; longitude: number; city: string }> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const cityData = await LocationService.getCityFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: cityData
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  },

  getCityFromCoordinates: async (latitude: number, longitude: number): Promise<string> => {
    try {
      const weatherData = await WeatherService.getCurrentWeather(`${latitude},${longitude}`);
      if (weatherData && weatherData.location) {
        return `${weatherData.location.name}, ${weatherData.location.region || weatherData.location.country}`;
      }

      const [geocodeResult] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (geocodeResult) {
        const city = geocodeResult.city || geocodeResult.subregion || geocodeResult.region;
        const region = geocodeResult.region || geocodeResult.country;

        return `${city}, ${region}`;
      }

      return "Unknown Location";
    } catch (error) {
      console.error('Error getting city name:', error);
      return "Unknown Location";
    }
  }
};

export default LocationService;