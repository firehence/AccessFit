import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";

const SignUpScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");

  const handleSignUp = () => {
    if (!fullName || !email || !phone || !password || !gender) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    Alert.alert("Başarılı", "Kayıt işlemi tamamlandı!");
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        placeholder="Full Name..."
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Email..."
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Phone..."
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Password..."
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      <View style={styles.genderContainer}>
        <TouchableOpacity onPress={() => setGender("Male")} style={gender === "Male" ? styles.selectedButton : styles.button}>
          <Text style={styles.buttonText}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setGender("Female")} style={gender === "Female" ? styles.selectedButton : styles.button}>
          <Text style={styles.buttonText}>Female</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.privacyContainer}>
        <View style={styles.checkbox}></View>
        <Text style={styles.privacyText}>By continuing you accept our Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.signInContainer}>
        <Text style={styles.signInText}>Already have an account? <Text style={styles.signInLink}>Sign In</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#1a1a2e",
  },
  title: {
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#ddd",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: "#000",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
  },
  privacyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 8,
  },
  privacyText: {
    color: "#fff",
    fontSize: 14,
  },
  signUpButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  signUpText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  googleButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  googleText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInContainer: {
    marginTop: 10,
  },
  signInText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  signInLink: {
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});

export default SignUpScreen;
