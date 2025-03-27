const API_KEY = "YOUR_API_KEY";

const WeatherService = {
  getCurrentWeather: async (city: string): Promise<any> => {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
    );
    return response.json();
  },

  getWeatherForecast: async (city: string): Promise<any> => {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no`
    );
    return response.json();
  }
};

export default WeatherService;
