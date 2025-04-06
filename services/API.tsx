const API_KEY = " 1d04f720c29b4685af1143558252703"; // Replace with your actual WeatherAPI key
const BASE_URL = "https://api.weatherapi.com/v1";

const WeatherService = {
  // Fetch current weather using WeatherAPI
  getCurrentWeather: async (city: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`);
    return response.json();
  },
};
export default WeatherService;
