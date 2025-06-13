import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const Avatar = ({ uri, initials }) => {
  return (
    <View style={styles.avatar}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <Text style={styles.initials}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 40,   
    height: 40,  
    borderRadius: 20,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initials: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Avatar;
