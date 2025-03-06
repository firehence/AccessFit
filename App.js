import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from './firebaseConfig';
import LoginScreen from './src/screens/LoginScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createStackNavigator();
const auth = getAuth(app);

export default function App() {
  useEffect(() => {
    // Kullanıcının oturum durumunu kontrol et
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Kullanıcı giriş yaptı:", user.email);
      } else {
        console.log("❌ Kullanıcı oturumu kapattı");
      }
    });
    return unsubscribe; // Bellek sızıntısını önlemek için aboneliği kaldır
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
