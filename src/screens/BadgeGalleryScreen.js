import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebase-fix";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

// Gym QR rozetleri
const badgeData = [
  {
    id: "First-Entry",
    name: "First Entry",
    description: "Scanned your first QR!",
    icon: require("../assets/badges/first-entry.png"),
  },
  {
    id: "3-Day-Streak",
    name: "3 Day Streak",
    description: "Visited gym 3 days in a row!",
    icon: require("../assets/badges/3-day.png"),
  },
  {
    id: "5-Entry",
    name: "5 Visits",
    description: "Logged 5 gym entries!",
    icon: require("../assets/badges/5-entry.png"),
  },
  {
    id: "7-Day-Streak",
    name: "7 Day Streak",
    description: "1 full week of streak!",
    icon: require("../assets/badges/7-day.png"),
  },
];

// Progress goal badges
const progressBadges = [
  {
    id: "bronze-badge",
    level: "bronze",
    name: "Bronze Goal Badge",
    description: "Reached your goal once!",
    icon: require("../assets/badges/bronze-badge.png"),
  },
  {
    id: "silver-badge",
    level: "silver",
    name: "Silver Goal Badge",
    description: "Reached your goal 3 times!",
    icon: require("../assets/badges/silver-badge.png"),
  },
  {
    id: "gold-badge",
    level: "gold",
    name: "Gold Goal Badge",
    description: "Reached your goal 5+ times!",
    icon: require("../assets/badges/gold-badge.png"),
  },
];

const BadgeGalleryScreen = () => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [progressLevel, setProgressLevel] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchBadges = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setEarnedBadges(data.badges || []);
        setProgressLevel(data.badgeLevel || null);
      }
    };

    fetchBadges();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const isProgressBadgeEarned = (level) => {
    const order = ["bronze", "silver", "gold"];
    return (
      progressLevel &&
      order.indexOf(progressLevel) >= order.indexOf(level)
    );
  };

  return (
    <LinearGradient
      colors={["#140031", "#3C0D77", "#9C6BFF"]}
      style={styles.container}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>🎖️ My Badges</Text>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* QR rozetleri */}
          {badgeData.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <View
                key={badge.id}
                style={[styles.card, { opacity: earned ? 1 : 0.3 }]}
              >
                <Image
                  source={badge.icon}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <View style={styles.infoBox}>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDesc}>{badge.description}</Text>
                  {earned && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#00FFAA"
                    />
                  )}
                </View>
              </View>
            );
          })}

          {/* Progress (hedef) rozetleri */}
          {progressBadges.map((badge) => {
            const earned = isProgressBadgeEarned(badge.level);
            return (
              <View
                key={badge.id}
                style={[styles.card, { opacity: earned ? 1 : 0.3 }]}
              >
                <Image
                  source={badge.icon}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <View style={styles.infoBox}>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDesc}>{badge.description}</Text>
                  {earned && (
                    <Ionicons name="star" size={20} color="#FFD700" />
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  scroll: {
    alignItems: "center",
    paddingBottom: 80,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff22",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    width: "90%",
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  infoBox: {
    flex: 1,
  },
  badgeName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  badgeDesc: {
    color: "#ddd",
    fontSize: 12,
    marginBottom: 4,
  },
});

export default BadgeGalleryScreen;
