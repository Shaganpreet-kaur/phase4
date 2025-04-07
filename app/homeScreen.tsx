import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../styles/theme';
import CurrentWeather from '../components/currentWeather';
import WeatherCard from '../components/weathercard';
import NavBar from '../components/navBar';
import WeatherService from '../services/API';
import SafeAreaContainer from '../components/safeAreaContainer';

// Function to generate dynamic recommendations based on weather data
const generateRecommendations = (weatherData: any, forecastData: any) => {
  if (!weatherData || !forecastData) return [];

  const recommendations = [];
  const current = weatherData.current;
  const forecast = forecastData.forecast.forecastday[0];
  const tomorrow = forecastData.forecast.forecastday.length > 1 ? forecastData.forecast.forecastday[1] : null;

  // Temperature-based recommendations
  if (current.temp_c < 0) {
    recommendations.push({
      icon: '🧣',
      title: 'Dress Very Warm',
      desc: 'Freezing conditions outside'
    });
  } else if (current.temp_c < 10) {
    recommendations.push({
      icon: '🧥',
      title: 'Wear Layers',
      desc: 'Cold conditions today'
    });
  } else if (current.temp_c > 30) {
    recommendations.push({
      icon: '🥵',
      title: 'Stay Hydrated',
      desc: 'Very hot outside today'
    });
  } else if (current.temp_c > 25) {
    recommendations.push({
      icon: '☀️',
      title: 'Apply Sunscreen',
      desc: 'Hot and sunny conditions'
    });
  }

  // Rain/snow recommendations
  if (current.condition.text.toLowerCase().includes('rain')) {
    recommendations.push({
      icon: '☔',
      title: 'Bring Umbrella',
      desc: 'Rainy conditions today'
    });
  } else if (current.condition.text.toLowerCase().includes('snow')) {
    recommendations.push({
      icon: '❄️',
      title: 'Snow Alert',
      desc: 'Snowy conditions today'
    });
  }

  // Tomorrow's weather if significantly different
  if (tomorrow) {
    if (tomorrow.day.condition.text.toLowerCase().includes('rain') &&
        !current.condition.text.toLowerCase().includes('rain')) {
      recommendations.push({
        icon: '🌧️',
        title: 'Rain Tomorrow',
        desc: 'Prepare for wet weather'
      });
    } else if (tomorrow.day.condition.text.toLowerCase().includes('snow') &&
               !current.condition.text.toLowerCase().includes('snow')) {
      recommendations.push({
        icon: '❄️',
        title: 'Snow Tomorrow',
        desc: 'Prepare for winter conditions'
      });
    } else if (tomorrow.day.maxtemp_c > current.temp_c + 5) {
      recommendations.push({
        icon: '📈',
        title: 'Warmer Tomorrow',
        desc: `High of ${Math.round(tomorrow.day.maxtemp_c)}° expected`
      });
    } else if (tomorrow.day.maxtemp_c < current.temp_c - 5) {
      recommendations.push({
        icon: '📉',
        title: 'Cooler Tomorrow',
        desc: `High of only ${Math.round(tomorrow.day.maxtemp_c)}° expected`
      });
    }
  }

  // Wind recommendations
  if (current.wind_kph > 40) {
    recommendations.push({
      icon: '🌪️',
      title: 'Strong Winds',
      desc: `${Math.round(current.wind_kph)} km/h gusts expected`
    });
  } else if (current.wind_kph > 20) {
    recommendations.push({
      icon: '💨',
      title: 'Windy Conditions',
      desc: 'Secure any loose outdoor items'
    });
  }

  // UV index recommendations
  if (current.uv >= 8) {
    recommendations.push({
      icon: '🧴',
      title: 'High UV Index',
      desc: 'Wear sunscreen and limit exposure'
    });
  } else if (current.uv >= 5) {
    recommendations.push({
      icon: '🕶️',
      title: 'Moderate UV',
      desc: 'Sun protection recommended'
    });
  }

  // Time of day related info (sunset)
  if (forecast && forecast.astro) {
    const now = new Date();
    const hours = now.getHours();

    // Convert 12h time format to 24h for comparison
    const getSunsetHour = (sunsetTime: string) => {
      // Example format: "7:30 PM"
      const [time, period] = sunsetTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours;
    };

    const sunsetHour = getSunsetHour(forecast.astro.sunset);

    // If sunset is happening within next 2 hours
    if (hours + 2 >= sunsetHour && hours <= sunsetHour) {
      recommendations.push({
        icon: '🌇',
        title: 'Sunset Soon',
        desc: `Sunset at ${forecast.astro.sunset}`
      });
    }
  }

  // Road conditions
  if (current.temp_c < 0 ||
      current.condition.text.toLowerCase().includes('ice') ||
      current.condition.text.toLowerCase().includes('snow')) {
    recommendations.push({
      icon: '🚗',
      title: 'Road Conditions',
      desc: 'Slippery roads possible - drive carefully'
    });
  } else if (current.condition.text.toLowerCase().includes('fog')) {
    recommendations.push({
      icon: '🚗',
      title: 'Poor Visibility',
      desc: 'Foggy conditions - use fog lights'
    });
  } else if (current.condition.text.toLowerCase().includes('rain') && current.precip_mm > 10) {
    recommendations.push({
      icon: '🚗',
      title: 'Flooding Risk',
      desc: 'Heavy rain may affect road conditions'
    });
  }

  // Default recommendations if we don't have enough
  if (recommendations.length < 2) {
    recommendations.push({
      icon: '🌡️',
      title: 'Current Temp',
      desc: `${Math.round(current.temp_c)}°C, ${current.condition.text}`
    });
  }

  // Return max 4 recommendations (or fewer if there aren't enough)
  return recommendations.slice(0, 4);
};

const HomeScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [location, setLocation] = useState('Calgary, AB');
  const [recommendations, setRecommendations] = useState([
    { icon: '❄️', title: 'Loading...', desc: 'Weather recommendations' },
    { icon: '🧣', title: 'Loading...', desc: 'Weather recommendations' },
    { icon: '🚗', title: 'Loading...', desc: 'Weather recommendations' },
    { icon: '🌇', title: 'Loading...', desc: 'Weather recommendations' }
  ]);

  useEffect(() => {
    // Update location if passed from another screen
    if (route.params?.location) {
      setLocation(route.params.location);
    }
  }, [route.params?.location]);

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  useEffect(() => {
    // Generate dynamic recommendations when weather data changes
    if (weatherData && forecastData) {
      const dynamicRecommendations = generateRecommendations(weatherData, forecastData);
      setRecommendations(dynamicRecommendations);
    }
  }, [weatherData, forecastData]);

  const fetchWeatherData = async () => {
    try {
      const current = await WeatherService.getCurrentWeather(location);
      const forecast = await WeatherService.getForecast(location, 7); 
      setWeatherData(current);
      setForecastData(forecast);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const navItems = [
    { icon: '🏠', label: 'Today', isActive: true, onPress: () => {} },
    { icon: '📅', label: 'Forecast', onPress: () => navigation.navigate('Forecast', { location }) },
    { icon: '🗺️', label: 'Radar', onPress: () => navigation.navigate('Radar', { location }) },
    { icon: '📊', label: 'Insights', onPress: () => navigation.navigate('Insights', { location }) },
  ];

  return (
    <SafeAreaContainer>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <SafeAreaView style={styles.safeHeader}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.locationPill}
                onPress={() => navigation.navigate('Location')}
              >
                <Text style={styles.locationName}>{location}</Text>
                <Text>↓</Text>
              </TouchableOpacity>
              <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton}>
                  <Text>🔔</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}>
                  <Text>⚙️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          {weatherData && (
            <CurrentWeather
              temperature={`${Math.round(weatherData.current.temp_c)}°`}
              condition={weatherData.current.condition.text}
              feelsLike={`Feels like ${Math.round(weatherData.current.feelslike_c)}° • Wind chill effect`}
              highLow={forecastData ? `High: ${Math.round(forecastData.forecast.forecastday[0].day.maxtemp_c)}° • Low: ${Math.round(forecastData.forecast.forecastday[0].day.mintemp_c)}°` : ''}
            />
          )}

          {weatherData && (
            <View style={styles.section}>
              <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>🌡️</Text>
                  <Text style={styles.metricValue}>{Math.round(weatherData.current.feelslike_c)}°</Text>
                  <Text style={styles.metricLabel}>Feels Like</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>💨</Text>
                  <Text style={styles.metricValue}>{Math.round(weatherData.current.wind_kph)} km/h</Text>
                  <Text style={styles.metricLabel}>Wind</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>💧</Text>
                  <Text style={styles.metricValue}>{weatherData.current.humidity}%</Text>
                  <Text style={styles.metricLabel}>Humidity</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>🌞</Text>
                  <Text style={styles.metricValue}>{Math.round(weatherData.current.uv || 0)}</Text>
                  <Text style={styles.metricLabel}>UV Index</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You Should Know</Text>
            <View style={styles.recommendationsGrid}>
              {recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <Text style={styles.recommendationIcon}>{rec.icon}</Text>
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                  <Text style={styles.recommendationDesc}>{rec.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {forecastData && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Forecast</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Forecast', { location })}>
                  <Text style={styles.viewMore}>View 7-day →</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {forecastData.forecast.forecastday[0].hour.map((hour: any, index: number) => {
                  // Only show future hours or current hour
                  const hourTime = new Date(hour.time).getHours();
                  const currentHour = new Date().getHours();
                  if (hourTime < currentHour && index > 0) return null;

                  return (
                    <WeatherCard
                      key={index}
                      time={hourTime === currentHour ? 'Now' : `${hourTime}:00`}
                      icon={getWeatherIcon(hour.condition.text, hourTime)}
                      temperature={`${Math.round(hour.temp_c)}°`}
                      isActive={hourTime === currentHour}
                    />
                  );
                }).filter(Boolean)}
              </ScrollView>
            </View>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>

        <NavBar items={navItems} />
      </View>
    </SafeAreaContainer>
  );
};

const getWeatherIcon = (condition: string, hour: number) => {
  const isDay = hour > 6 && hour < 18;

  if (condition.toLowerCase().includes('sunny') || condition.toLowerCase().includes('clear')) {
    return isDay ? '☀️' : '🌙';
  } else if (condition.toLowerCase().includes('cloud')) {
    return isDay ? '⛅' : '☁️';
  } else if (condition.toLowerCase().includes('rain')) {
    return '🌧️';
  } else if (condition.toLowerCase().includes('snow')) {
    return '❄️';
  } else if (condition.toLowerCase().includes('thunder')) {
    return '⛈️';
  } else {
    return isDay ? '🌤️' : '🌙';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  safeHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xlarge,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  locationName: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: theme.spacing.small,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    marginLeft: theme.spacing.small,
  },
  section: {
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricCard: {
    width: '23%',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: theme.fontSize.xxlarge,
    marginBottom: theme.spacing.small,
  },
  metricValue: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  metricLabel: {
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewMore: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recommendationCard: {
    width: '48%',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  recommendationIcon: {
    fontSize: theme.fontSize.xxxlarge,
    marginBottom: theme.spacing.small,
  },
  recommendationTitle: {
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  recommendationDesc: {
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
  },
  horizontalScroll: {
    paddingVertical: theme.spacing.small,
  },
  bottomPadding: {
    height: 40,
  },
});

export default HomeScreen;