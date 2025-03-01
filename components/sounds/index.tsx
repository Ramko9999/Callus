import { Audio } from "expo-av";
import { createContext, useContext, useEffect, useState } from "react";

const ASSETS = {
  positive_ring: require("@/assets/audio/positive-notification-ring.wav"),
  ready_up: require("@/assets/audio/ready-up.mp3"),
};

type SoundType = "positive_ring" | "ready_up";
type SoundRegistry = Map<SoundType, Audio.Sound>;

type SoundContext = {
  initialize: (registry: SoundRegistry) => void;
  play: (soundType: SoundType) => void;
  stop: (soundType: SoundType) => void;
};

export async function loadSoundAssets() {
  const loadSoundPromises = Object.entries(ASSETS).map(
    ([soundType, file]) =>
      new Promise<[SoundType, Audio.Sound]>((resolve) =>
        Audio.Sound.createAsync(file).then(({ sound }) =>
          resolve([soundType as SoundType, sound])
        )
      )
  );
  return new Map(await Promise.all(loadSoundPromises));
}

const context = createContext<SoundContext>({
  initialize: () => {},
  play: () => {},
  stop: () => {},
});

type SoundProviderProps = {
  children: React.ReactNode;
};

export function SoundProvider({ children }: SoundProviderProps) {
  const [registry, setRegistry] = useState<SoundRegistry>();

  const play = (type: SoundType) => {
    if (registry) {
      registry.get(type)?.replayAsync();
    }
  };

  const stop = (type: SoundType) => {
    if (registry) {
      registry.get(type)?.stopAsync();
    }
  };

  useEffect(() => {
    loadSoundAssets().then(setRegistry);
  }, []);

  return (
    <context.Provider value={{ play, stop, initialize: setRegistry }}>
      {children}
    </context.Provider>
  );
}

export function useSound() {
  return useContext(context);
}
