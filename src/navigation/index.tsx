/**
 * Navigation Configuration
 * React Navigation setup with bottom tabs and stack navigators
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RootStackParamList, BottomTabParamList} from '@types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Placeholder screens (will be implemented later)
const PlaceholderScreen = ({route}: any) => {
  const {Text, View, StyleSheet} = require('react-native');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{route.name} Screen</Text>
      <Text style={styles.subtext}>Coming Soon</Text>
    </View>
  );
};

const styles = require('react-native').StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});

/**
 * Bottom Tab Navigator
 * 7 tabs: Profile, Chat, Saved, Posting, Contribution, Flag, Go Pro
 */
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => <TabIcon name="person" color={color} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({color}) => <TabIcon name="chat" color={color} />,
        }}
      />
      <Tab.Screen
        name="Saved"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({color}) => <TabIcon name="bookmark" color={color} />,
        }}
      />
      <Tab.Screen
        name="Posting"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Posting',
          tabBarIcon: ({color}) => <TabIcon name="list" color={color} />,
        }}
      />
      <Tab.Screen
        name="Contribution"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Reviews',
          tabBarIcon: ({color}) => <TabIcon name="star" color={color} />,
        }}
      />
      <Tab.Screen
        name="Flag"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Flag',
          tabBarIcon: ({color}) => <TabIcon name="flag" color={color} />,
        }}
      />
      <Tab.Screen
        name="GoPro"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Go Pro',
          tabBarIcon: ({color}) => <TabIcon name="diamond" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Tab Icon Component (placeholder)
 */
function TabIcon({name, color}: {name: string; color: string}) {
  const {View} = require('react-native');
  return (
    <View
      style={{
        width: 24,
        height: 24,
        backgroundColor: color,
        borderRadius: 4,
      }}
    />
  );
}

/**
 * Root Navigator
 * Handles authentication flow and main navigation
 */
export function RootNavigator({isAuthenticated}: {isAuthenticated: boolean}) {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={PlaceholderScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={BottomTabNavigator} />
          <Stack.Screen
            name="PostDetails"
            component={PlaceholderScreen}
            options={{presentation: 'modal'}}
          />
          <Stack.Screen
            name="ReviewDetails"
            component={PlaceholderScreen}
            options={{presentation: 'modal'}}
          />
          <Stack.Screen
            name="CreatePost"
            component={PlaceholderScreen}
            options={{presentation: 'modal'}}
          />
          <Stack.Screen
            name="CreateReview"
            component={PlaceholderScreen}
            options={{presentation: 'modal'}}
          />
          <Stack.Screen
            name="ChatConversation"
            component={PlaceholderScreen}
          />
          <Stack.Screen
            name="About"
            component={PlaceholderScreen}
            options={{presentation: 'modal'}}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

/**
 * Navigation Container with linking configuration
 */
export function Navigation({isAuthenticated}: {isAuthenticated: boolean}) {
  return (
    <NavigationContainer>
      <RootNavigator isAuthenticated={isAuthenticated} />
    </NavigationContainer>
  );
}
