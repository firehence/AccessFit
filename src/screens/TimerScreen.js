import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TimerScreen = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", nextState => {
      if (appState.current.match(/active/) && nextState === "background") {
        if (isRunning) {
          console.log("App gitti ama timer açık ");
        }
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, [isRunning]);

  const startTimer = async () => {
    if (isRunning) return;
    setIsRunning(true);

    const startTimestamp = Date.now();
    await AsyncStorage.setItem("timerStart", JSON.stringify({ start: startTimestamp }));

    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = async () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    await AsyncStorage.removeItem("timerStart");
  };

  const resetTimer = async () => {
    await stopTimer();
    setTime(0);
  };

  useEffect(() => {
    const checkStorage = async () => {
      const saved = await AsyncStorage.getItem("timerStart");
      if (saved) {
        const { start } = JSON.parse(saved);
        const now = Date.now();
        const diffInSeconds = Math.floor((now - start) / 1000);
        setTime(diffInSeconds);
        startTimer();
      }
    };
    checkStorage();
  }, []);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Timer</Text>
      <Text style={styles.timerText}>{formatTime(time)}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={startTimer}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={stopTimer}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1241",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    color: "#A4E764",
    fontWeight: "bold",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    color: "white",
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
  },
  button: {
    backgroundColor: "#A4A4FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default TimerScreen;
