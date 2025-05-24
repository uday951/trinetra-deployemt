import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Share } from 'lucide-react-native';
import { Shield } from 'lucide-react-native';

type HeaderProps = {
  title: string;
  showNotificationDot?: boolean;
};

export default function Header({ title, showNotificationDot = true }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          <Shield size={24} color="#4169E1" fill="#4169E1" />
        </View>
        <Text style={styles.title}>Trinetra Security</Text>
      </View>
      
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <View>
            <Bell size={24} color="#555" />
            {showNotificationDot && <View style={styles.notificationDot} />}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton}>
          <Share size={24} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 32,
    height: 32,
    backgroundColor: '#E6EEFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4169E1',
  },
});