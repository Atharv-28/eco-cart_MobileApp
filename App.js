import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import Icon from "react-native-vector-icons/Ionicons"; 
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; 

// screens
import Home from "./src/pages/home";
import GetRating from "./src/pages/getRating";
import LensSearch from "./src/pages/searchLens";

// components
import Header from "./src/components/header";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            header: () => (
              <SafeAreaView>
                <Header />
              </SafeAreaView>
            ),
            tabBarIcon: ({ focused }) => {
              let iconName;
              let IconComponent = Icon; 

              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "Get Rating") {
                IconComponent = MaterialCommunityIcons; 
                iconName = focused ? "card-search" : "card-search-outline";
              } else if (route.name === "Lens Search") {
                IconComponent = MaterialCommunityIcons; 
                iconName = focused ? "image-search" : "image-search-outline";
              }

              return (
                <IconComponent
                  name={iconName}
                  size={24}
                  color={focused ? "#198754" : "#6c757d"}
                />
              );
            },
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.label,
                  { color: focused ? "#198754" : "#6c757d" },
                ]}
              >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  tabBar: {
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingBottom: 5,
    height: 60,
  },
});
