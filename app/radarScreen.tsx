// app/radarScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../styles/theme';
import NavBar from '../components/navBar';
import SafeAreaContainer from '../components/safeAreaContainer';
import WeatherService from '../services/API';

const { width } = Dimensions.get('window');

const RadarScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [selectedMap, setSelectedMap] = useState<string>('precipitation');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [frames, setFrames] = useState<any[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number}>({ lat: 40.7128, lon: -74.0060 });
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  const location = route.params?.location || 'Calgary, AB';

  useEffect(() => {
    fetchLocationAndRadarData();
    
    // Clean up animation on unmount
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [location]);

  useEffect(() => {
    // Stop animation when changing tabs
    if (selectedMap !== 'precipitation' && isPlaying) {
      stopAnimation();
    }
  }, [selectedMap]);

  const fetchLocationAndRadarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const coords = await WeatherService.getCoordinates(location);
      setCoordinates(coords);
      
      // Fetch radar data
      const radarData = await WeatherService.getRadarData();
      
      if (radarData && radarData.radar && radarData.radar.past) {
        const formattedFrames = radarData.radar.past.map((frame: any) => {
          const date = new Date(frame.time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          
          const tileX = long2tile(coords.lon, 8);
          const tileY = lat2tile(coords.lat, 8);
          
          return {
            time: `${hours}:${minutes}`,
            date: date,
            imageUrl: `https://${radarData.host}${frame.path}/8/${tileX}/${tileY}/4/1.png`
          };
        });
        
        setFrames(formattedFrames);
        setSelectedFrame(formattedFrames.length - 1);
      } else {
        setError('No radar data available for this location');
      }
    } catch (err) {
      console.error('Error fetching radar data:', err);
      setError('Unable to load radar data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const long2tile = (lon: number, zoom: number) => {
    return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
  };
  
  const lat2tile = (lat: number, zoom: number) => {
    return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  };

  const playAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    setIsPlaying(true);
    
    animationRef.current = setInterval(() => {
      setSelectedFrame((prevFrame) => {
        const nextFrame = (prevFrame + 1) % frames.length;
        return nextFrame;
      });
    }, 500); // Change frame every 500ms
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleAnimation = () => {
    if (isPlaying) {
      stopAnimation();
    } else {
      playAnimation();
    }
  };

  const navItems = [
    { icon: '🏠', label: 'Today', onPress: () => navigation.navigate('Home') },
    { icon: '📅', label: 'Forecast', onPress: () => navigation.navigate('Forecast') },
    { icon: '🗺️', label: 'Radar', isActive: true, onPress: () => {} },
    { icon: '📊', label: 'Insights', onPress: () => navigation.navigate('Insights', { location }) },
  ];

  const mapTypes = [
    { id: 'precipitation', label: 'Precipitation' },
    { id: 'temperature', label: 'Temperature' },
    { id: 'wind', label: 'Wind' },
    { id: 'pressure', label: 'Pressure' },
  ];

  const renderMapContent = () => {
    switch (selectedMap) {
      case 'precipitation':
        if (loading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Loading radar data...</Text>
            </View>
          );
        }
        
        if (error) {
          return (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchLocationAndRadarData}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          );
        }
        
        if (frames.length === 0) {
          return (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No radar frames available</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchLocationAndRadarData}
              >
                <Text style={styles.retryText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          );
        }
        
        return (
          <View style={styles.mapContainer}>
            <View style={styles.radarContainer}>
              <Image 
                source={{ uri: frames[selectedFrame]?.imageUrl }} 
                style={styles.radarImage}
                resizeMode="cover"
              />
              <View style={styles.locationMarker} />
              
              <View style={styles.timeIndicator}>
                <Text style={styles.timeIndicatorText}>
                  {frames[selectedFrame]?.time || 'Loading...'}
                </Text>
              </View>
            </View>
            
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Precipitation Intensity</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendScale}>
                  <View style={[styles.legendColor, { backgroundColor: '#a1d3f8' }]} />
                  <View style={[styles.legendColor, { backgroundColor: '#4fabf7' }]} />
                  <View style={[styles.legendColor, { backgroundColor: '#2881dc' }]} />
                  <View style={[styles.legendColor, { backgroundColor: '#0f5cbf' }]} />
                  <View style={[styles.legendColor, { backgroundColor: '#00ff00' }]} />
                  <View style={[styles.legendColor, { backgroundColor: '#ffff00' }]} />
                  <View style={[styles.legendColor, { backgroundColor: '#ff9900' }]} />
                  <View style={[styles.legendColor, { backgroundColor: '#ff0000' }]} />
                </View>
              </View>
              <View style={styles.legendLabels}>
                <Text style={styles.legendLabel}>Light</Text>
                <Text style={styles.legendLabel}>Heavy</Text>
              </View>
            </View>
            
            <View style={styles.timelineContainer}>
              <Text style={styles.timelineTitle}>Radar Timeline</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
                {frames.map((frame, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timelineItem,
                      selectedFrame === index && styles.currentTimelineItem
                    ]}
                    onPress={() => {
                      setSelectedFrame(index);
                      if (isPlaying) stopAnimation();
                    }}
                  >
                    <Text style={[
                      styles.timelineText,
                      selectedFrame === index && styles.currentTimelineText
                    ]}>
                      {frame.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <TouchableOpacity 
              style={styles.playButton}
              onPress={toggleAnimation}
            >
              <Text style={styles.playButtonIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              <Text style={styles.playButtonText}>
                {isPlaying ? 'Pause Animation' : 'Play Animation'}
              </Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'temperature':
        return (
          <View style={styles.webViewContainer}>
            <WebView
              source={{ 
                uri: `https://openweathermap.org/weathermap?temp&lat=${coordinates.lat}&lon=${coordinates.lon}&zoom=5` 
              }}
              style={styles.webView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            />
            <Text style={styles.webViewAttribution}>
              Temperature data provided by OpenWeatherMap
            </Text>
          </View>
        );
        
      case 'wind':
        return (
          <View style={styles.webViewContainer}>
            <WebView
              source={{ 
                uri: `https://openweathermap.org/weathermap?wind&lat=${coordinates.lat}&lon=${coordinates.lon}&zoom=5` 
              }}
              style={styles.webView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            />
            <Text style={styles.webViewAttribution}>
              Wind data provided by OpenWeatherMap
            </Text>
          </View>
        );

      case 'pressure':
        return (
          <View style={styles.webViewContainer}>
            <WebView
              source={{ 
                uri: `https://openweathermap.org/weathermap?pressure&lat=${coordinates.lat}&lon=${coordinates.lon}&zoom=5` 
              }}
              style={styles.webView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            />
            <Text style={styles.webViewAttribution}>
              Pressure data provided by OpenWeatherMap
            </Text>
          </View>
        );
        
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Map Unavailable</Text>
            <Text style={styles.placeholderSubtext}>
              Select a different map type from the options above.
            </Text>
          </View>
        );
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
              <Text style={styles.pageTitle}>Weather Radar</Text>
              <Text style={styles.locationName}>{location}</Text>
            </View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={fetchLocationAndRadarData}
            >
              <Text>↻</Text>
            </TouchableOpacity>
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

        {renderMapContent()}
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
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  radarContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  locationMarker: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 6,
    top: '50%',
    left: '50%',
    marginLeft: -6,
    marginTop: -6,
  },
  timeIndicator: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  timeIndicatorText: {
    color: 'white',
    fontSize: 12,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 16,
  },
  errorContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  errorText: {
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  legendContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
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
    marginBottom: 16,
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
  placeholderContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  webViewContainer: {
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    height: 400,
  },
  webView: {
    flex: 1,
    borderRadius: 12,
  },
  webViewLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  webViewAttribution: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  }
});

export default RadarScreen;