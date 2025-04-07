// src/screens/InsightsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { theme } from '../styles/theme';
import NavBar from '../components/navBar';
import SafeAreaContainer from '../components/safeAreaContainer';

const InsightsScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState<string>('temperature');
  const location = route.params?.location || 'Calgary, AB';

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

              <View style={styles.insightCards}>
                <View style={styles.insightCard}>
                  <Text style={styles.insightValue}>-2°</Text>
                  <Text style={styles.insightLabel}>Today</Text>
                </View>
                <View style={styles.insightCard}>
                  <Text style={styles.insightValue}>-3°</Text>
                  <Text style={styles.insightLabel}>Yesterday</Text>
                </View>
                <View style={styles.insightCard}>
                  <Text style={styles.insightValue}>-5°</Text>
                  <Text style={styles.insightLabel}>Week Ago</Text>
                </View>
                <View style={styles.insightCard}>
                  <Text style={styles.insightValue}>0°</Text>
                  <Text style={styles.insightLabel}>Month Avg</Text>
                </View>
              </View>

              <View style={styles.trendCard}>
                <Text style={styles.trendIcon}>↗️</Text>
                <View>
                  <Text style={styles.trendTitle}>
                    Temperatures are rising
                  </Text>
                  <Text style={styles.trendText}>
                    Temperatures have increased by 3° compared to last week.
                  </Text>
                </View>
              </View>

              <View style={styles.notesCard}>
                <Text style={styles.notesTitle}>Historical Note</Text>
                <Text style={styles.notesText}>
                  This spring has been colder than usual for {location}.
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
          <TouchableOpacity style={[styles.periodButton, styles.activePeriod]}>
            <Text style={styles.periodText}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.periodButton}>
            <Text style={styles.periodText}>Season</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.periodButton}>
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
  bottomPadding: {
    height: 80, // Extra padding for bottom safe area
  },
});

export default InsightsScreen;