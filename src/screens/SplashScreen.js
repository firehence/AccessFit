import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../firebase-fix';


const SplashScreen = ({ navigation }) => {
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const fadeText = useRef(new Animated.Value(0)).current;
  const slideText = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(fadeLogo, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(fadeText, {
        toValue: 1,
        duration: 1000,
        delay: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideText, {
        toValue: 0,
        duration: 1000,
        delay: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          navigation.replace("BottomTabs"); // 🔁 Doğrudan uygulamaya yönlendir
        } else {
          navigation.replace("Main");
        }
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#2E0066", "#50238F", "#9A75DA"]}
      style={styles.container}
    >
      <Animated.Image
        source={require("../assets/logo.png")}
        style={[styles.logo, { opacity: fadeLogo }]}
        resizeMode="contain"
      />
      <Animated.Text
        style={[
          styles.slogan,
          { opacity: fadeText, transform: [{ translateY: slideText }] },
        ]}
      >
        Let’s get stronger
      </Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  slogan: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    letterSpacing: 1.2,
  },
});

export default SplashScreen;
