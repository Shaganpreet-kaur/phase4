
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from './home';
import SearchScreen from './search';
import ForecastScreen from './forecast';
import SettingsScreen from './settings';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (<MaterialIcons name="home" size={size} color={color} />)
        }}/>
        <Tab.Screen name="Search" component={SearchScreen} options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (<MaterialIcons name="search" size={size} color={color} />)
        }}/>
        <Tab.Screen name="Forecast" component={ForecastScreen} options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (<MaterialIcons name="cloud" size={size} color={color} />)
        }}/>
        <Tab.Screen name="Settings" component={SettingsScreen} options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (<MaterialIcons name="settings" size={size} color={color} />)
        }}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}