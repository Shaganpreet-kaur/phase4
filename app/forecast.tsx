import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ForecastScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>7-Day Forecast Coming Soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20 }
});