import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-fix';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://your-privacy-policy-link.com');
  };

  const openAbout = () => {
    Alert.alert('About', 'This app helps you manage your fitness journey easily.');
  };

  const openRating = () => {
    Linking.openURL('https://your-playstore-link.com');
  };

  const goToBadges = () => {
    navigation.navigate('BadgeGallery');
  };

  return (
    <LinearGradient
      colors={["#2E0066", "#50238F", "#9A75DA"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={styles.label}>Enable Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity style={styles.item} onPress={goToBadges}>
              <Text style={styles.itemText}>🎖 My Badges</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={openAbout}>
              <Text style={styles.itemText}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={openPrivacyPolicy}>
              <Text style={styles.itemText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={openRating}>
              <Text style={styles.itemText}>Rate the App</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  content: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 16,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    color: 'white',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#FF4D4D',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;
