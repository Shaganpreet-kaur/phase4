const API_KEY = "1d04f720c29b4685af1143558252703";
const BASE_URL = "https://api.weatherapi.com/v1";

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
};

export default WeatherService;