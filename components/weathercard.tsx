// src/components/WeatherCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface WeatherCardProps {
  time: string;
  icon: string;
  temperature: string;
  isActive?: boolean;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ time, icon, temperature, isActive = false }) => {
  return (
    <View style={[styles.card, isActive && styles.activeCard]}>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.temp}>{temperature}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minWidth: 80,
    padding: theme.spacing.medium,
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
  },
  activeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  time: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  icon: {
    fontSize: theme.fontSize.xxxlarge,
    marginVertical: theme.spacing.small,
  },
  temp: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export default WeatherCard;