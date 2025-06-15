// 1. KISIM (imports ve useEffect)
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  Animated,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase-fix";
import SpotifyWidget from "../components/SpotifyWidget";
import { useSpotifyAuth } from "../auth/spotifyAuth";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("User");
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [todaySteps, setTodaySteps] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { promptAsync, accessToken, isReady } = useSpotifyAuth();
  const [storedSpotifyToken, setStoredSpotifyToken] = useState(null);

  const fetchTodaySteps = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const today = new Date().toISOString().split("T")[0];
      const todayRecord = data?.stepHistory?.find((s) => s.date === today);
      setTodaySteps(todayRecord?.steps || 0);
    }
  };

  const fetchAllData = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();

    if (data?.fullName) setUserName(data.fullName);

    const today = new Date().toISOString().split("T")[0];
    const todayRecord = data?.stepHistory?.find((s) => s.date === today);
    setTodaySteps(todayRecord?.steps || 0);

    if (data?.weightHistory) {
      const sorted = data.weightHistory
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7);
      setWeightHistory(sorted);
    }
  }

  const savedPlan = await AsyncStorage.getItem("workoutPlan");
  if (savedPlan) {
    setWorkoutPlan(JSON.parse(savedPlan));
  }

  const savedSpotifyToken = await AsyncStorage.getItem("spotify_token");
  if (savedSpotifyToken) {
    setStoredSpotifyToken(savedSpotifyToken);
  }
};


  useEffect(() => {
    if (accessToken) {
      const saveToken = async () => {
        await AsyncStorage.setItem("spotify_token", accessToken);
        const uid = auth.currentUser?.uid;
        if (uid) {
          const ref = doc(db, "users", uid);
          await setDoc(ref, { spotifyAccessToken: accessToken }, { merge: true });
        }
        setStoredSpotifyToken(accessToken);
      };
      saveToken();
    }
  }, [accessToken]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchTodaySteps, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleSpotifyConnect = async () => {
    try {
      await promptAsync();
    } catch (e) {
      Alert.alert("Spotify", "Spotify connection failed.");
    }
  };

const chartData = {
  labels: weightHistory.map(e => e.date.slice(5)),
  datasets: [{
    data: weightHistory.map(e => parseFloat(e.weight)),
    color: () => `rgba(0, 255, 200, 1)`,
    strokeWidth: 2,
  }]
};

if (chartData.labels.length === 0) {
  chartData.labels = ["-", "-"];
  chartData.datasets[0].data = [0, 0];
}


  return (
    <LinearGradient colors={["#2E0066", "#50238F", "#9A75DA"]} style={styles.container}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.header, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.greeting}>Hello, {userName} 👋</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <FontAwesome5 name="user-circle" size={30} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.planContainer}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => navigation.navigate("Workout", { plan: workoutPlan })}
            style={[styles.card, styles.primaryCard]}
          >
            <FontAwesome5 name="dumbbell" size={24} color="black" />
            <Text style={styles.cardTitle}>
              {workoutPlan ? workoutPlan.name : "My Workout"}
            </Text>
            <Text style={styles.cardSubtitle}>
              {workoutPlan ? `${workoutPlan.exercises.length} exercises` : ""}
            </Text>
          </Pressable>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => navigation.navigate("Cardio")}
            style={[styles.card, styles.secondaryCard]}
          >
            <FontAwesome5 name="walking" size={24} color="white" />
            <Text style={styles.cardTitleWhite}>Cardio</Text>
            <Text style={styles.cardSubtitleWhite}>
              {todaySteps} steps{"\n"}
              {(todaySteps * 0.04).toFixed(0)} kcal
            </Text>
          </Pressable>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.smallCard}
            onPress={() => navigation.navigate("WorkoutPlansStack")}
          >
            <FontAwesome5 name="clipboard-list" size={24} color="white" />
            <Text style={styles.smallCardText}>Workout Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallCard, styles.timerCard]}
            onPress={() => navigation.navigate("Timer")}
          >
            <MaterialIcons name="timer" size={24} color="black" />
            <Text style={styles.smallCardTextBlack}>Timer</Text>
          </TouchableOpacity>
        </View>

        {!storedSpotifyToken && (
          <TouchableOpacity
            style={styles.spotifyConnectButton}
            onPress={handleSpotifyConnect}
            disabled={!isReady}
          >
            <FontAwesome5 name="spotify" size={24} color="#1DB954" />
            <Text style={styles.connectText}>Connect to Spotify</Text>
          </TouchableOpacity>
        )}

        {storedSpotifyToken && <SpotifyWidget token={storedSpotifyToken} />}

        <Text style={styles.sectionTitle}>Progress Overview</Text>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("Progress")}>
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 40}
            height={220}
            yAxisSuffix="kg"
            chartConfig={{
              backgroundGradientFrom: "#50238F",
              backgroundGradientTo: "#9A75DA",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: () => `#fff`,
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#00f2ff",
              },
            }}
            style={styles.chart}
            bezier
          />
        </TouchableOpacity>
      </Animated.ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { color: "white", fontSize: 24, fontWeight: "bold" },
  planContainer: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    width: "48%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 10,
    backgroundColor: "#fff",
  },
  primaryCard: { backgroundColor: "#C9B6F2" },
  secondaryCard: { backgroundColor: "#2D1B4D" },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "black", marginTop: 10 },
  cardSubtitle: { fontSize: 14, color: "black" },
  cardTitleWhite: { fontSize: 18, fontWeight: "bold", color: "white", marginTop: 10 },
  cardSubtitleWhite: { fontSize: 14, color: "white" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  smallCard: {
    width: "48%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#2D1B4D",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  smallCardText: { color: "white", marginTop: 5 },
  timerCard: { backgroundColor: "#A4E764" },
  smallCardTextBlack: { color: "black", marginTop: 5 },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
  },
  chart: { borderRadius: 16, marginBottom: 30 },
  spotifyConnectButton: {
    marginTop: 20,
    backgroundColor: "#2E2E2E",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  connectText: { color: "#fff", fontSize: 16, marginLeft: 10 },
});

export default HomeScreen;
