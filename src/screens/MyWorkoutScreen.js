import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Button,
  Alert,
} from "react-native";
import { auth, db } from "../firebase-fix";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const MyWorkoutScreen = () => {
  const [userId, setUserId] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workouts, setWorkouts] = useState({});
  const [note, setNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        setUserId(uid);
        await fetchData(uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (uid) => {
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      setSelectedExercises(data?.workoutPlan?.selectedExercises || []);
      setWorkouts(normalizeWorkouts(data?.myWorkouts || {}));
    } catch (error) {
      console.log("🔥 fetchData error:", error);
    }
  };

  const normalizeWorkouts = (raw) => {
    const normalized = {};
    for (const [date, value] of Object.entries(raw || {})) {
      if (Array.isArray(value)) {
        normalized[date] = value;
      } else if (typeof value === "object" && value !== null && value.exercises) {
        normalized[date] = [{ ...value, id: Date.now().toString() }];
      }
    }
    return normalized;
  };

  const saveWorkout = async () => {
    if (!userId) {
      Alert.alert("Error", "User not signed in.");
      return;
    }

    if (selectedExercises.length === 0 && note.trim() === "") {
      Alert.alert("Validation", "Please enter a note or select exercises.");
      return;
    }

    const dateKey = selectedDate.toISOString().split("T")[0];
    const planId = editId || Date.now().toString();

    const newEntry = {
      id: planId,
      note: note.trim(),
      exercises: selectedExercises,
      completed: false,
      timestamp: new Date().toISOString(),
    };

    const updatedForDate = [
      ...(workouts[dateKey] || []).filter((item) => item.id !== planId),
      newEntry,
    ];

    const updated = { ...workouts, [dateKey]: updatedForDate };

    try {
      await setDoc(doc(db, "users", userId), { myWorkouts: updated }, { merge: true });
      setWorkouts(updated);
      setModalVisible(false);
      setNote("");
      setEditId(null);
    } catch (err) {
      Alert.alert("Error", "Failed to save workout.");
      console.error(err);
    }
  };

  const deleteWorkout = async (dateKey, id) => {
    const filtered = (workouts[dateKey] || []).filter((item) => item.id !== id);
    const updated = { ...workouts, [dateKey]: filtered };
    await setDoc(doc(db, "users", userId), { myWorkouts: updated }, { merge: true });
    setWorkouts(updated);
  };

  const toggleCompleted = async (dateKey, id) => {
    const updated = {
      ...workouts,
      [dateKey]: (workouts[dateKey] || []).map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    };
    await setDoc(doc(db, "users", userId), { myWorkouts: updated }, { merge: true });
    setWorkouts(updated);
  };

  const getFilteredPlans = () => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    return Object.entries(workouts || {})
      .filter(([date]) => (showPast ? date < todayStr : date >= todayStr))
      .sort((a, b) => new Date(a[0]) - new Date(b[0]));
  };

  const renderWorkoutItem = ([date, entries]) =>
    Array.isArray(entries) &&
    entries.map((data) => (
      <View key={data.id} style={styles.card}>
        <Text style={styles.date}>📅 {date} {data.completed && "✅"}</Text>
        {data.exercises?.map((ex, i) => (
          <Text key={i} style={styles.exercise}>• {ex}</Text>
        ))}
        {data.note && (
          <Text style={styles.note}>📝 {data.note}</Text>
        )}
        <View style={styles.cardButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleCompleted(date, data.id)}>
            <Text style={styles.actionText}>{data.completed ? "Unmark" : "Complete"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => {
            setSelectedDate(new Date(date));
            setNote(data.note);
            setEditId(data.id);
            setModalVisible(true);
          }}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => deleteWorkout(date, data.id)}>
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Workout Plans</Text>

      <FlatList
        data={getFilteredPlans()}
        keyExtractor={([date]) => date}
        renderItem={({ item }) => renderWorkoutItem(item)}
        ListEmptyComponent={<Text style={styles.empty}>No workout plans yet. Tap + to create one!</Text>}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowPast(!showPast)}>
        <Text style={styles.toggleText}>{showPast ? "Hide Past" : "Show Past"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={async () => {
          // 🔄 Güncel veriyi almak için yeniden çek
          if (userId) {
            const ref = doc(db, "users", userId);
            const snap = await getDoc(ref);
            setSelectedExercises(snap.data()?.workoutPlan?.selectedExercises || []);
          }
          setModalVisible(true);
          setEditId(null);
          setNote("");
          setSelectedDate(new Date());
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalWrapper}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalInnerContainer}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>
                {editId ? "Edit Plan" : "New Workout Plan"}
              </Text>

              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>Date: {selectedDate.toDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(e, date) => {
                    if (date) setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                />
              )}

              <Text style={styles.label}>Exercises:</Text>
              {selectedExercises.length > 0 ? (
                selectedExercises.map((ex, i) => (
                  <Text key={i} style={styles.exercise}>• {ex}</Text>
                ))
              ) : (
                <Text style={styles.empty}>No exercises selected</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Write a note..."
                value={note}
                onChangeText={setNote}
                placeholderTextColor="#aaa"
                multiline
              />

              <Button title={editId ? "Update" : "Save"} onPress={saveWorkout} />
              <View style={{ height: 10 }} />
              <Button title="Cancel" color="gray" onPress={() => setModalVisible(false)} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#10072D", padding: 20 },
  header: { fontSize: 26, color: "white", fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  card: { backgroundColor: "#1F1245", padding: 16, borderRadius: 14, marginBottom: 14 },
  date: { color: "#A4E764", fontWeight: "bold", fontSize: 16 },
  exercise: { color: "#ccc", fontSize: 15 },
  note: { color: "#eee", marginTop: 8 },
  cardButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 12 },
  actionBtn: { padding: 10, backgroundColor: "#333", borderRadius: 8 },
  actionText: { color: "white" },
  addBtn: {
    position: "absolute",
    bottom: 90,
    right: 30,
    backgroundColor: "#A4E764",
    padding: 16,
    borderRadius: 30,
  },
  toggleBtn: {
    alignSelf: "center",
    backgroundColor: "#ffffff10",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 20,
  },
  toggleText: { color: "#A4E764", fontWeight: "bold" },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60 },
  modalWrapper: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 10 },
  modalInnerContainer: {
    backgroundColor: "#1A1241",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  input: { backgroundColor: "#2E225A", color: "white", padding: 12, borderRadius: 10, minHeight: 80, marginTop: 10 },
  label: { color: "#fff", marginTop: 10, fontWeight: "bold" },
  dateText: { color: "#A4E764", marginBottom: 10 },
});

export default MyWorkoutScreen;
