import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../firebase-fix";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

const QRScannerScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("User");
  const [qrValue, setQrValue] = useState("");
  const [membershipDaysLeft, setMembershipDaysLeft] = useState(null); // null başlangıç
  const [badges, setBadges] = useState([]);

  const membershipOptions = [
    { days: 30, price: 1000 },
    { days: 90, price: 2500 },
    { days: 365, price: 8000 },
  ];

  const checkAndAwardBadges = (log, existingBadges) => {
    const newBadges = new Set(existingBadges || []);
    const sortedDates = [...log.map(e => e.date)].sort();
    const uniqueDates = [...new Set(sortedDates)];

    if (uniqueDates.length === 1) newBadges.add("First-Entry");
    if (log.length >= 5) newBadges.add("5-Entry");

    let streak = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diff = (next - current) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        streak = 1;
      }

      if (streak >= 3) newBadges.add("3-Day-Streak");
      if (streak >= 7) newBadges.add("7-Day-Streak");
    }

    return Array.from(newBadges);
  };

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserName(userData.name || "User");

        const today = new Date();
        const todayDate = today.toISOString().split("T")[0];
        const lastChecked = userData.lastCheckedDate
          ? new Date(userData.lastCheckedDate)
          : today;

        const dayDiff = Math.floor(
          (today - lastChecked) / (1000 * 60 * 60 * 24)
        );

        let daysLeft = userData.membershipDaysLeft || 0;

        if (dayDiff > 0 && daysLeft > 0) {
          daysLeft = Math.max(daysLeft - dayDiff, 0);
          await updateDoc(docRef, {
            membershipDaysLeft: daysLeft,
            lastCheckedDate: today.toISOString(),
          });
        }

        setMembershipDaysLeft(daysLeft);
        setQrValue(`GYM_ACCESS:${userData.name}:${today.toISOString()}`);

        const log = userData.gymEntryLog || [];
        const badges = userData.badges || [];

        const alreadyLogged = log.some((entry) => entry.date === todayDate);
        if (!alreadyLogged && daysLeft > 0) {
          const time = today.toTimeString().split(" ")[0].slice(0, 5);
          const updatedLog = [...log, { date: todayDate, time }];
          const updatedBadges = checkAndAwardBadges(updatedLog, badges);
          await updateDoc(docRef, {
            gymEntryLog: updatedLog,
            badges: updatedBadges,
          });
          setBadges(updatedBadges);
        } else {
          setBadges(badges);
        }

        // ❗ Alert burada ve sadece veri geldikten sonra çalışır
        if (daysLeft === 0) {
          Alert.alert(
            "Membership Expired",
            "Your gym membership has expired. Please renew to access.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("Firestore error:", error);
      setUserName("User");
      setQrValue(`GYM_ACCESS:User:${new Date().toISOString()}`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const getTextColor = () => {
    if (membershipDaysLeft === 0) return "black";
    return membershipDaysLeft <= 14 ? "#FF5555" : "#00FF66";
  };

  const getSubMessage = () => {
    return membershipDaysLeft <= 0
      ? "Membership expired. Please renew to access the gym."
      : "Don't forget to renew before it runs out!";
  };

  return (
    <LinearGradient
      colors={["#1C052E", "#34175F", "#6F47C7"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.name}>{userName.toUpperCase()}</Text>
        <Text style={styles.motto}>Train hard. Stay strong.</Text>

        {membershipDaysLeft > 0 ? (
          <View style={styles.qrBox}>
            <QRCode value={qrValue} size={200} backgroundColor="white" />
          </View>
        ) : (
          <Text style={styles.blockedText}>
            QR Code unavailable. Renew membership.
          </Text>
        )}

        {membershipDaysLeft !== null && (
          <View style={styles.membershipStatus}>
            <Ionicons name="alert-circle-outline" size={22} color="white" />
            <Text style={[styles.daysLeft, { color: getTextColor() }]}>
              {membershipDaysLeft} DAYS LEFT
            </Text>
            <Text style={styles.subText}>{getSubMessage()}</Text>
          </View>
        )}

        <View style={styles.purchaseBox}>
          <Text style={styles.purchaseTitle}>Extend Your Membership</Text>
          {membershipOptions.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={styles.purchaseButton}
              onPress={() =>
                navigation.navigate("PurchaseScreen", {
                  days: option.days,
                  price: option.price,
                })
              }
            >
              <Text style={styles.buttonText}>
                {option.days} Days — {option.price} TL
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logButton}
          onPress={() => navigation.navigate("GymLogScreen")}
        >
          <Text style={styles.buttonText}>Gym Entry Activity</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    paddingTop: 60,
    alignItems: "center",
    paddingBottom: 80,
  },
  title: {
    fontSize: 22,
    color: "white",
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  name: {
    fontSize: 26,
    color: "#C6A9FF",
    fontWeight: "bold",
    marginVertical: 6,
  },
  motto: {
    color: "white",
    fontSize: 14,
    marginBottom: 20,
  },
  qrBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  blockedText: {
    color: "#FFAAAA",
    fontSize: 16,
    fontStyle: "italic",
    marginVertical: 20,
  },
  membershipStatus: {
    alignItems: "center",
    marginTop: 20,
  },
  daysLeft: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  subText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  purchaseBox: {
    marginTop: 30,
    width: "90%",
  },
  purchaseTitle: {
    color: "#EEE",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  purchaseButton: {
    backgroundColor: "#A079FF",
    paddingVertical: 12,
    borderRadius: 14,
    marginVertical: 6,
    alignItems: "center",
  },
  logButton: {
    marginTop: 20,
    backgroundColor: "#5E4AE3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default QRScannerScreen;
