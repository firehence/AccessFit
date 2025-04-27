import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { BarChart } from "react-native-chart-kit";

const HomeScreen = ({ navigation }) => {
  const workouts = [
    { name: "Upper Body", duration: "45 min", completed: true },
    { name: "Shoulder Day", duration: "30 min", completed: false },
    { name: "Biceps Last!", duration: "25 min", completed: false },
  ];

  const stats = {
    steps: "8,792",
    calories: "400",
    workouts: "3",
  };

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [30, 45, 28, 80, 99, 43, 50],
      },
    ],
  };

  return (
    <LinearGradient
      colors={[COLORS.background.start, COLORS.background.end]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Emirhan 👋</Text>
            <Text style={styles.subtitle}>Let's check your activity</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person-circle-outline" size={40} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, { backgroundColor: COLORS.primary }]}>
            <MaterialCommunityIcons name="shoe-print" size={24} color={COLORS.white} />
            <Text style={styles.statsValue}>{stats.steps}</Text>
            <Text style={styles.statsLabel}>Steps</Text>
          </View>

          <View style={[styles.statsCard, { backgroundColor: COLORS.secondary }]}>
            <MaterialCommunityIcons name="fire" size={24} color={COLORS.white} />
            <Text style={styles.statsValue}>{stats.calories}</Text>
            <Text style={styles.statsLabel}>Calories</Text>
          </View>

          <View style={[styles.statsCard, { backgroundColor: COLORS.success }]}>
            <MaterialCommunityIcons name="dumbbell" size={24} color={COLORS.white} />
            <Text style={styles.statsValue}>{stats.workouts}</Text>
            <Text style={styles.statsLabel}>Workouts</Text>
          </View>
        </View>

        {/* My Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Progress</Text>
          <BarChart
            data={chartData}
            width={styles.chart.width}
            height={180}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "transparent",
              backgroundGradientFrom: "transparent",
              backgroundGradientTo: "transparent",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: "rgba(255, 255, 255, 0.1)",
              },
            }}
            style={styles.chart}
          />
        </View>

        {/* Workout Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Workouts</Text>
          {workouts.map((workout, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.workoutCard,
                { backgroundColor: workout.completed ? COLORS.success : COLORS.secondary },
              ]}
            >
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDuration}>{workout.duration}</Text>
              </View>
              <MaterialCommunityIcons
                name={workout.completed ? "check-circle" : "chevron-right"}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={COLORS.white} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => navigation.navigate("QRScanner")}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="dumbbell" size={24} color={COLORS.white} />
          <Text style={styles.navText}>Workout</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: SIZES.extraLarge,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.extraLarge,
  },
  greeting: {
    fontSize: SIZES.extraLarge,
    color: COLORS.white,
    fontWeight: FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.white,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.extraLarge,
  },
  statsCard: {
    width: "30%",
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: "center",
  },
  statsValue: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: FONTS.bold,
    marginVertical: 4,
  },
  statsLabel: {
    color: COLORS.white,
    fontSize: SIZES.small,
    opacity: 0.8,
  },
  section: {
    marginBottom: SIZES.extraLarge,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    color: COLORS.white,
    fontWeight: FONTS.bold,
    marginBottom: SIZES.medium,
  },
  chart: {
    width: 320,
    marginVertical: 8,
    borderRadius: 16,
  },
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.base,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: FONTS.bold,
  },
  workoutDuration: {
    color: COLORS.white,
    fontSize: SIZES.small,
    opacity: 0.8,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingVertical: SIZES.medium,
    borderTopLeftRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    marginTop: 4,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
});

export default HomeScreen;
