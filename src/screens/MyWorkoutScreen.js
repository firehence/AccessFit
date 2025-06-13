import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { auth, db } from '../firebase-fix';


import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const MyWorkoutScreen = () => {
  const [currentExercises, setCurrentExercises] = useState([]);
  const [previousExercises, setPreviousExercises] = useState([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigation.replace("SignIn");
        return;
      }

      const uid = user.uid;
      const ref = doc(db, "users", uid);

      const unsubscribeSnapshot = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const exercises = data?.workoutPlan?.selectedExercises || [];
          const timestamp = data?.workoutPlan?.timestamp?.toDate();

          if (timestamp) {
            const now = new Date();
            const diffInMs = now - timestamp;
            const diffInHours = diffInMs / (1000 * 60 * 60);

            if (diffInHours <= 12) {
              setCurrentExercises(exercises);
              setPreviousExercises([]);
            } else {
              setCurrentExercises([]);
              setPreviousExercises(exercises);
            }
          }
        }
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  const renderExerciseItem = ({ item }) => (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseText}>{item}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A4E764" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Workout Plan</Text>

      {showPrevious ? (
        <>
          <Text style={styles.planName}>Previous Workout</Text>
          {previousExercises.length > 0 ? (
            <FlatList
              data={previousExercises}
              keyExtractor={(item) => item}
              renderItem={renderExerciseItem}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          ) : (
            <Text style={styles.noPlanText}>No previous workout found.</Text>
          )}
        </>
      ) : (
        <>
          <Text style={styles.planName}>Current Plan</Text>
          {currentExercises.length > 0 ? (
            <FlatList
              data={currentExercises}
              keyExtractor={(item) => item}
              renderItem={renderExerciseItem}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          ) : (
            <Text style={styles.noPlanText}>No current workout plan found.</Text>
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.showPreviousButton}
        onPress={() => setShowPrevious(!showPrevious)}
      >
        <Text style={styles.showPreviousText}>
          {showPrevious ? "Hide Previous Workout" : "Show Previous Workout"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1241",
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    marginTop: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A4E764",
    marginBottom: 10,
    marginTop: 20,
  },
  exerciseItem: {
    backgroundColor: "#181230",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
  },
  exerciseText: {
    fontSize: 16,
    color: "white",
  },
  noPlanText: {
    fontSize: 16,
    color: "gray",
    marginTop: 20,
    textAlign: "center",
  },
  showPreviousButton: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#A4E764",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
  },
  showPreviousText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});

export default MyWorkoutScreen;