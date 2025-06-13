import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
  Share,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';
import { auth, db } from '../firebase-fix';

const ProgressScreen = () => {
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

  const fetchProgressData = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const history = data.weightHistory || [];

        const map = new Map();
        history.forEach((entry) => map.set(entry.date, entry));
        const unique = Array.from(map.values()).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setWeightHistory(unique);
        setTargetWeight(data.targetWeight || '');
        setDailyCalories(data.dailyCalories || '');
        setNewTargetWeight(data.targetWeight || '');
        setNewDailyCalories(data.dailyCalories?.toString() || '');
        setGoalReached(data.goalReached || false);
        setGoalCount(data.goalCount || 0);
        setBadgeLevel(data.badgeLevel || null);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const determineBadge = (count) => {
    if (count >= 5) return 'gold';
    if (count >= 3) return 'silver';
    if (count >= 1) return 'bronze';
    return null;
  };

  const badgeEmoji = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
  };

  const addWeightEntry = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !currentWeight) return;

    const userRef = doc(db, 'users', uid);
    const date = new Date().toISOString().split('T')[0];

    const map = new Map();
    weightHistory.forEach((entry) => map.set(entry.date, entry));
    map.set(date, { date, weight: parseFloat(currentWeight) });

    const updated = Array.from(map.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    await updateDoc(userRef, {
      weightHistory: updated,
    });

    setWeightHistory(updated);
    setCurrentWeight('');
  };

  const updateTargets = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      targetWeight: newTargetWeight,
      dailyCalories: parseInt(newDailyCalories),
      goalReached: false,
    });

    setTargetWeight(newTargetWeight);
    setDailyCalories(parseInt(newDailyCalories));
    setGoalReached(false);
    Alert.alert('Updated', 'Goals updated successfully');
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
  }, []);

  useEffect(() => {
    if (weightHistory.length && targetWeight && dailyCalories) {
      const latestWeight = weightHistory[weightHistory.length - 1].weight;
      const difference = latestWeight - parseFloat(targetWeight);
      const estimatedDays = Math.ceil(Math.abs((difference * 7700) / dailyCalories));
      setEstimatedDaysLeft(estimatedDays);

      if (!goalReached && latestWeight <= parseFloat(targetWeight)) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const userRef = doc(db, 'users', uid);
        const newGoalCount = goalCount + 1;
        const newBadgeLevel = determineBadge(newGoalCount);

        updateDoc(userRef, {
          goalReached: true,
          goalCount: newGoalCount,
          badgeLevel: newBadgeLevel,
        });

        setGoalReached(true);
        setGoalCount(newGoalCount);
        setBadgeLevel(newBadgeLevel);
        Alert.alert("🎉 Goal Achieved!", `You've earned a ${newBadgeLevel} badge!`);
      }
    }
  }, [weightHistory, targetWeight, dailyCalories]);

  const filteredData = () => {
    const now = new Date();
    let daysBack = parseInt(filter);
    if (filter === 'all') return weightHistory;
    return weightHistory.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (now - entryDate) / (1000 * 60 * 60 * 24) <= daysBack;
    });
  };

  const chartData = {
    labels: filteredData().map((entry) => entry.date.slice(5)),
    datasets: [
      {
        data: filteredData().map((entry) => entry.weight),
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.spacer} />
      <Text style={styles.title}>Progress Overview</Text>

      <View style={styles.filterRow}>
        {['7', '30', 'all'].map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterButton,
              filter === key && styles.filterButtonActive,
            ]}
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
            backgroundColor: '#1e2a3a',
            backgroundGradientFrom: '#101729',
            backgroundGradientTo: '#101729',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 255, 200, ${opacity})`,
            labelColor: () => '#ccc',
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No weight data yet.</Text>
      )}

      {badgeLevel && (
        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>
            {badgeEmoji[badgeLevel]} You earned a {badgeLevel.toUpperCase()} badge!
          </Text>
        </View>
      )}

      <Text style={styles.label}>Today's Weight (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={currentWeight}
        onChangeText={setCurrentWeight}
        placeholder="Enter your weight"
        placeholderTextColor="#666"
      />
      <Button title="Add Weight Entry" onPress={addWeightEntry} />

      {targetWeight ? (
        <Text style={styles.infoText}>🎯 Target Weight: {targetWeight} kg</Text>
      ) : null}
      {dailyCalories ? (
        <Text style={styles.infoText}>🔥 Daily Calorie Goal: {dailyCalories} kcal</Text>
      ) : null}
      {estimatedDaysLeft !== null && (
        <Text style={styles.infoText}>
          ⏳ Estimated Days to Target: {estimatedDaysLeft} days
        </Text>
      )}

      <Text style={styles.sectionTitle}>Update Goals</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={newTargetWeight}
        onChangeText={setNewTargetWeight}
        placeholder="New target weight"
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={newDailyCalories}
        onChangeText={setNewDailyCalories}
        placeholder="New daily calories"
        placeholderTextColor="#666"
      />
      <Button title="Update Goals" onPress={updateTargets} />

      <View style={{ marginTop: 20 }}>
        <Button title="📤 Export Data as JSON" onPress={exportToJson} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#101729',
    padding: 15,
    flex: 1,
  },
  spacer: { height: 20 },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
    marginBottom: 25,
  },
  noData: {
    color: '#aaa',
    textAlign: 'center',
    marginVertical: 20,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1e2a3a',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  infoText: {
    color: '#00f2ff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    marginTop: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#2e2e2e',
  },
  filterButtonActive: {
    backgroundColor: '#00f2ff',
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  badgeBox: {
    backgroundColor: '#262d3d',
    borderColor: '#00f2ff',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginVertical: 15,
  },
  badgeText: {
    color: '#00f2ff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProgressScreen;
