// src/screens/LocationScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../styles/theme';
import NavBar from '../components/navBar';
import WeatherService from '../services/API';
import LocationService from '../services/locationService';

const LocationScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentLocations, setRecentLocations] = useState([
    { name: 'Calgary, AB', details: 'Current Location', icon: '📍', temp: '-2°', weatherIcon: '🌙' },
    { name: 'Vancouver, BC', details: 'Canada', icon: '📱', temp: '8°', weatherIcon: '🌧️' },
    { name: 'Toronto, ON', details: 'Canada', icon: '📱', temp: '2°', weatherIcon: '❄️' },
  ]);
  const [popularLocations, setPopularLocations] = useState([
    { name: 'New York', details: 'United States', temp: '5°' },
    { name: 'London', details: 'United Kingdom', temp: '12°' },
    { name: 'Tokyo', details: 'Japan', temp: '16°' },
    { name: 'Sydney', details: 'Australia', temp: '25°' },
  ]);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        searchLocations();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchLocations = async () => {
    try {
      const results = await WeatherService.searchLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  };

  const handleLocationSelect = (location: string) => {
    navigation.navigate('Home', { location });
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const locationData = await LocationService.getCurrentLocation();
      if (locationData && locationData.city) {
        // Add to recent locations if it doesn't already exist there
        const currentLocIndex = recentLocations.findIndex(loc =>
          loc.icon === '📍' && loc.details === 'Current Location');

        // If found, update it
        if (currentLocIndex >= 0) {
          const updatedLocations = [...recentLocations];
          updatedLocations[currentLocIndex] = {
            ...updatedLocations[currentLocIndex],
            name: locationData.city
          };
          setRecentLocations(updatedLocations);
        }

        handleLocationSelect(locationData.city);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        "Location Error",
        "Unable to access your current location. Please ensure location services are enabled.",
        [{ text: "OK" }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const navItems = [
    { icon: '🏠', label: 'Today', onPress: () => navigation.navigate('Home') },
    { icon: '📅', label: 'Forecast', onPress: () => navigation.navigate('Forecast') },
    { icon: '🗺️', label: 'Radar', onPress: () => navigation.navigate('Radar') },
    { icon: '📊', label: 'Insights', onPress: () => navigation.navigate('Insights') },
  ];

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
          <Text style={styles.pageTitle}>Change Location</Text>
          <View style={styles.dummySpace} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a city or airport"
              placeholderTextColor="rgba(255, 255, 255, 0.8)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.currentLocation}
          onPress={getCurrentLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="white" style={{marginRight: 15}} />
          ) : (
            <Text style={styles.locationIcon}>📍</Text>
          )}
          <Text style={styles.locationText}>
            {locationLoading ? "Getting current location..." : "Use current location"}
          </Text>
        </TouchableOpacity>

        {searchResults.length > 0 ? (
          <View style={styles.locationGroup}>
            <Text style={styles.groupTitle}>Search Results</Text>
            <View style={styles.locationList}>
              {searchResults.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.locationItem}
                  onPress={() => handleLocationSelect(`${location.name}, ${location.region || location.country}`)}
                >
                  <View style={styles.locationLeft}>
                    <Text style={styles.locationIcon}>📱</Text>
                    <View>
                      <Text style={styles.locationName}>{location.name}</Text>
                      <Text style={styles.locationDetails}>{location.region}, {location.country}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.locationGroup}>
              <Text style={styles.groupTitle}>Recently Searched</Text>
              <View style={styles.locationList}>
                {recentLocations.map((location, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.locationItem}
                    onPress={() => handleLocationSelect(location.name)}
                  >
                    <View style={styles.locationLeft}>
                      <Text style={styles.locationIcon}>{location.icon}</Text>
                      <View>
                        <Text style={styles.locationName}>{location.name}</Text>
                        <Text style={styles.locationDetails}>{location.details}</Text>
                      </View>
                    </View>
                    <View style={styles.locationWeather}>
                      <Text style={styles.locationWeatherIcon}>{location.weatherIcon}</Text>
                      <Text style={styles.locationWeatherTemp}>{location.temp}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.popularLocations}>
              <Text style={styles.groupTitle}>Popular Cities</Text>
              <View style={styles.popularLocationsGrid}>
                {popularLocations.map((location, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.popularLocationCard}
                    onPress={() => handleLocationSelect(location.name)}
                  >
                    <Text style={styles.popularLocationTemp}>{location.temp}</Text>
                    <View>
                      <Text style={styles.popularLocationName}>{location.name}</Text>
                      <Text style={styles.popularLocationDetails}>{location.details}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <NavBar items={navItems} />
    </View>
  );
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
  dummySpace: {
    width: 44,
  },
  searchContainer: {
    margin: theme.spacing.large,
  },
  searchInputContainer: {
    position: 'relative',
    marginBottom: theme.spacing.medium,
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    fontSize: theme.fontSize.large,
  },
  searchInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 0,
    borderRadius: theme.borderRadius.xlarge,
    padding: theme.spacing.medium,
    paddingLeft: 45,
    color: theme.colors.text,
    fontSize: theme.fontSize.large,
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: theme.spacing.large,
    padding: theme.spacing.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.medium,
  },
  locationIcon: {
    fontSize: theme.fontSize.xxxlarge,
    marginRight: theme.spacing.medium,
  },
  locationText: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  locationGroup: {
    margin: theme.spacing.large,
  },
  groupTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  locationList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.medium,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  locationDetails: {
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
    opacity: 0.8,
  },
  locationWeather: {
    alignItems: 'flex-end',
  },
  locationWeatherIcon: {
    fontSize: theme.fontSize.xxxlarge,
    marginBottom: theme.spacing.small,
  },
  locationWeatherTemp: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  popularLocations: {
    margin: theme.spacing.large,
  },
  popularLocationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.medium,
  },
  popularLocationCard: {
    width: '48%',
    height: 120,
    padding: theme.spacing.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'space-between',
  },
  popularLocationTemp: {
    fontSize: theme.fontSize.xxxlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  popularLocationName: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  popularLocationDetails: {
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
    opacity: 0.8,
  },
});

export default LocationScreen;