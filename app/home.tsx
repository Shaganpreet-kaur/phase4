import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import WeatherService from '../services/API';

export default function HomeScreen() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    WeatherService.getCurrentWeather('New York')
      .then(data => {
        setWeather(data);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#0000ff" /> : (
        <Text style={styles.text}>{weather?.main.temp}°C</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' }
});