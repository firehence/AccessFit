import React, { useEffect, useRef, useState } from 'react';
import { Animated, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Accelerometer } from 'expo-sensors';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './src/firebase-fix';

import SignUpScreen from './src/screens/SignUpScreen';
import SignInScreen from './src/screens/SignInScreen';
import MainScreen from './src/screens/MainScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import MyWorkoutScreen from './src/screens/MyWorkoutScreen';
import HomeScreen from './src/screens/HomeScreen';
import TimerScreen from './src/screens/TimerScreen';
import WorkoutPlansScreen from './src/screens/WorkoutPlansScreen';
import ExerciseSelectionScreen from './src/screens/ExerciseSelectionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CardioScreen from './src/screens/CardioScreen';
import SplashScreen from './src/screens/SplashScreen';
import PurchaseScreen from './src/screens/PurchaseScreen';
import GymLogScreen from './src/screens/GymLogScreen';
import BadgeGalleryScreen from './src/screens/BadgeGalleryScreen';

LogBox.ignoreLogs(['Setting a timer']);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const InnerStack = createNativeStackNavigator();

function WorkoutPlansStack() {
  return (
    <InnerStack.Navigator screenOptions={{ headerShown: false }}>
      <InnerStack.Screen name="WorkoutPlansMain" component={WorkoutPlansScreen} />
      <InnerStack.Screen name="ExerciseSelection" component={ExerciseSelectionScreen} />
    </InnerStack.Navigator>
  );
}

function MainHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Cardio" component={CardioScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
    </Stack.Navigator>
  );
}

function BottomTabsWithScreens() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#29215A',
          height: 80,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          paddingBottom: 10,
          paddingTop: 8,
          position: 'absolute',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#A4A4FF',
        tabBarInactiveTintColor: 'white',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          if (route.name === 'MainHome') iconName = 'home';
          else if (route.name === 'WorkoutPlansStack') iconName = 'clipboard-outline';
          else if (route.name === 'QRScanner') iconName = 'qr-code';
          else if (route.name === 'Workout') iconName = 'barbell';
          else if (route.name === 'Settings') iconName = 'settings-outline';

          const animatedValue = new Animated.Value(focused ? 1.2 : 1);
          Animated.spring(animatedValue, {
            toValue: focused ? 1.2 : 1,
            useNativeDriver: true,
            friction: 4,
          }).start();

          return (
            iconName && (
              <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
                <Ionicons name={iconName} size={focused ? 30 : 26} color={color} />
              </Animated.View>
            )
          );
        },
      })}
    >
      <Tab.Screen name="MainHome" component={MainHomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="WorkoutPlansStack" component={WorkoutPlansStack} options={{ title: 'WorkoutPlans' }} />
      <Tab.Screen name="QRScanner" component={QRScannerScreen} />
      <Tab.Screen name="Workout" component={MyWorkoutScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [stepCount, setStepCount] = useState(0);
  const lastStepTime = useRef(Date.now());
  const lastRecordedDate = useRef(new Date().toISOString().split("T")[0]);
  const accelerometerSub = useRef(null);

  useEffect(() => {
    const handleAccelerometer = ({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > 1.2 && now - lastStepTime.current > 500) {
        lastStepTime.current = now;
        setStepCount((prev) => {
          const newCount = prev + 1;
          saveStepsToFirestore(newCount);
          return newCount;
        });
      }
    };

    const startSensor = () => {
      Accelerometer.setUpdateInterval(300);
      accelerometerSub.current = Accelerometer.addListener(handleAccelerometer);
    };

    const stopSensor = () => {
      if (accelerometerSub.current) {
        accelerometerSub.current.remove();
        accelerometerSub.current = null;
      }
    };

    const fetchInitialStep = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const today = new Date().toISOString().split("T")[0];
      const data = snap.data()?.stepHistory?.find((d) => d.date === today);
      if (data) setStepCount(data.steps);
    };

    const saveStepsToFirestore = async (count) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const today = new Date().toISOString().split("T")[0];
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const existing = snap.data()?.stepHistory || [];
      const updated = [
        ...existing.filter((d) => d.date !== today),
        { date: today, steps: count },
      ];
      await setDoc(ref, { stepHistory: updated, dailyStepCount: count }, { merge: true });
    };

    const checkNewDay = () => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== lastRecordedDate.current) {
        setStepCount(0);
        lastRecordedDate.current = today;
      }
    };

    fetchInitialStep();
    startSensor();
    const dailyReset = setInterval(checkNewDay, 60000);

    return () => {
      stopSensor();
      clearInterval(dailyReset);
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="BottomTabs" component={BottomTabsWithScreens} />
        <Stack.Screen name="PurchaseScreen" component={PurchaseScreen} />
        <Stack.Screen name="GymLogScreen" component={GymLogScreen} />
        <Stack.Screen name="BadgeGallery" component={BadgeGalleryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
