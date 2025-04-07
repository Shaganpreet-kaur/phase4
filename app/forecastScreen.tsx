// app/forecastScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { theme } from '../styles/theme';
import NavBar from '../components/navBar';
import WeatherService from '../services/API';

const ForecastScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [forecastData, setForecastData] = useState<any>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('24hours'); // Added state for active tab
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
    { icon: '🗺️', label: 'Radar', onPress: () => navigation.navigate('Radar', { location }) },
    { icon: '📊', label: 'Insights', onPress: () => navigation.navigate('Insights', { location }) },
  ];

  const toggleDayExpand = (index: number) => {
    setExpandedDay(expandedDay === index ? null : index);
  };

  // Function to render different content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case '24hours':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
            {forecastData?.forecast?.forecastday[0]?.hour.map((hour: any, hourIndex: number) => {
              const hourTime = new Date(hour.time).getHours();
              const currentHour = new Date().getHours();
              return (
                <View key={hourIndex} style={styles.hourCard}>
                  <Text style={styles.hourTime}>
                    {hourTime === currentHour ? 'Now' : `${hourTime}:00`}
                  </Text>
                  <Text style={styles.hourIcon}>
                    {getWeatherIcon(hour.condition.text, hourTime)}
                  </Text>
                  <Text style={styles.hourTemp}>{Math.round(hour.temp_c)}°</Text>
                </View>
              );
            })}
          </ScrollView>
        );
      case '7days':
        return (
          <View style={styles.dailyForecast}>
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
                      {getWeatherIcon(day.day.condition.text, 12)} 
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
                              {new Date(hour.time).getHours() + ':00'}
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
        );
      case 'radar':
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Radar View</Text>
            <Text style={styles.placeholderSubtext}>
              For full radar functionality, use the Radar tab in the navigation bar below.
            </Text>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => navigation.navigate('Radar', { location })}
            >
              <Text style={styles.navigateButtonText}>Go to Radar</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No content available</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeAreaTop} />

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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          <TouchableOpacity
            style={[styles.tab, activeTab === '24hours' && styles.activeTab]}
            onPress={() => setActiveTab('24hours')}
          >
            <Text style={styles.tabText}>24 Hours</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === '7days' && styles.activeTab]}
            onPress={() => setActiveTab('7days')}
          >
            <Text style={styles.tabText}>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'radar' && styles.activeTab]}
            onPress={() => setActiveTab('radar')}
          >
            <Text style={styles.tabText}>Radar</Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}
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
  safeAreaTop: {
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  locationName: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
    textAlign: 'center',
  },
  dummySpace: {
    width: 40,
  },
  scrollContainer: {
    paddingBottom: 100, 
  },
  currentSummary: {
    margin: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  highLow: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
  },
  weatherAlert: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(251, 86, 7, 0.3)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  alertIcon: {
    fontSize: 24,
    color: '#ffb74d',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: theme.colors.text,
  },
  forecastTabs: {
    flexDirection: 'row',
    margin: 16,
    gap: 8,
  },
  tab: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  dailyForecast: {
    margin: 16,
  },
  dayCards: {
    gap: 12,
  },
  dayCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {},
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
  },
  dayIcon: {
    fontSize: 24,
  },
  dayTemps: {
    alignItems: 'flex-end',
  },
  dayHigh: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  dayLow: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
  },
  dayDetails: {
    marginTop: -5,
    marginBottom: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    width: '48%',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  hourlyScroll: {
    marginTop: 12,
  },
  hourCard: {
    minWidth: 60,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  hourTime: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  hourIcon: {
    fontSize: 20,
    marginVertical: 4,
  },
  hourTemp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholderContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 12,
  },
  navigateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  navigateButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ForecastScreen;