// src/screens/RadarScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { theme } from '../styles/theme';
import NavBar from '../components/navBar';
import SafeAreaContainer from '../components/safeAreaContainer';

const RadarScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [selectedMap, setSelectedMap] = useState<string>('precipitation');
  const location = route.params?.location || 'Calgary, AB';

  const navItems = [
    { icon: '🏠', label: 'Today', onPress: () => navigation.navigate('Home') },
    { icon: '📅', label: 'Forecast', onPress: () => navigation.navigate('Forecast') },
    { icon: '🗺️', label: 'Radar', isActive: true, onPress: () => {} },
    { icon: '📊', label: 'Insights', onPress: () => navigation.navigate('Insights', { location }) },
  ];

  // Map type options
  const mapTypes = [
    { id: 'precipitation', label: 'Precipitation' },
    { id: 'temperature', label: 'Temperature' },
    { id: 'wind', label: 'Wind' },
    { id: 'pressure', label: 'Pressure' },
  ];

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
              <Text style={styles.pageTitle}>Weather Radar</Text>
              <Text style={styles.locationName}>{location}</Text>
            </View>
            <View style={styles.dummySpace} />
          </View>
        </SafeAreaView>

        <View style={styles.mapTypeContainer}>
          {mapTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.mapTypeButton,
                selectedMap === type.id && styles.selectedMapType
              ]}
              onPress={() => setSelectedMap(type.id)}
            >
              <Text style={[
                styles.mapTypeLabel,
                selectedMap === type.id && styles.selectedMapTypeLabel
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              {selectedMap.charAt(0).toUpperCase() + selectedMap.slice(1)} Map
            </Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Interactive weather radar would display here
            </Text>
          </View>

          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>{selectedMap.charAt(0).toUpperCase() + selectedMap.slice(1)} Legend</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendScale}>
                <View style={[styles.legendColor, { backgroundColor: '#ccfbff' }]} />
                <View style={[styles.legendColor, { backgroundColor: '#82e4fb' }]} />
                <View style={[styles.legendColor, { backgroundColor: '#33bbff' }]} />
                <View style={[styles.legendColor, { backgroundColor: '#0073ff' }]} />
                <View style={[styles.legendColor, { backgroundColor: '#00ff00' }]} />
                <View style={[styles.legendColor, { backgroundColor: '#ffff00' }]} />
                <View style={[styles.legendColor, { backgroundColor: '#ff9900' }]} />
                <View style={[styles.legendColor, { backgroundColor: '#ff0000' }]} />
              </View>
            </View>
            <View style={styles.legendLabels}>
              <Text style={styles.legendLabel}>Low</Text>
              <Text style={styles.legendLabel}>High</Text>
            </View>
          </View>

          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Timeline</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
              {['-3h', '-2h', '-1h', 'Now', '+1h', '+2h', '+3h'].map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timelineItem,
                    time === 'Now' && styles.currentTimelineItem
                  ]}
                >
                  <Text style={[
                    styles.timelineText,
                    time === 'Now' && styles.currentTimelineText
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.playButton}>
            <Text style={styles.playButtonIcon}>▶</Text>
            <Text style={styles.playButtonText}>Play Animation</Text>
          </TouchableOpacity>
        </View>
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
  mapTypeContainer: {
    flexDirection: 'row',
    margin: theme.spacing.large,
    marginBottom: theme.spacing.medium,
    flexWrap: 'wrap',
    gap: theme.spacing.small,
  },
  mapTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedMapType: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mapTypeLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.medium,
  },
  selectedMapTypeLabel: {
    fontWeight: 'bold',
  },
  mapContainer: {
    margin: theme.spacing.large,
    marginTop: 0,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  legendContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  legendTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItems: {
    marginVertical: 8,
  },
  legendScale: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  legendColor: {
    flex: 1,
    height: '100%',
  },
  legendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  legendLabel: {
    color: theme.colors.text,
    fontSize: 12,
  },
  timelineContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  timelineTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timelineScroll: {
    flexDirection: 'row',
  },
  timelineItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentTimelineItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  timelineText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  currentTimelineText: {
    fontWeight: 'bold',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  playButtonIcon: {
    color: theme.colors.text,
    fontSize: 16,
    marginRight: 8,
  },
  playButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 80, 
  },
});

export default RadarScreen;