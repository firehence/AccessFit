import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Share,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { auth, db } from "../firebase-fix";
import { doc, getDoc } from "firebase/firestore";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const GymLogScreen = () => {
  const [logData, setLogData] = useState([]);
  const [monthFiltered, setMonthFiltered] = useState(false);

  useEffect(() => {
    const fetchLog = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const entries = snap.data()?.gymEntryLog || [];
      const sorted = entries.sort((a, b) =>
        a.date < b.date ? -1 : a.date > b.date ? 1 : 0
      );
      setLogData(sorted);
    };
    fetchLog();
  }, []);

  const getMonthLogs = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return logData.filter((entry) => entry.date.startsWith(currentMonth));
  };

  const filteredLogs = monthFiltered ? getMonthLogs() : logData;

  const labels = filteredLogs.map((e) => e.date.slice(5)); // MM-DD
  const values = filteredLogs.map((_, i) => i + 1);

  const getWeeklyStats = () => {
    const week = Array(7).fill(0);
    filteredLogs.forEach((entry) => {
      const day = new Date(entry.date).getDay(); // 0 (Sun) - 6 (Sat)
      week[day]++;
    });
    return week;
  };

  const exportToCSV = async () => {
    const csv = "Date,Time\n" + logData.map((e) => `${e.date},${e.time}`).join("\n");
    const path = FileSystem.documentDirectory + "gym_log.csv";
    await FileSystem.writeAsStringAsync(path, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(path);
  };

  return (
    <LinearGradient colors={["#1B103A", "#2F165E", "#472D8F"]} style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bar-chart-outline" size={24} color="#A4A4FF" />
        <Text style={styles.title}>Gym Entry History</Text>
      </View>

      {filteredLogs.length > 0 ? (
        <>
          <LineChart
            data={{
              labels,
              datasets: [{ data: values }],
            }}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#2F165E",
              backgroundGradientTo: "#472D8F",
              decimalPlaces: 0,
              color: () => "#A4A4FF",
              labelColor: () => "#fff",
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#C6A9FF",
              },
            }}
            bezier
            style={styles.chart}
          />

          <Text style={styles.subHeader}>Weekly Stats</Text>
          <BarChart
            data={{
              labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              datasets: [{ data: getWeeklyStats() }],
            }}
            width={Dimensions.get("window").width - 32}
            height={180}
            chartConfig={{
              backgroundColor: "#2F165E",
              backgroundGradientFrom: "#2F165E",
              backgroundGradientTo: "#472D8F",
              decimalPlaces: 0,
              color: () => "#A4A4FF",
              labelColor: () => "#fff",
            }}
            style={{ borderRadius: 16, marginBottom: 20 }}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => setMonthFiltered((prev) => !prev)}
              style={styles.actionButton}
            >
              <Ionicons name="calendar-outline" size={18} color="white" />
              <Text style={styles.actionText}>
                {monthFiltered ? "Show All" : "This Month"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={exportToCSV} style={styles.actionButton}>
              <Ionicons name="download-outline" size={18} color="white" />
              <Text style={styles.actionText}>Export CSV</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={[...filteredLogs].reverse()}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.logItem}>
                <Ionicons name="time-outline" size={18} color="#FFD700" />
                <Text style={styles.logText}>
                  {item.date} @ {item.time}
                </Text>
              </View>
            )}
          />
        </>
      ) : (
        <Text style={styles.empty}>No gym entry data found.</Text>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#A4A4FF",
  },
  chart: {
    borderRadius: 16,
    marginBottom: 12,
  },
  subHeader: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  logText: {
    marginLeft: 10,
    color: "#fff",
    fontSize: 14,
  },
  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "#7049D1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});

export default GymLogScreen;
