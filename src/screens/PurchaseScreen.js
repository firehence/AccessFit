import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase-fix";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";

const PurchaseScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { days, price } = route.params;

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const animationRef = useRef(null);

  const simulatePayment = async () => {
    if (cardNumber.length < 16 || expiry.length < 5 || cvv.length < 3) {
      Alert.alert("Invalid Info", "Please fill all fields correctly.");
      return;
    }

    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      let existing = docSnap.exists()
        ? docSnap.data().membershipDaysLeft || 0
        : 0;

      const newDays = existing + days;

      await updateDoc(docRef, {
        membershipDaysLeft: newDays,
        lastCheckedDate: new Date().toISOString(),
      });

      setShowAnimation(true);
      setTimeout(() => {
        navigation.navigate("BottomTabs", {
          screen: "QRScanner",
        });
      }, 2500);
    } catch (error) {
      Alert.alert("Payment Failed", "Something went wrong.");
    }
  };

  return (
    <LinearGradient
      colors={["#2E004F", "#6C1EB1", "#B586FF"]}
      style={styles.container}
    >
      {showAnimation ? (
        <LottieView
          ref={animationRef}
          source={require("../assets/success.json")}
          autoPlay
          loop={false}
          style={{ width: 200, height: 200, alignSelf: "center" }}
        />
      ) : (
        <>
          <Text style={styles.title}>Extend Membership</Text>

          <View style={styles.summaryBox}>
            <Text style={styles.label}>Plan:</Text>
            <Text style={styles.value}>{days} Days</Text>

            <Text style={styles.label}>Price:</Text>
            <Text style={styles.value}>{price} TL</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              placeholder="Card Number"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              maxLength={16}
              value={cardNumber}
              onChangeText={setCardNumber}
              style={styles.input}
            />
            <View style={styles.row}>
              <TextInput
                placeholder="MM/YY"
                placeholderTextColor="#aaa"
                maxLength={5}
                value={expiry}
                onChangeText={setExpiry}
                style={[styles.input, { flex: 1, marginRight: 10 }]}
              />
              <TextInput
                placeholder="CVV"
                placeholderTextColor="#aaa"
                maxLength={4}
                value={cvv}
                onChangeText={setCvv}
                style={[styles.input, { flex: 1 }]}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={simulatePayment}>
              <Text style={styles.buttonText}>Confirm Payment</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 30,
  },
  summaryBox: {
    marginBottom: 30,
    backgroundColor: "#ffffff22",
    padding: 20,
    borderRadius: 15,
  },
  label: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 2,
  },
  value: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#A96EFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PurchaseScreen;
