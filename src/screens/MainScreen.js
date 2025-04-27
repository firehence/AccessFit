import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, SIZES } from "../constants/theme";

const MainScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={[COLORS.background.start, COLORS.background.end]}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>
          ACCESS<Text style={styles.fitText}>FIT</Text>
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signUpButton]}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.extraLarge,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SIZES.large,
  },
  appName: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: FONTS.bold,
  },
  fitText: {
    color: COLORS.primary,
  },
  buttonContainer: {
    width: "100%",
    gap: SIZES.base,
  },
  button: {
    width: "100%",
    backgroundColor: COLORS.black,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: "center",
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: FONTS.bold,
  },
});

export default MainScreen;

