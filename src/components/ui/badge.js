import React from 'react';
import { View, StyleSheet } from 'react-native';

const Badge = ({ color = '#ccc', size = 40 }) => {
  return <View style={[styles.badge, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />;
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Badge;
