import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = "53b12c6b24a0423c958a9c9799b8f1ab";

const SCOPES = [
  "user-read-playback-state",
  "user-read-currently-playing",
  "user-modify-playback-state",
];

const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export function useSpotifyAuth() {
  const [accessToken, setAccessToken] = useState(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      usePKCE: true,
      responseType: "code",
    },
    discovery
  );

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === "success" && response.params?.code) {
        try {
          const tokens = await AuthSession.exchangeCodeAsync(
            {
              clientId: CLIENT_ID,
              code: response.params.code,
              redirectUri,
              extraParams: {
                code_verifier: request.codeVerifier,
              },
            },
            discovery
          );

          console.log("✅ Spotify Access Token:", tokens.accessToken);
          setAccessToken(tokens.accessToken);
          await AsyncStorage.setItem("spotify_token", tokens.accessToken);
        } catch (e) {
          console.log("❌ Token exchange error:", e.message);
        }
      }
    };

    handleAuthResponse();
  }, [response]);

  useEffect(() => {
    const loadStoredToken = async () => {
      const saved = await AsyncStorage.getItem("spotify_token");
      if (saved) {
        console.log("📦 Loaded token from storage:", saved);
        setAccessToken(saved);
      }
    };
    loadStoredToken();
  }, []);

  return {
    accessToken,
    promptAsync,
    isReady: !!request,
  };
}
