
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface CurrentWeatherProps {
  temperature: string;
  condition: string;
  feelsLike: string;
  highLow: string;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  temperature,
  condition,
  feelsLike,
  highLow,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.contextMessage}>Current Weather</Text>
      <Text style={styles.temperature}>{temperature}</Text>
      <Text style={styles.condition}>{condition}</Text>
      <Text style={styles.feelsLike}>{feelsLike}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.large,
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  contextMessage: {
    fontSize: theme.fontSize.large,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  temperature: {
    fontSize: 80,
    fontWeight: '200',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  condition: {
    fontSize: theme.fontSize.xxxlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  feelsLike: {
    fontSize: theme.fontSize.large,
    color: theme.colors.text,
  },
});

export default CurrentWeather;