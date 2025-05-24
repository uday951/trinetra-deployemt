import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Chrome as Home, Shield, Globe, LayoutGrid, Smartphone, CircleAlert as AlertCircle, BookOpen, Lock, MapPin, Bell } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4169E1',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Welcome',
          tabBarIcon: ({ color, size }) => (
            <Home size={size-2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: 'Security',
          tabBarIcon: ({ color, size }) => (
            <Shield size={size-2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vpn"
        options={{
          title: 'VPN',
          tabBarIcon: ({ color, size }) => (
            <Globe size={size-2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: 'Apps',
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid size={size-2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="device"
        options={{
          title: 'Device',
          tabBarIcon: ({ color, size }) => (
            <Smartphone size={size-2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color, size }) => (
            <AlertCircle size={size-2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: 'Education',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size-2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="child-lock"
        options={{
          title: 'Child Lock',
          tabBarIcon: ({ color, size }) => (
            <Lock size={size-2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="geofence"
        options={{
          title: 'GeoFence',
          tabBarIcon: ({ color, size }) => (
            <MapPin size={size-2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Bell size={size-2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
});