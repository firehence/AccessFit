import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import { BarChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase-fix";
import { useFocusEffect } from "@react-navigation/native";

const CardioScreen = () => {
  const [stepCount, setStepCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastStepTime, setLastStepTime] = useState(Date.now());
  const [hasFetched, setHasFetched] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const lastRecordedDate = useRef(new Date().toISOString().split("T")[0]);
  const accelerometerSub = useRef(null);

  const handleAccelerometer = ({ x, y, z }) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();
    if (magnitude > 1.2 && now - lastStepTime > 500) {
      setLastStepTime(now);
      setStepCount((prev) => {
        const newCount = prev + 1;
        saveTodaySteps(newCount); // Anında Firestore'a kaydet
        return newCount;
      });
    }
  };

  const startSensor = () => {
    Accelerometer.setUpdateInterval(300);
    accelerometerSub.current = Accelerometer.addListener(handleAccelerometer);
  };

  const stopSensor = () => {
    if (accelerometerSub.current) {
      accelerometerSub.current.remove();
      accelerometerSub.current = null;
    }
  };

  const fetchInitialStepCount = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const data = snap.data();
      const today = new Date().toISOString().split("T")[0];
      const todayData = data?.stepHistory?.find((s) => s.date === today);
      setStepCount(todayData?.steps || 0);
    } catch (e) {
      console.log("Step fetch error:", e.message);
      setStepCount(0);
    }
  };

  const fetchHistory = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const data = snap.data();
      if (data?.stepHistory) {
        setHistory(data.stepHistory.slice(-7));
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const saveTodaySteps = async (count) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const existing = snap.data()?.stepHistory || [];

      const updated = [
        ...existing.filter((d) => d.date !== today),
        { date: today, steps: count },
      ];

      await setDoc(
        ref,
        {
          stepHistory: updated,
          dailyStepCount: count,
        },
        { merge: true }
      );

      setHistory(updated.slice(-7));
    } catch (err) {
      console.log("save error", err.message);
    }
  };

  const checkForNewDay = () => {
    const today = new Date().toISOString().split("T")[0];
    if (today !== lastRecordedDate.current) {
      setStepCount(0);
      lastRecordedDate.current = today;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const init = async () => {
        if (!hasFetched) {
          await fetchInitialStepCount();
          await fetchHistory();
          setHasFetched(true);
        }
        startSensor();
        setIsReady(true);
      };

      init();
      const midnightChecker = setInterval(checkForNewDay, 60000);

      return () => {
        stopSensor();
        clearInterval(midnightChecker);
      };
    }, [hasFetched])
  );

  const chartData = {
    labels: history.map((d) => d.date.slice(5)),
    datasets: [
      {
        data: history.map((d) => d.steps),
        color: () => "#A4E764",
      },
    ],
  };

  if (!isReady) {
    return (
      <LinearGradient
        colors={["#2E0066", "#50238F", "#9A75DA"]}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#2E0066", "#50238F", "#9A75DA"]}
      style={styles.container}
    >
      <Text style={styles.title}>Live Step Counter</Text>
      <View style={styles.counterBox}>
        <Text style={styles.count}>{stepCount} steps</Text>
        <Text style={styles.kcal}>{(stepCount * 0.04).toFixed(0)} kcal</Text>
      </View>

      <Text style={styles.subtitle}>Weekly Progress</Text>
      <BarChart
        data={chartData}
        width={Dimensions.get("window").width - 30}
        height={240}
        yAxisLabel=""
        chartConfig={{
          backgroundGradientFrom: "#50238F",
          backgroundGradientTo: "#9A75DA",
          decimalPlaces: 0,
          barPercentage: 0.5,
          color: () => `rgba(255, 255, 255, 1)`,
          labelColor: () => "#fff",
          propsForBackgroundLines: {
            stroke: "#666",
            strokeDasharray: "4",
          },
        }}
        style={styles.chart}
        fromZero
        showBarTops={false}
        withInnerLines
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
    textAlign: "center",
  },
  count: { fontSize: 36, fontWeight: "bold", color: "#00ffcc" },
  kcal: { fontSize: 18, color: "#ccc", marginTop: 4 },
  counterBox: { marginTop: 20, alignItems: "center" },
  chart: { marginTop: 20, borderRadius: 12 },
});

export default CardioScreen;
