import React from 'react';
import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/lib/theme';
import { StoreProvider } from '../src/store';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StoreProvider>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopColor: '#d8e2d8',
                borderTopWidth: 1,
              },
              tabBarActiveTintColor: '#3c7c5a',
              tabBarInactiveTintColor: '#8fb89e',
              tabBarLabelStyle: {
                fontSize: 16,
                fontWeight: '600',
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Today',
                tabBarIcon: () => null,
              }}
            />
            <Tabs.Screen
              name="weekly"
              options={{
                title: 'Weekly',
                tabBarIcon: () => null,
              }}
            />
            <Tabs.Screen
              name="habit/new"
              options={{
                href: null, // Hide from tabs
              }}
            />
            <Tabs.Screen
              name="habit/[id]"
              options={{
                href: null, // Hide from tabs
              }}
            />
          </Tabs>
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
