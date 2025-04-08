// app/forecastScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
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
                <View key={hourIndex} style={[
                  styles.hourCard, 
                  hourTime === currentHour && styles.currentHourCard
                ]}>
                  <Text style={styles.hourTime}>
                    {hourTime === currentHour ? 'Now' : `${hourTime}:00`}
                  </Text>
                  <Text style={styles.hourIcon}>
                    {getWeatherIcon(hour.condition.text, hourTime)}
                  </Text>
                  <Text style={styles.hourTemp}>{Math.round(hour.temp_c)}°</Text>
                  <Text style={styles.hourCondition}>{hour.condition.text.split(' ')[0]}</Text>
                  {hourTime === currentHour && (
                    <View style={styles.currentIndicator} />
                  )}
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
                    style={[styles.dayCard, expandedDay === index && styles.expandedDayCard]}
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
                      <View style={styles.tempBar}>
                        <View 
                          style={[
                            styles.tempBarFill, 
                            { 
                              width: `${Math.min(100, Math.max(10, (day.day.maxtemp_c - day.day.mintemp_c) * 5))}%`,
                              backgroundColor: getTemperatureColor(day.day.maxtemp_c)
                            }
                          ]} 
                        />
                      </View>
                      <View style={styles.tempLabels}>
                        <Text style={styles.dayLow}>{Math.round(day.day.mintemp_c)}°</Text>
                        <Text style={styles.dayHigh}>{Math.round(day.day.maxtemp_c)}°</Text>
                      </View>
                    </View>
                    <Text style={styles.expandArrow}>
                      {expandedDay === index ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>

                  {expandedDay === index && (
                    <View style={styles.dayDetails}>
                      <Text style={styles.conditionSummary}>{day.day.condition.text}</Text>
                      
                      <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailIcon}>💧</Text>
                          <Text style={styles.detailLabel}>Precipitation</Text>
                          <Text style={styles.detailValue}>{day.day.daily_chance_of_rain}%</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailIcon}>💦</Text>
                          <Text style={styles.detailLabel}>Humidity</Text>
                          <Text style={styles.detailValue}>{day.day.avghumidity}%</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailIcon}>💨</Text>
                          <Text style={styles.detailLabel}>Wind</Text>
                          <Text style={styles.detailValue}>{day.day.maxwind_kph} km/h</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailIcon}>☀️</Text>
                          <Text style={styles.detailLabel}>UV Index</Text>
                          <Text style={styles.detailValue}>{day.day.uv} <Text style={getUVStyle(day.day.uv)}>({getUvIndexLevel(day.day.uv)})</Text></Text>
                        </View>
                      </View>

                      <Text style={styles.hourlyTitle}>Hourly Forecast</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
                        {day.hour.filter((_: any, i: number) => i % 3 === 0).map((hour: any, hourIndex: number) => (
                          <View key={hourIndex} style={styles.hourDetailCard}>
                            <Text style={styles.hourDetailTime}>
                              {new Date(hour.time).getHours() + ':00'}
                            </Text>
                            <Text style={styles.hourDetailIcon}>
                              {getWeatherIcon(hour.condition.text, new Date(hour.time).getHours())}
                            </Text>
                            <Text style={styles.hourDetailTemp}>{Math.round(hour.temp_c)}°</Text>
                            <View style={styles.hourDetailExtra}>
                              <Text style={styles.hourDetailRain}>💧 {hour.chance_of_rain}%</Text>
                              <Text style={styles.hourDetailWind}>💨 {Math.round(hour.wind_kph)} km/h</Text>
                            </View>
                          </View>
                        ))}
                      </ScrollView>
                      
                      <View style={styles.sunInfo}>
                        <View style={styles.sunTimes}>
                          <View style={styles.sunTime}>
                            <Text style={styles.sunIcon}>🌅</Text>
                            <Text style={styles.sunLabel}>Sunrise</Text>
                            <Text style={styles.sunValue}>{day.astro.sunrise}</Text>
                          </View>
                          <View style={styles.sunTime}>
                            <Text style={styles.sunIcon}>🌇</Text>
                            <Text style={styles.sunLabel}>Sunset</Text>
                            <Text style={styles.sunValue}>{day.astro.sunset}</Text>
                          </View>
                        </View>
                      </View>
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

  // Get background gradient based on time and weather
  const getBackgroundStyle = () => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;
    
    if (forecastData?.current?.condition?.text?.toLowerCase().includes('rain')) {
      return styles.rainBackground;
    } else if (forecastData?.current?.condition?.text?.toLowerCase().includes('snow')) {
      return styles.snowBackground;
    } else if (isNight) {
      return styles.nightBackground;
    } else {
      return styles.dayBackground;
    }
  };

  return (
    <View style={[styles.container, getBackgroundStyle()]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeAreaTop} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
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
                <Text style={styles.highTemp}>⬆️ {Math.round(forecastData.forecast.forecastday[0].day.maxtemp_c)}°</Text> • 
                <Text style={styles.lowTemp}>⬇️ {Math.round(forecastData.forecast.forecastday[0].day.mintemp_c)}°</Text>
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
            <Text style={[styles.tabText, activeTab === '24hours' && styles.activeTabText]}>24 Hours</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === '7days' && styles.activeTab]}
            onPress={() => setActiveTab('7days')}
          >
            <Text style={[styles.tabText, activeTab === '7days' && styles.activeTabText]}>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'radar' && styles.activeTab]}
            onPress={() => setActiveTab('radar')}
          >
            <Text style={[styles.tabText, activeTab === 'radar' && styles.activeTabText]}>Radar</Text>
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

