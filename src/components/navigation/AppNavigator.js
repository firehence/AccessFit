import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from "../screens/HomeScreen";
import QRScannerScreen from '../screens/QRScannerScreen';
import WorkoutPlansScreen from "../screens/WorkoutPlansScreen";
import ExerciseSelectionScreen from "../screens/ExerciseSelectionScreen"; // 📌 Egzersiz seçme ekranı eklendi
import WorkoutPlanScreen from "../screens/WorkoutPlanScreen"; // 📌 Kullanıcının oluşturduğu planı inceleyeceği ekran
import MyWorkoutScreen from "../screens/MyWorkoutScreen"; //

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
            {/* 📌 Ana ekran */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Dashboard" }}
      />

      {/* 📌 QR Kod Tarayıcı */}
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ title: "Scan QR Code", headerBackTitle: "Back" }}
      />

      {/* 📌 Workout Plan Kategorileri */}
      <Stack.Screen
        name="WorkoutPlans"
        component={WorkoutPlansScreen}
        options={{ title: "Workout Plans", headerBackTitle: "Back" }}
      />

      {/* 📌 Egzersiz Seçme Ekranı */}
      <Stack.Screen
        name="ExerciseSelection"
        component={ExerciseSelectionScreen}
        options={{ title: "Select Exercises", headerBackTitle: "Back" }}
      />

      {/* 📌 Kullanıcının Seçtiği Planı İnceleme Ekranı */}
      <Stack.Screen
        name="WorkoutPlanScreen"
        component={WorkoutPlanScreen}
        options={{ title: "My Workout Plan", headerBackTitle: "Back" }}
      />

      {/* 📌 Kaydedilen Workout Planlarını Görüntüleme */}
      <Stack.Screen
        name="MyWorkout"
        component={MyWorkoutScreen}
        options={{ title: "My Workout", headerBackTitle: "Back" }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
