import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from '../firebase-fix';

import { doc, getDoc } from "firebase/firestore";

const QRScannerScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [daysLeft, setDaysLeft] = useState(14);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;
        let name = "User";
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            name = docSnap.data().name || "User";
          }
        }
        setUserName(name);
        setQrValue(`GYM_ACCESS:${name}:${new Date().toISOString()}`);
      } catch (error) {
        console.error("Firestore error:", error);
        setUserName("User");
        setQrValue(`GYM_ACCESS:User:${new Date().toISOString()}`);
      }
    };

    fetchUserName();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>WELCOME TO GYM</Text>
      <Text style={styles.userName}>{userName.toUpperCase()}</Text>
      <Text style={styles.slogan}>Every Rep, Every Step, One Step Closer!</Text>

      <View style={styles.qrContainer}>
        {qrValue ? (
          <QRCode value={qrValue} size={180} backgroundColor="white" />
        ) : (
          <Text style={styles.loadingText}>Generating QR Code...</Text>
        )}
      </View>

      <View style={styles.warningContainer}>
        <Ionicons name="alert-circle-outline" size={20} color="black" />
        <Text style={styles.warningText}>
          <Text style={styles.daysLeft}>{daysLeft} DAYS LEFT!!</Text>
        </Text>
        <Text style={styles.subText}>
          IT'S THE PERFECT TIME TO RENEW YOUR MEMBERSHIP!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1241",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  welcomeText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  userName: {
    fontSize: 24,
    color: "#A4A4FF",
    fontWeight: "bold",
    marginTop: 5,
  },
  slogan: {
    fontSize: 14,
    color: "white",
    marginTop: 5,
  },
  qrContainer: {
    marginTop: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
  },
  warningContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  warningText: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
  },
  daysLeft: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 12,
    color: "white",
    marginTop: 5,
    textAlign: "center",
  },
});

export default QRScannerScreen;
