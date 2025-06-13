import React from 'react';
import { View, StyleSheet } from 'react-native';

const Separator = ({ orientation = 'horizontal' }) => {
  return (
    <View style={orientation === 'horizontal' ? styles.horizontal : styles.vertical} />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  vertical: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
});

export default Separator;
