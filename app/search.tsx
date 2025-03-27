import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';

export default function SearchScreen() {
  const [city, setCity] = useState<string>('');
  const [locations, setLocations] = useState<string[]>([]);

  const addLocation = () => {
    if (city.trim()) {
      setLocations([...locations, city]);
      setCity('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Enter city" value={city} onChangeText={setCity} />
      <Button title="Save Location" onPress={addLocation} />
      <FlatList data={locations} renderItem={({ item }) => <Text style={styles.item}>{item}</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  item: { fontSize: 18, padding: 5 }
});
