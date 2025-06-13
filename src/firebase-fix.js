import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // ✅ storage da eklendi

const firebaseConfig = {
  apiKey: 'AIzaSyB20feYgL55iUEirPo-77c6tU8vrCyVgxs',
  authDomain: 'accessfit-d018f.firebaseapp.com',
  projectId: 'accessfit-d018f',
  storageBucket: 'accessfit-d018f.appspot.com',
  messagingSenderId: '977379094055',
  appId: '1:977379094055:android:b998cbda8f6ade4e856802',
};

// Uygulama zaten başlatılmadıysa başlat
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth, Hermes için initializeAuth + AsyncStorage ile başlatılır
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app); // ✅ storage burada başlatıldı

export { app, auth, db, storage };
