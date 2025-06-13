import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Dimensions,
  Alert,
  ScrollView,
  Share,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase-fix';

const ProgressOverview = () => {
  const [weightHistory, setWeightHistory] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [dailyCalories, setDailyCalories] = useState('');
  const [estimatedDaysLeft, setEstimatedDaysLeft] = useState(null);
  const [newTargetWeight, setNewTargetWeight] = useState('');
  const [newDailyCalories, setNewDailyCalories] = useState('');
  const [filter, setFilter] = useState('7');
  const [goalReached, setGoalReached] = useState(false);
  const [goalCount, setGoalCount] = useState(0);
  const [badgeLevel, setBadgeLevel] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const badgeEmoji = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
  };

  const fetchProgressData = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const map = new Map();
      (data.weightHistory || []).forEach((entry) => map.set(entry.date, entry));
      const unique = Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
      setWeightHistory(unique);
      setTargetWeight(data.targetWeight || '');
      setDailyCalories(data.dailyCalories || '');
      setNewTargetWeight(data.targetWeight || '');
      setNewDailyCalories(data.dailyCalories?.toString() || '');
      setGoalReached(data.goalReached || false);
      setGoalCount(data.goalCount || 0);
      setBadgeLevel(data.badgeLevel || null);
    }
  };

  const determineBadge = (count) => {
    if (count >= 5) return 'gold';
    if (count >= 3) return 'silver';
    if (count >= 1) return 'bronze';
    return null;
  };

  const addWeightEntry = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !currentWeight) return;
    const date = new Date().toISOString().split('T')[0];
    const map = new Map(weightHistory.map((entry) => [entry.date, entry]));
    map.set(date, { date, weight: parseFloat(currentWeight) });
    const updated = Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
    await updateDoc(doc(db, 'users', uid), { weightHistory: updated });
    setWeightHistory(updated);
    setCurrentWeight('');
  };

  const updateTargets = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid), {
      targetWeight: newTargetWeight,
      dailyCalories: parseInt(newDailyCalories),
      goalReached: false,
    });
    setTargetWeight(newTargetWeight);
    setDailyCalories(parseInt(newDailyCalories));
    setGoalReached(false);
    Alert.alert('✅ Updated', 'Goals updated successfully');
  };

  const exportToJson = async () => {
    try {
      const jsonContent = JSON.stringify({ weightHistory }, null, 2);
      await Share.share({ message: jsonContent });
    } catch (err) {
      console.error('Error exporting JSON:', err);
    }
  };

  useEffect(() => {
    fetchProgressData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (weightHistory.length && targetWeight && dailyCalories) {
      const latest = weightHistory[weightHistory.length - 1].weight;
      const diff = latest - parseFloat(targetWeight);
      const estDays = Math.ceil(Math.abs((diff * 7700) / dailyCalories));
      setEstimatedDaysLeft(estDays);
      if (!goalReached && latest <= parseFloat(targetWeight)) {
        const uid = auth.currentUser?.uid;
        const userRef = doc(db, 'users', uid);
        const newGoalCount = goalCount + 1;
        const newBadge = determineBadge(newGoalCount);
        updateDoc(userRef, {
          goalReached: true,
          goalCount: newGoalCount,
          badgeLevel: newBadge,
        });
        setGoalReached(true);
        setGoalCount(newGoalCount);
        setBadgeLevel(newBadge);
        Alert.alert("🎉 Goal Reached!", `You earned a ${newBadge} badge!`);
      }
    }
  }, [weightHistory, targetWeight, dailyCalories]);

  const filteredData = () => {
    const now = new Date();
    if (filter === 'all') return weightHistory;
    return weightHistory.filter((entry) => {
      return (now - new Date(entry.date)) / (1000 * 60 * 60 * 24) <= parseInt(filter);
    });
  };

  const chartData = {
    labels: filteredData().map((entry) => entry.date.slice(5)),
    datasets: [{ data: filteredData().map((entry) => entry.weight), strokeWidth: 2 }],
  };

  return (
    <LinearGradient colors={['#2E0066', '#50238F', '#9A75DA']} style={styles.container}>
      <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>📈 Progress Overview</Text>

        <View style={styles.filterRow}>
          {['7', '30', 'all'].map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterButton, filter === key && styles.activeButton]}
              onPress={() => setFilter(key)}
            >
              <Text style={styles.filterText}>
                {key === '7' ? '1W' : key === '30' ? '1M' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredData().length > 1 ? (
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 30}
            height={220}
            yAxisSuffix="kg"
            chartConfig={{
              backgroundGradientFrom: '#50238F',
              backgroundGradientTo: '#9A75DA',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: () => '#fff',
            }}
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>No weight data yet.</Text>
        )}

        {badgeLevel && (
          <View style={styles.badgeBox}>
            <Text style={styles.badgeText}>
              {badgeEmoji[badgeLevel]} You've earned a {badgeLevel.toUpperCase()} badge!
            </Text>
          </View>
        )}

        <Text style={styles.subHeader}>➕ Today's Weight</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={currentWeight}
          onChangeText={setCurrentWeight}
          placeholder="Enter today's weight"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.btn} onPress={addWeightEntry}>
          <Text style={styles.btnText}>Add Entry</Text>
        </TouchableOpacity>

        <View style={styles.goalInfo}>
          {targetWeight && <Text style={styles.infoText}>🎯 Target: {targetWeight} kg</Text>}
          {dailyCalories && <Text style={styles.infoText}>🔥 Calories/day: {dailyCalories}</Text>}
          {estimatedDaysLeft !== null && (
            <Text style={styles.infoText}>⏳ Est. Days Left: {estimatedDaysLeft}</Text>
          )}
        </View>

        <Text style={styles.subHeader}>🎯 Update Goals</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={newTargetWeight}
          onChangeText={setNewTargetWeight}
          placeholder="New target weight"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={newDailyCalories}
          onChangeText={setNewDailyCalories}
          placeholder="New daily calories"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.btn} onPress={updateTargets}>
          <Text style={styles.btnText}>Update Goals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: '#444' }]} onPress={exportToJson}>
          <Text style={styles.btnText}>📤 Export JSON</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, paddingBottom: 50 },
  header: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 30,
    textAlign: 'center',
  },
  subHeader: { color: '#fff', fontSize: 18, marginTop: 20, marginBottom: 8 },
  input: {
    backgroundColor: '#1e1b33',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#00f2ff',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  btnText: { color: '#000', textAlign: 'center', fontWeight: 'bold' },
  chart: { borderRadius: 10, marginVertical: 15 },
  noData: { textAlign: 'center', color: '#ccc', marginTop: 20 },
  goalInfo: { marginTop: 10, alignItems: 'center' },
  infoText: { color: '#fff', fontSize: 16 },
  badgeBox: {
    backgroundColor: '#382f5a',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    borderColor: '#00f2ff',
    borderWidth: 1,
  },
  badgeText: { color: '#00f2ff', fontSize: 18, fontWeight: 'bold' },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  filterButton: {
    backgroundColor: '#3d2e6c',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  activeButton: { backgroundColor: '#00f2ff' },
  filterText: { color: '#fff', fontWeight: 'bold' },
});

export default ProgressOverview;
