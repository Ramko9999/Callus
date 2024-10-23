import { useEffect, useState } from "react";

type Props = {
  startTimeMs: number;
  durationMs: number;
};

type Result = {
  isOver: boolean;
  remainingMs: number;
};

export function useTimer({ startTimeMs, durationMs }: Props): Result {
  const [remaining, setRemaining] = useState(
    startTimeMs + durationMs - Date.now()
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(startTimeMs + durationMs - Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [startTimeMs, durationMs]);

  return {
    isOver: remaining <= 0,
    remainingMs: remaining,
  };
}
