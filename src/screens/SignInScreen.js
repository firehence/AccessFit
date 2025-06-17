import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase-fix";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { COLORS, FONTS, SIZES } from "../constants/theme";

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "977379094055-kuqj6o6ro8960h86ou622jf1nf7dn0pe.apps.googleusercontent.com",
    androidClientId:
      "977379094055-2vtic85qv8it3lvf2md08rp9unahvve4.apps.googleusercontent.com",
    iosClientId:
      "977379094055-629lbuvet6kecj9f80duo0jigrtggkuu.apps.googleusercontent.com",
  });

  const handleGoogleSignIn = async () => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("✅ Google Token:", authentication.accessToken);
    } else {
      Alert.alert("Google login cancelled or failed.");
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      let userName = "User";
      if (userDocSnap.exists()) {
        userName = userDocSnap.data().fullName || "User";
      }

      navigation.replace("BottomTabs", {
        screen: "Home",
        params: { userName },
      });
    } catch (error) {
      alert("Login error: " + error.message);
    }
  };

  return (
    <LinearGradient
      colors={["#2E0066", "#50238F", "#9A75DA"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Login</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor={COLORS.gray}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor={COLORS.gray}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setKeepSignedIn(!keepSignedIn)}
        >
          <View style={[styles.checkbox, keepSignedIn && styles.checked]}>
            {keepSignedIn && (
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.checkboxText}>Keep me signed in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, { opacity: request ? 1 : 0.4 }]}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Ionicons name="logo-google" size={20} color={COLORS.white} />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.signUpContainer}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.signUpText}>
          Don’t have an account?{" "}
          <Text style={styles.signUpLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.extraLarge,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  title: {
    fontSize: SIZES.extraLarge,
    color: COLORS.white,
    fontWeight: FONTS.bold,
    marginTop: 90,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    fontSize: SIZES.font,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.large,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginRight: SIZES.base,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    color: COLORS.white,
    fontSize: SIZES.font,
  },
  signInButton: {
    backgroundColor: COLORS.black,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  signInText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: FONTS.bold,
  },
  forgotPassword: {
    color: COLORS.white,
    fontSize: SIZES.font,
    textAlign: "center",
    textDecorationLine: "underline",
    marginBottom: SIZES.large,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.large,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.white,
  },
  orText: {
    color: COLORS.white,
    marginHorizontal: SIZES.medium,
    fontSize: SIZES.font,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginTop: SIZES.base,
  },
  googleText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: FONTS.bold,
    marginLeft: 10,
  },
  signUpContainer: {
    alignItems: "center",
    marginTop: "auto",
  },
  signUpText: {
    color: COLORS.white,
    fontSize: SIZES.font,
  },
  signUpLink: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },
});

export default SignInScreen;
