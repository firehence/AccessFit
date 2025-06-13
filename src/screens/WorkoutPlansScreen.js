import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const categories = [
  "Shoulders",
  "Traps",
  "Chest",
  "Biceps",
  "Triceps",
  "Abs",
  "Legs",
  "Cardio",
];

const WorkoutPlansScreen = () => {
  const navigation = useNavigation();

  const handleCategoryPress = (muscleGroup) => {
    navigation.navigate("ExerciseSelection", { muscleGroup });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Plans</Text>
      <Text style={styles.subtitle}>
        Click on a category to add exercises to your personalized program
      </Text>

      <View style={styles.grid}>
        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.exerciseButton}
            onPress={() => handleCategoryPress(item)}
          >
            <Text style={styles.exerciseText}>{item}</Text>
            <View style={styles.underline} />
            <Ionicons name="add-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1241",
    paddingTop: 50,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    marginTop: 5,
    width: "80%",
  },
  grid: {
    marginTop: 20,
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
  },
  exerciseButton: {
    backgroundColor: "#181230",
    paddingVertical: 15,
    paddingHorizontal: 30,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  underline: {
    width: "50%",
    height: 2,
    backgroundColor: "#A4E764",
    marginTop: 5,
  },
});

export default WorkoutPlansScreen;