const getUVStyle = (uv: number) => {
  if (uv <= 2) return styles.uvLow;
  if (uv <= 5) return styles.uvModerate;
  if (uv <= 7) return styles.uvHigh;
  if (uv <= 10) return styles.uvVeryHigh;
  return styles.uvExtreme;
};

const getTemperatureColor = (temp: number) => {
  if (temp <= 0) return '#92b4f4';  // Cold blue
  if (temp <= 10) return '#77ccff'; // Cool blue
  if (temp <= 20) return '#50c878'; // Pleasant green
  if (temp <= 30) return '#ffa500'; // Warm orange
  return '#ff5050';                 // Hot red
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  dayBackground: {
    backgroundColor: '#1565c0',
  },
  nightBackground: {
    backgroundColor: '#0d3875',
  },
  rainBackground: {
    backgroundColor: '#485d7c',
  },
  snowBackground: {
    backgroundColor: '#6087a7',
  },
  safeAreaTop: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    fontSize: 20,
    color: theme.colors.text,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 8,
  },
  highLow: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.9,
  },
  highTemp: {
    color: '#ff9090',
  },
  lowTemp: {
    color: '#90c6ff',
  },
  weatherAlert: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(251, 86, 7, 0.3)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  dailyForecast: {
    margin: 16,
  },
  dayCards: {
    gap: 12,
  },
  dayCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expandedDayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  dayInfo: {
    flex: 2,
  },
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
    fontSize: 28,
    flex: 1,
    textAlign: 'center',
  },
  dayTemps: {
    alignItems: 'flex-end',
    flex: 2,
  },
  tempBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  tempBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tempLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayHigh: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff9090',
  },
  dayLow: {
    fontSize: 14,
    color: '#90c6ff',
  },
  expandArrow: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    marginLeft: 8,
  },
  dayDetails: {
    marginTop: -5,
    marginBottom: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  conditionSummary: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    width: '48%',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  hourlyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  hourlyScroll: {
    marginBottom: 16,
  },
  hourCard: {
    minWidth: 75,
    height: 120,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  currentHourCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  currentIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ffeb3b',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  hourTime: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  hourIcon: {
    fontSize: 24,
    marginVertical: 4,
  },
  hourTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 4,
  },
  hourCondition: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
    marginTop: 2,
  },
  hourDetailCard: {
    minWidth: 80,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  hourDetailTime: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  hourDetailIcon: {
    fontSize: 20,
    marginVertical: 4,
  },
  hourDetailTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  hourDetailExtra: {
    alignItems: 'center',
  },
  hourDetailRain: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 2,
  },
  hourDetailWind: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
  },
  sunInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  sunTimes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sunTime: {
    alignItems: 'center',
  },
  sunIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  sunLabel: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 2,
  },
  sunValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  uvLow: {
    color: '#90EE90', 
  },
  uvModerate: {
    color: '#FFEB3B', 
  },
  uvHigh: {
    color: '#FFA500', 
  },
  uvVeryHigh: {
    color: '#FF6347', 
  },
  uvExtreme: {
    color: '#FF0000', 
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