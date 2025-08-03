import { Audio, InterruptionModeAndroid } from "expo-av";
import { createContext, useContext, useEffect, useRef } from "react";

const ASSETS = {
  positive_ring: require("@/assets/audio/positive-notification-ring.wav"),
  ready_up: require("@/assets/audio/ready-up.mp3"),
};

type SoundType = "positive_ring" | "ready_up";

type SoundContext = {
  play: (soundType: SoundType) => void;
  stop: (soundType: SoundType) => void;
};

const context = createContext<SoundContext>({
  play: () => {},
  stop: () => {},
});

type SoundProviderProps = {
  children: React.ReactNode;
};

export function SoundProvider({ children }: SoundProviderProps) {
  const activeSoundsRef = useRef<Partial<Record<SoundType, Audio.Sound>>>({});

  const play = async (type: SoundType) => {
    const startTime = Date.now();
    const { sound } = await Audio.Sound.createAsync(ASSETS[type]);
    const endTime = Date.now();
    console.log(`Sound creation: ${type} took ${endTime - startTime}ms`);
    
    activeSoundsRef.current[type] = sound;
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (
        status.isLoaded &&
        !status.isPlaying &&
        status.positionMillis === status.durationMillis
      ) {
        sound.unloadAsync();
        if (activeSoundsRef.current[type]) {
          delete activeSoundsRef.current[type];
        }
      }
    });
  };

  const stop = async (type: SoundType) => {
    const sound = activeSoundsRef.current[type];
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      delete activeSoundsRef.current[type];
    }
  };

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
    });
  }, []);

  return <context.Provider value={{ play, stop }}>{children}</context.Provider>;
}

export function useSound() {
  return useContext(context);
}
