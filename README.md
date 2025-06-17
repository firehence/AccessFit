# AccessFit 🏋️‍♀️📲  
Modernizing Gym Access and Motivation

AccessFit is a mobile app designed to enhance the gym experience by combining **QR code-based access**, **personalized workouts**, **progress tracking**, and **motivational features** in one seamless solution.

---

## 📱 Key Features

- 🔐 **Barcode-Based Gym Entry** – Secure and contactless access via QR codes  
- 📝 **Custom Workout Plans** – Create and manage routines tailored to your goals  
- 📊 **Progress Analytics** – Visualize your performance and achievements  
- 🏆 **Achievement Badges** – Stay motivated with milestones and rewards  
- 🔔 **Workout Reminders** – Get notified to keep your routine consistent  
- ⚙️ **Cross-Platform Support** – Works on both Android and iOS via React Native  
- ☁️ **Cloud-Backed** – Firebase-powered backend for authentication and storage  

---

## 🛠️ Tech Stack

- **Frontend**: React Native  
- **Backend**: Firebase (Auth, Firestore, FCM)  
- **Barcode Scanner**: Expo Barcode Scanner
- **Design**: Figma  
- **Testing**: Firebase Test Lab  

---

## 📐 Architecture

AccessFit uses a **3-layer architecture**:

1. **Presentation Layer** – React Native UI components  
2. **Application Layer** – Handles logic (e.g. validation, workout generation)  
3. **Data Access Layer** – Communicates with Firebase services (DB, Auth, FCM)

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/firehence/AccessFit.git
cd AccessFit

# 2. Install all dependencies
npm install

# 3. Install required Expo SDK libraries
npx expo install expo-barcode-scanner expo-linear-gradient expo-auth-session
npx expo install react-native-chart-kit @react-native-async-storage/async-storage
npx expo install expo-image-picker expo-secure-store expo-status-bar expo-sensors

# 4. Install Firebase and dependencies
npm install firebase

# 5. Create your Firebase config file (firebase-fix.js)
# Paste your own Firebase project's configuration

# 6. Start the app
npx expo start

```
## 📸 Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/b21bebc3-d86a-412b-a2de-94f1fb8768e5" width="300" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/04007c91-4131-47c8-bb1e-3ce474a5de58" width="300" />
  <img src="https://github.com/user-attachments/assets/4b48531a-3440-4340-8f3f-384379769d35" width="300" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/426a45dd-c22e-4644-b34f-99ffc937a6d5" width="300" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/96e8a1a3-116f-42bf-a93a-fd0cb2496d22" width="300" />
  <img src="https://github.com/user-attachments/assets/1f99f27b-af5e-42ba-bac0-98ee42fdd50a" width="300" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/d5222142-f7f2-4c7e-bc2d-f11d6a1e1052" width="300" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/dc717001-2e60-4f51-9949-781d95c9c876" width="300" />
  <img src="https://github.com/user-attachments/assets/1a90f9a8-3c50-416d-b729-7553e0c62298" width="300" />
</p>
---

## 👥 Team

| Name                | Student No  |
|-------------------- |-------------|
| Aytun Yüksek        | 20070001026 |
| Emirhan Kurşun      | 21070001038 |
| Fehmi Mert Tezdoğan | 21070001021 |

Project Advisor: **Prof. Dr. Mehmet Ufuk Çağlayan**  
Course: **COMP4910/4920 – Graduation Project**

---

## 📚 Academic Contribution

AccessFit is developed as part of a senior design project at **Yaşar University, Computer Engineering** department. It aims to provide a scalable, engaging, and technically robust fitness app with academic and real-world value.

---

## 🔮 Future Roadmap

- ✅ IoT support (wearables, smart devices)  
- ✅ Gamification (leaderboards, daily streaks)  
- ✅ AI-based plan generation  
- ✅ Offline workout logging  

---

## 📄 License

This repository is for academic and demonstration purposes. For commercial use, please contact the team.
