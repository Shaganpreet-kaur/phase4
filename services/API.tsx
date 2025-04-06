
const API_KEY = "1d04f720c29b4685af1143558252703";
const BASE_URL = "https://api.weatherapi.com/v1";

const WeatherService = {
  getCurrentWeather: async (city: string): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`
    );
    return response.json();
  },

  getForecast: async (city: string, days: number = 7): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=${days}&aqi=no&alerts=yes`
    );
    return response.json();
  },

  searchLocations: async (query: string): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/search.json?key=${API_KEY}&q=${query}`
    );
    return response.json();
  },
};
<<<<<<< HEAD
export default WeatherService;
=======

export default WeatherService;
>>>>>>> 45b2821fda606dcb6a84e619a6247e9d7600608d
