import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  ActivityIndicator,
  AppState,
  Alert,
} from "react-native";
import { FontAwesome5, Entypo } from "@expo/vector-icons";
import { auth, db } from "../firebase-fix";
import { doc, setDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useSpotifyAuth } from "../auth/spotifyAuth";

const SpotifyWidget = ({ token }) => {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  const { promptAsync } = useSpotifyAuth();

  const reconnectSpotify = async () => {
    try {
      await promptAsync();
    } catch (e) {
      Alert.alert("Spotify", "Spotify reconnection failed.");
    }
  };

  const fetchRecentlyPlayed = async () => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        const item = json.items?.[0]?.track;
        if (item) {
          setTrack({
            name: item.name,
            artist: item.artists?.[0]?.name,
            image: item.album?.images?.[0]?.url,
            url: item.external_urls?.spotify,
            isPlaying: false,
            isRecent: true,
          });
        }
      }
    } catch (e) {
      console.log("🎵 Recent fetch error:", e.message);
      setTrack(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrack = async () => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setTokenValid(false);
        setTrack(null);
        return;
      }

      if (res.status === 204 || res.status === 202) {
        return fetchRecentlyPlayed();
      }

      if (res.ok) {
        const json = await res.json();
        if (!json?.item) {
          return fetchRecentlyPlayed();
        }

        setTrack({
          name: json.item.name,
          artist: json.item.artists?.[0]?.name,
          image: json.item.album?.images?.[0]?.url,
          url: json.item.external_urls?.spotify,
          isPlaying: json.is_playing,
          isRecent: false,
        });
        setTokenValid(true);
      }
    } catch (e) {
      console.log("🎵 Currently Playing fetch error:", e.message);
      setTrack(null);
    } finally {
      setLoading(false);
    }
  };

  const controlPlayback = async (action) => {
    try {
      const method = action === "play" || action === "pause" ? "PUT" : "POST";
      await fetch(`https://api.spotify.com/v1/me/player/${action}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTrack();
    } catch (e) {
      console.log("⚠️ Playback control error:", e.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      const uid = auth.currentUser?.uid;
      if (uid && token) {
        try {
          const ref = doc(db, "users", uid);
          await setDoc(ref, { spotifyAccessToken: token }, { merge: true });
        } catch (e) {
          console.log("⚠️ Token save error:", e.message);
        }
      }

      if (token) {
        setTokenValid(true);
        await fetchTrack();
        setTimeout(fetchTrack, 2000); // ek gecikme
      } else {
        setLoading(false);
      }
    };

    init();

    const interval = setInterval(() => {
      if (token) fetchTrack();
    }, 3000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && token) {
        fetchTrack();
      }
    });
    return () => sub.remove();
  }, [token]);

  if (loading) {
    return <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />;
  }

  if (!token || !tokenValid) {
    return (
      <TouchableOpacity style={styles.connectBox} onPress={reconnectSpotify}>
        <FontAwesome5 name="spotify" size={24} color="#fff" />
        <Text style={styles.connectText}>Not connected to Spotify. Tap to reconnect.</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(track?.url || "https://open.spotify.com")}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={["#1DB954", "#0f4023"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.widget}
      >
        {track?.isRecent && <Text style={styles.recentLabel}>Last played</Text>}
        <View style={styles.topRow}>
          {track?.image ? (
            <Image source={{ uri: track.image }} style={styles.albumArt} />
          ) : (
            <View style={[styles.albumArt, { backgroundColor: "#444" }]} />
          )}
          <View style={styles.trackText}>
            <Text style={styles.song} numberOfLines={1}>
              {track?.name || "No track playing"}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {track?.artist || "Spotify Connected"}
            </Text>
          </View>
          <FontAwesome5 name="spotify" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => controlPlayback("previous")}>
            <Entypo name="controller-jump-to-start" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => controlPlayback(track?.isPlaying ? "pause" : "play")}>
            <Entypo
              name={track?.isPlaying ? "controller-paus" : "controller-play"}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => controlPlayback("next")}>
            <Entypo name="controller-next" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  connectBox: {
    marginTop: 20,
    backgroundColor: "#2E2E2E",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  connectText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    flexWrap: "wrap",
  },
  widget: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  recentLabel: {
    color: "#eee",
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  albumArt: {
    width: 52,
    height: 52,
    borderRadius: 6,
  },
  trackText: {
    marginLeft: 12,
    flex: 1,
  },
  song: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  artist: {
    color: "#ccc",
    fontSize: 13,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
  },
});

export default SpotifyWidget;
