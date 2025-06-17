import React, { useState, useEffect } from "react";
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
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { auth, db } from '../firebase-fix';

import { setDoc, doc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";

const SignUpScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "977379094055-kuqj6o6ro8960h86ou622jf1nf7dn0pe.apps.googleusercontent.com",
    androidClientId:
      "977379094055-2vtic85qv8it3lvf2md08rp9unahvve4.apps.googleusercontent.com",
    iosClientId:
      "977379094055-629lbuvet6kecj9f80duo0jigrtggkuu.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (userCred) => {
          const user = userCred.user;
          await setDoc(doc(db, "users", user.uid), {
            fullName: user.displayName || "Anonymous",
            email: user.email,
            phone: user.phoneNumber || "",
            createdAt: new Date(),
          });
          navigation.replace("BottomTabs");
        })
        .catch((error) => Alert.alert("Google Sign-In Error", error.message));
    }
  }, [response]);

  const saveUserToFirestore = async (user) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName || "Anonymous",
        email: user.email,
        phone: phone,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Firestore Error:", error);
    }
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !phone || !password || !isChecked) {
      alert("Please fill in all fields and accept the privacy policy.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await saveUserToFirestore(userCredential.user);
      navigation.replace("BottomTabs");
    } catch (error) {
      alert("Registration error: " + error.message);
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
        <Text style={styles.title}>Sign Up</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          placeholderTextColor={COLORS.gray}
        />

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
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholderTextColor={COLORS.gray}
          keyboardType="phone-pad"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
            placeholderTextColor={COLORS.gray}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsChecked(!isChecked)}
        >
          <View style={[styles.checkbox, isChecked && styles.checked]}>
            {isChecked && (
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.checkboxText}>
            By continuing you accept our Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpText}>Sign Up</Text>
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
        style={styles.signInContainer}
        onPress={() => navigation.navigate("SignIn")}
      >
        <Text style={styles.signInText}>
          Already have an account?{" "}
          <Text style={styles.signInLink}>Sign In</Text>
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  passwordInput: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.darkGray,
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
    flex: 1,
  },
  signUpButton: {
    backgroundColor: COLORS.black,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  signUpText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: FONTS.bold,
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
  },
  signInContainer: {
    alignItems: "center",
    marginTop: "auto",
  },
  signInText: {
    color: COLORS.white,
    fontSize: SIZES.font,
  },
  signInLink: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },
});

export default SignUpScreen;
