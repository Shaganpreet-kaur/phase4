import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';
import NavBar from '../components/navBar';
import SafeAreaContainer from '../components/safeAreaContainer';
import WeatherService from '../services/API';

const extendedWeatherService = {
  ...WeatherService,
  getHistoricalWeather: async (city: string, date: string): Promise<any> => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/history.json?key=1d04f720c29b4685af1143558252703&q=${city}&dt=${date}`
      );
      return response.json();
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  },
};

const InsightsScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState<string>('temperature');
  const [activePeriod, setActivePeriod] = useState<string>('month');
  const [loading, setLoading] = useState<boolean>(false);
  const [historicalData, setHistoricalData] = useState<any>({
    today: null,
    yesterday: null,
    lastWeek: null,
    lastMonth: null,
  });
  const [trendData, setTrendData] = useState<any>({
    direction: '',
    difference: 0,
    message: '',
  });
  const location = route.params?.location || 'Calgary, AB';

  useEffect(() => {
    fetchHistoricalData();
  }, [location]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      // Calculate dates
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);

      // Fetch current weather
      const currentData = await extendedWeatherService.getCurrentWeather(location);
      
      // Fetch historical data
      const yesterdayData = await extendedWeatherService.getHistoricalWeather(
        location, 
        formatDate(yesterday)
      );
      
      const lastWeekData = await extendedWeatherService.getHistoricalWeather(
        location, 
        formatDate(lastWeek)
      );
      
      const lastMonthData = await extendedWeatherService.getHistoricalWeather(
        location, 
        formatDate(lastMonth)
      );

      // Extract temperatures
      const todayTemp = Math.round(currentData.current.temp_c);
      const yesterdayTemp = Math.round(yesterdayData.forecast.forecastday[0].day.avgtemp_c);
      const lastWeekTemp = Math.round(lastWeekData.forecast.forecastday[0].day.avgtemp_c);
      const lastMonthTemp = Math.round(lastMonthData.forecast.forecastday[0].day.avgtemp_c);

      // Calculate trend
      const weekTrendDiff = todayTemp - lastWeekTemp;
      const trendDirection = weekTrendDiff > 0 ? 'rising' : weekTrendDiff < 0 ? 'falling' : 'stable';
      const trendMessage = `Temperatures have ${trendDirection === 'stable' ? 'remained stable' : 
        trendDirection === 'rising' ? 'increased' : 'decreased'} by ${Math.abs(weekTrendDiff)}° compared to last week.`;

      setHistoricalData({
        today: todayTemp,
        yesterday: yesterdayTemp,
        lastWeek: lastWeekTemp,
        lastMonth: lastMonthTemp,
      });

      setTrendData({
        direction: trendDirection,
        difference: Math.abs(weekTrendDiff),
        message: trendMessage,
      });

    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { icon: '🏠', label: 'Today', onPress: () => navigation.navigate('Home') },
    { icon: '📅', label: 'Forecast', onPress: () => navigation.navigate('Forecast') },
    { icon: '🗺️', label: 'Radar', onPress: () => navigation.navigate('Radar', { location }) },
    { icon: '📊', label: 'Insights', isActive: true, onPress: () => {} },
  ];

  const tabs = [
    { id: 'temperature', label: 'Temperature' },
    { id: 'precipitation', label: 'Precipitation' },
    { id: 'wind', label: 'Wind' },
    { id: 'records', label: 'Records' },
  ];

  // Render graph placeholder based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'temperature':
        return (
          <>
            <View style={styles.graphPlaceholder}>
              <Text style={styles.graphTitle}>Temperature Trends</Text>
              <Text style={styles.graphSubtitle}>Monthly temperature data visualization</Text>
            </View>
            <View style={styles.insightsContainer}>
              <Text style={styles.insightTitle}>Temperature Trends</Text>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="white" />
                  <Text style={styles.loadingText}>Loading historical data...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.insightCards}>
                    <View style={styles.insightCard}>
                      <Text style={styles.insightValue}>{historicalData.today}°</Text>
                      <Text style={styles.insightLabel}>Today</Text>
                    </View>
                    <View style={styles.insightCard}>
                      <Text style={styles.insightValue}>{historicalData.yesterday}°</Text>
                      <Text style={styles.insightLabel}>Yesterday</Text>
                    </View>
                    <View style={styles.insightCard}>
                      <Text style={styles.insightValue}>{historicalData.lastWeek}°</Text>
                      <Text style={styles.insightLabel}>Week Ago</Text>
                    </View>
                    <View style={styles.insightCard}>
                      <Text style={styles.insightValue}>{historicalData.lastMonth}°</Text>
                      <Text style={styles.insightLabel}>Month Avg</Text>
                    </View>
                  </View>

                  <View style={styles.trendCard}>
                    <Text style={styles.trendIcon}>
                      {trendData.direction === 'rising' ? '↗️' : 
                       trendData.direction === 'falling' ? '↘️' : '➡️'}
                    </Text>
                    <View>
                      <Text style={styles.trendTitle}>
                        Temperatures are {trendData.direction}
                      </Text>
                      <Text style={styles.trendText}>
                        {trendData.message}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.notesCard}>
                <Text style={styles.notesTitle}>Historical Note</Text>
                <Text style={styles.notesText}>
                  This spring has been {historicalData.today < 5 ? 'colder' : 'warmer'} than usual for {location}.
                  The average temperature for this time of year is typically around 5°C.
                </Text>
              </View>
            </View>
          </>
        );
      case 'precipitation':
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Precipitation data visualization</Text>
            <Text style={styles.placeholderSubtext}>
              Historical precipitation patterns and comparisons would appear here.
            </Text>
          </View>
        );
      case 'wind':
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Wind data visualization</Text>
            <Text style={styles.placeholderSubtext}>
              Historical wind patterns and comparisons would appear here.
            </Text>
          </View>
        );
      case 'records':
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Weather records</Text>
            <Text style={styles.placeholderSubtext}>
              Record high and low temperatures, precipitation, and other weather events would appear here.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <SafeAreaView style={styles.safeHeader}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text>←</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.pageTitle}>Weather Insights</Text>
              <Text style={styles.locationName}>{location}</Text>
            </View>
            <View style={styles.dummySpace} />
          </View>
        </SafeAreaView>

        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, activePeriod === 'month' && styles.activePeriod]}
            onPress={() => setActivePeriod('month')}
          >
            <Text style={styles.periodText}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, activePeriod === 'season' && styles.activePeriod]}
            onPress={() => setActivePeriod('season')}
          >
            <Text style={styles.periodText}>Season</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, activePeriod === 'year' && styles.activePeriod]}
            onPress={() => setActivePeriod('year')}
          >
            <Text style={styles.periodText}>Year</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabText}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <NavBar items={navItems} />
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 80, 
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pageTitle: {
    fontSize: theme.fontSize.xlarge,
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
    width: 40,
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activePeriod: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 16,
    marginTop: 0,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  graphPlaceholder: {
    margin: 16,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  graphSubtitle: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  insightsContainer: {
    margin: 16,
    marginTop: 0,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  insightCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightCard: {
    width: '23%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
  },
  trendCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  trendIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  trendText: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
  },
  notesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
    lineHeight: 18,
  },
  placeholderContainer: {
    margin: 16,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 10,
  },
  bottomPadding: {
    height: 80, 
  },
});

export default InsightsScreen;