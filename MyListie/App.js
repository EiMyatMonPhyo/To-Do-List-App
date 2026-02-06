import { StyleSheet, Text, View } from 'react-native'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext, useEffect } from 'react';

import Home from "./screens/Home";
import Today from "./screens/Today";
import Settings from "./screens/Settings";
import TaskCreation from "./screens/TaskCreation";
import { globalContext, GlobalContextProvider } from './globalContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MenuTabs() {
  const { compleC } = useContext(globalContext);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 90,
          backgroundColor: 'white',
        },
        tabBarActiveTintColor: compleC, 
        tabBarInactiveTintColor: 'black', 
        tabBarLabelStyle: {
          fontSize: 20,
          fontWeight: 'bold'
        }
      }}
    >
      <Tab.Screen name="Home" component={Home}/>
      <Tab.Screen name="Today" component={Today}/>
      <Tab.Screen name="Settings" component={Settings}/>
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GlobalContextProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Tabs" component={MenuTabs} options={{ headerShown: false }}/>
          <Stack.Screen name="TaskCreation" component={TaskCreation}/>
        </Stack.Navigator>
      </NavigationContainer>  
    </GlobalContextProvider>
  );
}

