// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import CurrentWeather from '../components/currentWeather';
import WeatherCard from '../components/weathercard';
import NavBar from '../components/navBar';
import WeatherService from '../services/API';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [location, setLocation] = useState('Calgary, AB');

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      const current = await WeatherService.getCurrentWeather(location);
      const forecast = await WeatherService.getForecast(location, 1);
      setWeatherData(current);
      setForecastData(forecast);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const navItems = [
    { icon: '🏠', label: 'Today', isActive: true, onPress: () => {} },
    { icon: '📅', label: 'Forecast', onPress: () => navigation.navigate('Forecast') },
    { icon: '🗺️', label: 'Radar', onPress: () => {} },
    { icon: '📊', label: 'Insights', onPress: () => {} },
  ];

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

        {weatherData && (
          <CurrentWeather
            temperature={`${weatherData.current.temp_c}°`}
            condition={weatherData.current.condition.text}
            feelsLike={`Feels like ${weatherData.current.feelslike_c}° • Wind chill effect`}
            highLow={`High: 4° • Low: -5°`} // You would get this from forecast data
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Should Know</Text>
          <View style={styles.recommendationsGrid}>
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>❄️</Text>
              <Text style={styles.recommendationTitle}>Snow Tomorrow</Text>
              <Text style={styles.recommendationDesc}>Prepare for morning commute delays</Text>
            </View>
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>🧣</Text>
              <Text style={styles.recommendationTitle}>Dress Warm</Text>
              <Text style={styles.recommendationDesc}>Layer up with hat and gloves</Text>
            </View>
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>🚗</Text>
              <Text style={styles.recommendationTitle}>Road Conditions</Text>
              <Text style={styles.recommendationDesc}>Slippery roads after sunset</Text>
            </View>
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>🌇</Text>
              <Text style={styles.recommendationTitle}>Sunset</Text>
              <Text style={styles.recommendationDesc}>6:24 PM - Clear skies</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Forecast</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Forecast')}>
              <Text style={styles.viewMore}>View 7-day →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {forecastData?.forecast?.forecastday[0]?.hour?.map((hour: any, index: number) => (
              <WeatherCard
                key={index}
                time={new Date(hour.time).getHours() + ':00'}
                icon={getWeatherIcon(hour.condition.text, new Date(hour.time).getHours())}
                temperature={`${hour.temp_c}°`}
                isActive={index === 0}
              />
            ))}
          </ScrollView>
        </View>
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
  section: {
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
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