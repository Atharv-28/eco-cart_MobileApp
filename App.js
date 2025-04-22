import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import vector icons

// Import your screens
import Home from './src/pages/home';
import GetRating from './src/pages/getRating';
import LensSearch from './src/pages/searchLens';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Get Rating') {
              iconName = focused ? 'star' : 'star-outline';
            } else if (route.name === 'Lens Search') {
              iconName = focused ? 'search' : 'search-outline';
            }

            return (
              <Icon
                name={iconName}
                size={24}
                color={focused ? '#007bff' : '#6c757d'}
              />
            );
          },
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, { color: focused ? '#007bff' : '#6c757d' }]}>
              {route.name}
            </Text>
          ),
          tabBarStyle: styles.tabBar,
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Get Rating" component={GetRating} />
        <Tab.Screen name="Lens Search" component={LensSearch} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  tabBar: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingBottom: 5,
    height: 60,
  },
});
