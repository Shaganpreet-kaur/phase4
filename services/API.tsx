// services/API.tsx
const API_KEY = "1d04f720c29b4685af1143558252703";
const BASE_URL = "https://api.weatherapi.com/v1";
const RAINVIEWER_API_URL = "https://api.rainviewer.com/public/weather-maps.json";

const WeatherService = {
  getCurrentWeather: async (city: string): Promise<any> => {
    try {
      const response = await fetch(
        `${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`
      );
      return response.json();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },

  getForecast: async (city: string, days: number = 7): Promise<any> => {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=${days}&aqi=no&alerts=yes`
      );
      return response.json();
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      throw error;
    }
  },

  searchLocations: async (query: string): Promise<any> => {
    try {
      const response = await fetch(
        `${BASE_URL}/search.json?key=${API_KEY}&q=${query}`
      );
      return response.json();
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  },

  // Add historical weather data endpoint
  getHistoricalWeather: async (city: string, date: string): Promise<any> => {
    try {
      const response = await fetch(
        `${BASE_URL}/history.json?key=${API_KEY}&q=${city}&dt=${date}`
      );
      return response.json();
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  },
  
  // Add radar data endpoints
  getRadarData: async (): Promise<any> => {
    try {
      const response = await fetch(RAINVIEWER_API_URL);
      return response.json();
    } catch (error) {
      console.error('Error fetching radar data:', error);
      throw error;
    }
  },
  
  // Helper function to get geocoordinates for a location
  getCoordinates: async (city: string): Promise<{lat: number, lon: number}> => {
    try {
      const response = await fetch(
        `${BASE_URL}/search.json?key=${API_KEY}&q=${city}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
      
      throw new Error('Location not found');
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return { lat: 40.7128, lon: -74.0060 };
    }
  },
  
  getRadarTileUrl: (host: string, path: string, z: number, x: number, y: number, color: number = 4, options: number = 1): string => {
    return `https://${host}${path}/${z}/${x}/${y}/${color}/${options}.png`;
  }
};

export default WeatherService;