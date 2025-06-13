import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { BarChart } from "react-native-chart-kit";
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

  const { promptAsync, accessToken, isReady } = useSpotifyAuth();

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
      if (data?.name) setUserName(data.name);

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
  };

  // accessToken geldiğinde hem AsyncStorage'a hem Firestore'a yaz
  useEffect(() => {
    const saveSpotifyToken = async () => {
      if (accessToken) {
        await AsyncStorage.setItem("spotify_token", accessToken);
        const uid = auth.currentUser?.uid;
        if (uid) {
          const ref = doc(db, "users", uid);
          await setDoc(ref, { spotifyAccessToken: accessToken }, { merge: true });
        }
      }
    };

    saveSpotifyToken();
  }, [accessToken]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchTodaySteps, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSpotifyConnect = async () => {
    try {
      await promptAsync();
    } catch (e) {
      Alert.alert("Spotify", "Spotify bağlantısı başarısız oldu.");
    }
  };

  const chartData = {
    labels:
      weightHistory.length > 0
        ? weightHistory.map((e) => e.date.slice(5))
        : ["-", "-"],
    datasets: [
      {
        data:
          weightHistory.length > 0
            ? weightHistory.map((e) => parseFloat(e.weight))
            : [0, 0],
        color: () => "rgba(164, 231, 100, 1)",
      },
    ],
  };

  return (
    <LinearGradient colors={["#2E0066", "#50238F", "#9A75DA"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userName} 👋</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <FontAwesome5 name="user-circle" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.planContainer}>
        <TouchableOpacity
          style={[styles.card, styles.primaryCard]}
          onPress={() => navigation.navigate("Workout", { plan: workoutPlan })}
        >
          <FontAwesome5 name="dumbbell" size={24} color="black" />
          <Text style={styles.cardTitle}>
            {workoutPlan ? workoutPlan.name : "My Workout"}
          </Text>
          <Text style={styles.cardSubtitle}>
            {workoutPlan ? `${workoutPlan.exercises.length} exercises` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.secondaryCard]}
          onPress={() => navigation.navigate("Cardio")}
        >
          <FontAwesome5 name="walking" size={24} color="white" />
          <Text style={styles.cardTitleWhite}>Cardio</Text>
          <Text style={styles.cardSubtitleWhite}>
            {todaySteps} steps {"\n"} {(todaySteps * 0.04).toFixed(0)} kcal
          </Text>
        </TouchableOpacity>
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

      {!accessToken && (
        <TouchableOpacity
          style={styles.spotifyConnectButton}
          onPress={handleSpotifyConnect}
          disabled={!isReady}
        >
          <FontAwesome5 name="spotify" size={24} color="#1DB954" />
          <Text style={styles.connectText}>Connect to Spotify</Text>
        </TouchableOpacity>
      )}

      {accessToken && <SpotifyWidget token={accessToken} />}

      <Text style={styles.sectionTitle}>Progress Overview</Text>
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("Progress")}>
        <BarChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#50238F",
            backgroundGradientTo: "#9A75DA",
            decimalPlaces: 0,
            barPercentage: 0.7,
            color: () => `rgba(255, 255, 255, 1)`,
            labelColor: () => `#fff`,
            propsForBackgroundLines: {
              strokeWidth: 0,
            },
          }}
          style={styles.chart}
          fromZero
        />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  planContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    padding: 20,
    borderRadius: 10,
  },
  primaryCard: {
    backgroundColor: "#B295F4",
  },
  secondaryCard: {
    backgroundColor: "#2D1B4D",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginTop: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "black",
  },
  cardTitleWhite: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  cardSubtitleWhite: {
    fontSize: 14,
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  smallCard: {
    width: "48%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#2D1B4D",
    alignItems: "center",
  },
  smallCardText: {
    color: "white",
    marginTop: 5,
  },
  timerCard: {
    backgroundColor: "#A4E764",
  },
  smallCardTextBlack: {
    color: "black",
    marginTop: 5,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 30,
  },
  chart: {
    borderRadius: 10,
    marginBottom: 30,
  },
  spotifyConnectButton: {
    marginTop: 20,
    backgroundColor: "#2E2E2E",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  connectText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default HomeScreen;
