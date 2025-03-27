import React, { useState } from 'react';
import { View, Switch, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <Text>Dark Mode</Text>
      <Switch value={darkMode} onValueChange={setDarkMode} />
    </View>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }
  });