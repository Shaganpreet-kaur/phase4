// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';
import CurrentWeather from '../components/currentWeather';
import WeatherCard from '../components/weathercard';
import NavBar from '../components/navBar';
import WeatherService from '../services/API';
import StorageService from '../services/storageService';
import NetInfo from '@react-native-community/netinfo';

const HomeScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [location, setLocation] = useState('Calgary, AB');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Update location if passed from another screen
    if (route.params?.location) {
      setLocation(route.params.location);
    }
  }, [route.params?.location]);

  useEffect(() => {
    // Set up network status listener
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    });

    // Initial data fetch
    fetchWeatherData();

    // Clean up
    return () => {
      unsubscribe();
    };
  }, [location]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const current = await WeatherService.getCurrentWeather(location);
      const forecast = await WeatherService.getForecast(location, 1);

      setWeatherData(current);
      setForecastData(forecast);

      // Check if the data is from offline storage
      if (current.offline) {
        setIsOffline(true);
        setLastUpdated(current.lastUpdated);
      } else {
        setIsOffline(false);
        setLastUpdated(null);

        // Save the location for future use
        await StorageService.addLocation(location);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { icon: '🏠', label: 'Today', isActive: true, onPress: () => {} },
    { icon: '📅', label: 'Forecast', onPress: () => navigation.navigate('Forecast', { location }) },
    { icon: '🗺️', label: 'Radar', onPress: () => navigation.navigate('Radar', { location }) },
    { icon: '📊', label: 'Insights', onPress: () => navigation.navigate('Insights', { location }) },
  ];

  // Format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';

    const date = new Date(lastUpdated);
    return `Last updated: ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        {isOffline && (
          <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>
              Offline Mode {lastUpdated ? `• ${getLastUpdatedText()}` : ''}
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading weather data...</Text>
          </View>
        ) : weatherData ? (
          <>
            <CurrentWeather
              temperature={`${Math.round(weatherData.current.temp_c)}°`}
              condition={weatherData.current.condition.text}
              feelsLike={`Feels like ${Math.round(weatherData.current.feelslike_c)}° • Wind chill effect`}
              highLow={forecastData ? `High: ${Math.round(forecastData.forecast.forecastday[0].day.maxtemp_c)}° • Low: ${Math.round(forecastData.forecast.forecastday[0].day.mintemp_c)}°` : ''}
            />

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
                  <Text style={styles.metricValue}>{Math.round(weatherData.current.uv)}</Text>
                  <Text style={styles.metricLabel}>UV Index</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What You Should Know</Text>
              <View style={styles.recommendationsGrid}>
                {weatherData.current.temp_c < 5 && (
                  <View style={styles.recommendationCard}>
                    <Text style={styles.recommendationIcon}>🧣</Text>
                    <Text style={styles.recommendationTitle}>Dress Warm</Text>
                    <Text style={styles.recommendationDesc}>Layer up with hat and gloves</Text>
                  </View>
                )}
                {weatherData.current.wind_kph > 20 && (
                  <View style={styles.recommendationCard}>
                    <Text style={styles.recommendationIcon}>💨</Text>
                    <Text style={styles.recommendationTitle}>Windy Conditions</Text>
                    <Text style={styles.recommendationDesc}>Secure loose items outdoors</Text>
                  </View>
                )}
                {weatherData.current.condition.text.toLowerCase().includes('rain') && (
                  <View style={styles.recommendationCard}>
                    <Text style={styles.recommendationIcon}>☔</Text>
                    <Text style={styles.recommendationTitle}>Rain Expected</Text>
                    <Text style={styles.recommendationDesc}>Bring an umbrella</Text>
                  </View>
                )}
                {weatherData.current.condition.text.toLowerCase().includes('snow') && (
                  <View style={styles.recommendationCard}>
                    <Text style={styles.recommendationIcon}>❄️</Text>
                    <Text style={styles.recommendationTitle}>Snow Expected</Text>
                    <Text style={styles.recommendationDesc}>Prepare for delays</Text>
                  </View>
                )}
                <View style={styles.recommendationCard}>
                  <Text style={styles.recommendationIcon}>🌇</Text>
                  <Text style={styles.recommendationTitle}>Sunset</Text>
                  <Text style={styles.recommendationDesc}>
                    {forecastData ?
                      new Date(forecastData.forecast.forecastday[0].astro.sunset).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                      : '6:24 PM'}
                  </Text>
                </View>
                <View style={styles.recommendationCard}>
                  <Text style={styles.recommendationIcon}>🚗</Text>
                  <Text style={styles.recommendationTitle}>Road Conditions</Text>
                  <Text style={styles.recommendationDesc}>
                    {weatherData.current.temp_c < 0 ? 'Icy patches possible' : 'Generally good'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Unable to load weather data. Please check your internet connection and try again.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

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
      </ScrollView>

      <NavBar items={navItems} />
    </View>
  );
};

const getWeatherIcon = (condition: string, hour: number) => {
  // Simple icon mapping - you can expand this based on condition codes
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
  offlineBar: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    padding: theme.spacing.small,
    alignItems: 'center',
    marginHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.medium,
  },
  offlineText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xlarge,
  },
  loadingText: {
    color: theme.colors.text,
    marginTop: theme.spacing.medium,
    fontSize: theme.fontSize.medium,
  },
  errorContainer: {
    padding: theme.spacing.large,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.medium,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
  },
  retryText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
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
});

export default HomeScreen;