import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Card = ({ children, backgroundColor = '#fff', borderColor = '#ccc' }) => {
  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      {children}
    </View>
  );
};

export const CardHeader = ({ children }) => (
  <View style={styles.cardHeader}>{children}</View>
);

export const CardTitle = ({ title }) => (
  <Text style={styles.cardTitle}>{title}</Text>
);

export const CardDescription = ({ description }) => (
  <Text style={styles.cardDescription}>{description}</Text>
);

export const CardContent = ({ children }) => (
  <View style={styles.cardContent}>{children}</View>
);

export const CardFooter = ({ children }) => (
  <View style={styles.cardFooter}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  cardContent: {
    marginTop: 8,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default Card;
