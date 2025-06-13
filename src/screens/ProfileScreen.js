import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Alert,
  StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import {
  doc, getDoc, updateDoc, setDoc,
} from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase-fix';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    name: '', phone: '', email: '', gender: '',
    weight: '', height: '', dailyCalories: '', photoBase64: '',
  });

  const [bmi, setBmi] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      navigation.replace('SignIn');
      return;
    }

    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        name: '', phone: '', email: auth.currentUser.email,
        gender: '', weight: '', height: '', dailyCalories: '', photoBase64: '',
      });
    }

    const data = (await getDoc(userRef)).data();
    setUserData(data);
    setLoading(false);
  };

  const saveChanges = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, userData);
    calculateBMI(userData.weight, userData.height);
    Alert.alert('Saved', 'Changes updated.');
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64;
      setUserData((prev) => ({ ...prev, photoBase64: base64 }));
      const uid = auth.currentUser.uid;
      await updateDoc(doc(db, 'users', uid), { photoBase64: base64 });
    }
  };

  const calculateBMI = (w, h) => {
    const kg = parseFloat(w), cm = parseFloat(h);
    if (!kg || !cm || cm <= 0) return setBmi('');
    const bmi = kg / Math.pow(cm / 100, 2);
    const value = bmi.toFixed(1);
    const comment = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    setBmi(`${value} (${comment})`);
  };

  const changePassword = async () => {
    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      Alert.alert('Password changed');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    calculateBMI(userData.weight, userData.height);
  }, [userData.weight, userData.height]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} style={styles.centered}>
            <Image
              source={
                userData.photoBase64
                  ? { uri: `data:image/jpeg;base64,${userData.photoBase64}` }
                  : { uri: 'https://www.gravatar.com/avatar/?d=mp' }
              }
              style={styles.profileImage}
            />
            <Text style={styles.editText}>Tap to change photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputCard}>
          {[{ label: 'Full Name', key: 'name' },
            { label: 'Phone', key: 'phone' },
            { label: 'Email', key: 'email', disabled: true },
            { label: 'Gender', key: 'gender' },
            { label: 'Weight (kg)', key: 'weight' },
            { label: 'Height (cm)', key: 'height' },
            { label: 'Daily Calorie Goal (kcal)', key: 'dailyCalories' }].map((item) => (
              <View key={item.key}>
                <Text style={styles.label}>{item.label}</Text>
                <TextInput
                  style={styles.input}
                  editable={!item.disabled}
                  value={userData[item.key]}
                  onChangeText={(text) =>
                    setUserData({ ...userData, [item.key]: text })
                  }
                  keyboardType={
                    item.key.includes('weight') || item.key.includes('height')
                      ? 'numeric'
                      : 'default'
                  }
                />
              </View>
            ))}
          {bmi && <Text style={styles.bmi}>BMI: {bmi}</Text>}
          <TouchableOpacity style={styles.button} onPress={saveChanges}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <TextInput
            placeholder="Old Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            style={styles.input}
            onChangeText={setOldPassword}
          />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            style={styles.input}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#FFCC70' }]} onPress={changePassword}>
            <Text style={[styles.buttonText, { color: '#222' }]}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: 'rgba(58,27,120,0.9)',
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 6,
  },
  inputCard: {
    backgroundColor: 'rgba(58,27,120,0.85)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 5,
  },
  centered: { alignItems: 'center' },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 10,
  },
  editText: { color: '#ccc', fontSize: 14 },
  label: { color: '#ddd', marginTop: 12 },
  input: {
    backgroundColor: '#512E8C',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  bmi: { color: '#A4E764', marginTop: 12, fontWeight: 'bold' },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FFE266',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#A4E764',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
