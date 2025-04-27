import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    // Here you would typically validate the QR code with your backend
    alert(`Welcome to the gym! Access granted.`);
    navigation.navigate('Home');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR Code</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Place the QR code inside the area
        </Text>
        <Text style={[styles.instructionText, styles.subText]}>
          Scanning will start automatically
        </Text>
      </View>

      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.start,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.extraLarge,
  },
  backButton: {
    padding: SIZES.base,
  },
  title: {
    color: COLORS.white,
    fontSize: SIZES.extraLarge,
    fontWeight: FONTS.bold,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  instructions: {
    padding: SIZES.extraLarge,
    alignItems: 'center',
  },
  instructionText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: FONTS.medium,
    textAlign: 'center',
  },
  subText: {
    opacity: 0.7,
    marginTop: SIZES.base,
    fontSize: SIZES.font,
  },
  button: {
    backgroundColor: COLORS.primary,
    margin: SIZES.extraLarge,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: FONTS.bold,
  },
  text: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    textAlign: 'center',
    margin: SIZES.extraLarge,
  },
});

export default QRScannerScreen; 