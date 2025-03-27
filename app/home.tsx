import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import WeatherService from "../services/API"; // Ensure correct import path

export default function HomeScreen() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    WeatherService.getCurrentWeather("New York")
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching weather:", error);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : weather ? (
        <>
          <Text style={styles.city}>{weather.location.name}, {weather.location.country}</Text>
          <Text style={styles.text}>{weather.current.temp_c}°C</Text>
          <Text style={styles.condition}>{weather.current.condition.text}</Text>
        </>
      ) : (
        <Text style={styles.error}>Failed to fetch weather data.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  city: { fontSize: 20, fontWeight: "bold" },
  text: { fontSize: 24, fontWeight: "bold", marginVertical: 10 },
  condition: { fontSize: 18, color: "gray" },
  error: { fontSize: 18, color: "red" }
});
