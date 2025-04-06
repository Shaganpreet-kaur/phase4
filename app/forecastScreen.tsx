
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import NavBar from '../components/navBar';
import WeatherService from '../services/API';

const ForecastScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [forecastData, setForecastData] = useState<any>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const location = route.params?.location || 'Calgary, AB';

  useEffect(() => {
    fetchForecastData();
  }, [location]);

  const fetchForecastData = async () => {
    try {
      const forecast = await WeatherService.getForecast(location);
      setForecastData(forecast);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  const navItems = [
    { icon: '🏠', label: 'Today', onPress: () => navigation.navigate('Home') },
    { icon: '📅', label: 'Forecast', isActive: true, onPress: () => {} },
    { icon: '🗺️', label: 'Radar', onPress: () => {} },
    { icon: '📊', label: 'Insights', onPress: () => {} },
  ];

  const toggleDayExpand = (index: number) => {
    setExpandedDay(expandedDay === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.pageTitle}>7-Day Forecast</Text>
            <Text style={styles.locationName}>{location}</Text>
          </View>
          <View style={styles.dummySpace} />
        </View>

        {forecastData?.current && (
          <View style={styles.currentSummary}>
            <Text style={styles.currentTemp}>{Math.round(forecastData.current.temp_c)}°</Text>
            <View style={styles.currentDetails}>
              <Text style={styles.currentCondition}>{forecastData.current.condition.text}</Text>
              <Text style={styles.highLow}>
                High: {Math.round(forecastData.forecast.forecastday[0].day.maxtemp_c)}° • 
                Low: {Math.round(forecastData.forecast.forecastday[0].day.mintemp_c)}°
              </Text>
            </View>
          </View>
        )}

        {forecastData?.alerts?.alert?.length > 0 && (
          <View style={styles.weatherAlert}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View>
              <Text style={styles.alertTitle}>{forecastData.alerts.alert[0].headline}</Text>
              <Text style={styles.alertMessage}>{forecastData.alerts.alert[0].desc}</Text>
            </View>
          </View>
        )}

        <View style={styles.forecastTabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text>24 Hours</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text>Radar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dailyForecast}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          <View style={styles.dayCards}>
            {forecastData?.forecast?.forecastday?.map((day: any, index: number) => (
              <View key={index}>
                <TouchableOpacity 
                  style={styles.dayCard}
                  onPress={() => toggleDayExpand(index)}
                >
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>
                      {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </Text>
                    <Text style={styles.dayDate}>
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={styles.dayIcon}>
                    {getWeatherIcon(day.day.condition.text, 12)} {/* Using noon for day icon */}
                  </Text>
                  <View style={styles.dayTemps}>
                    <Text style={styles.dayHigh}>{Math.round(day.day.maxtemp_c)}°</Text>
                    <Text style={styles.dayLow}>{Math.round(day.day.mintemp_c)}°</Text>
                  </View>
                </TouchableOpacity>

                {expandedDay === index && (
                  <View style={styles.dayDetails}>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Precipitation</Text>
                        <Text style={styles.detailValue}>{day.day.daily_chance_of_rain}%</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Humidity</Text>
                        <Text style={styles.detailValue}>{day.day.avghumidity}%</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Wind</Text>
                        <Text style={styles.detailValue}>{day.day.maxwind_kph} km/h</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>UV Index</Text>
                        <Text style={styles.detailValue}>{day.day.uv} ({getUvIndexLevel(day.day.uv)})</Text>
                      </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
                      {day.hour.map((hour: any, hourIndex: number) => (
                        <View key={hourIndex} style={styles.hourCard}>
                          <Text style={styles.hourTime}>
                            {hourIndex === 0 ? 'Now' : new Date(hour.time).getHours() + ':00'}
                          </Text>
                          <Text style={styles.hourIcon}>
                            {getWeatherIcon(hour.condition.text, new Date(hour.time).getHours())}
                          </Text>
                          <Text style={styles.hourTemp}>{Math.round(hour.temp_c)}°</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <NavBar items={navItems} />
    </View>
  );
};

const getWeatherIcon = (condition: string, hour: number) => {
  // Same as in HomeScreen.tsx
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

const getUvIndexLevel = (uv: number) => {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pageTitle: {
    fontSize: theme.fontSize.xxlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  locationName: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    opacity: 0.8,
    textAlign: 'center',
  },
  dummySpace: {
    width: 44,
  },
  currentSummary: {
    margin: theme.spacing.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentTemp: {
    fontSize: 64,
    fontWeight: '200',
    color: theme.colors.text,
  },
  currentDetails: {
    alignItems: 'flex-end',
  },
  currentCondition: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  highLow: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    opacity: 0.8,
  },
  weatherAlert: {
    margin: theme.spacing.large,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.alert,
    borderRadius: theme.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.medium,
  },
  alertIcon: {
    fontSize: theme.fontSize.xxxlarge,
    color: theme.colors.alertIcon,
  },
  alertTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  alertMessage: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
  },
  forecastTabs: {
    flexDirection: 'row',
    margin: theme.spacing.large,
    gap: theme.spacing.small,
  },
  tab: {
    padding: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.xlarge,
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dailyForecast: {
    margin: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  dayCards: {
    gap: theme.spacing.medium,
  },
  dayCard: {
    padding: theme.spacing.large,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {},
  dayName: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  dayDate: {
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
    opacity: 0.8,
  },
  dayIcon: {
    fontSize: theme.fontSize.xxxlarge,
  },
  dayTemps: {
    alignItems: 'flex-end',
  },
  dayHigh: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  dayLow: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    opacity: 0.8,
  },
  dayDetails: {
    marginTop: -5,
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.large,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: theme.borderRadius.medium,
    borderBottomRightRadius: theme.borderRadius.medium,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  detailItem: {
    width: '48%',
    padding: theme.spacing.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.small,
  },
  detailLabel: {
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: theme.spacing.small,
  },
  detailValue: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  hourlyScroll: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  hourCard: {
    minWidth: 60,
    padding: theme.spacing.small,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
  },
  hourTime: {
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: theme.spacing.small,
  },
  hourIcon: {
    fontSize: theme.fontSize.xxlarge,
    marginVertical: theme.spacing.small,
  },
  hourTemp: {
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export default ForecastScreen;