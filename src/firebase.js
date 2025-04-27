import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import Constants from 'expo-constants';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config bilgileri artık app.json içinden geliyor
const firebaseConfig = Constants.expoConfig.extra.firebase;

// App'i başlat (daha önce başlatılmış mı kontrol ediyoruz)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Authentication
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Firestore
const db = getFirestore(app);

// Exports
export { app, auth, db };
