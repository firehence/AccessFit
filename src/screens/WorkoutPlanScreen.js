import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WorkoutPlanScreen = () => {
  const navigation = useNavigation();
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    loadSelectedExercises();
  }, []);

  const loadSelectedExercises = async () => {
    try {
      const storedExercises = await AsyncStorage.getItem("selectedExercises");
      if (storedExercises) {
        setSelectedExercises(JSON.parse(storedExercises));
      }
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  };

  const saveWorkoutPlan = async () => {
    if (!planName.trim()) {
      alert("Please enter a plan name!");
      return;
    }

    const newPlan = { name: planName, exercises: selectedExercises };
    await AsyncStorage.setItem("savedWorkoutPlan", JSON.stringify(newPlan));

    await AsyncStorage.removeItem("selectedExercises");
    setSelectedExercises([]);

    alert(`Workout plan "${planName}" saved!`);
    navigation.navigate("Home", { savedPlan: newPlan });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Workout Plan</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter plan name..."
        placeholderTextColor="gray"
        value={planName}
        onChangeText={setPlanName}
      />

      {/*Seçilen Egzersizleri Listele */}
      <FlatList
        data={selectedExercises}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
            <Text style={styles.exerciseText}>{item}</Text>
          </View>
        )}
      />

      {/*Planı Kaydet Butonu */}
      <TouchableOpacity style={styles.saveButton} onPress={saveWorkoutPlan}>
        <Text style={styles.saveButtonText}>Save Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1241",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  input: {
    width: "90%",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  exerciseItem: {
    backgroundColor: "#181230",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    width: "90%",
  },
  exerciseText: {
    color: "white",
    fontSize: 16,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#A4E764",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});

export default WorkoutPlanScreen;
