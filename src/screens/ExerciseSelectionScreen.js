import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { auth, db } from '../firebase-fix';


import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const exercises = {
  Shoulders: ["Lateral Raise", "Shoulder Press", "Rear Delt Row", "Military Press", "Arnold Press"],
  Traps: ["Shrugs", "Face Pulls", "Upright Row"],
  Chest: ["Bench Press", "Incline Press", "Chest Fly"],
  Biceps: ["Bicep Curl", "Hammer Curl", "Concentration Curl"],
  Triceps: ["Triceps Dip", "Overhead Extension", "Close Grip Bench"],
  Abs: ["Crunches", "Leg Raises", "Plank"],
  Legs: ["Squats", "Lunges", "Leg Press"],
  Cardio: ["Jump Rope", "Running", "Cycling"],
};

const ExerciseSelectionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { muscleGroup } = route.params;
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
        return;
      }
      setUid(user.uid);

      const userRef = doc(db, "users", user.uid);
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const list = data.workoutPlan?.selectedExercises || [];
          setSelectedExercises(list);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleExercise = async (exercise) => {
    if (!uid) return;
    const userRef = doc(db, "users", uid);

    const updated = selectedExercises.includes(exercise)
      ? selectedExercises.filter((ex) => ex !== exercise)
      : [...selectedExercises, exercise];

    setSelectedExercises(updated);

    try {
      await setDoc(userRef, {
        workoutPlan: {
          selectedExercises: updated,
          timestamp: serverTimestamp(),
        },
      }, { merge: true });
    } catch (error) {
      console.error("Firestore update error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{muscleGroup} Exercises</Text>
      <FlatList
        data={exercises[muscleGroup]}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseButton}
            onPress={() => toggleExercise(item)}
          >
            <Text style={styles.exerciseText}>{item}</Text>
            <Ionicons
              name={
                selectedExercises.includes(item)
                  ? "checkmark-circle"
                  : "add-circle-outline"
              }
              size={24}
              color="white"
            />
          </TouchableOpacity>
        )}
      />
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
  exerciseButton: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1A1241",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ExerciseSelectionScreen;
