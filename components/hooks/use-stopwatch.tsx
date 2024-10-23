import { useEffect, useState } from "react";

type Props = {
  startTimeMs: number;
};

type Result = {
  elapsedMs: number;
};

export function useStopwatch({ startTimeMs }: Props): Result {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [startTimeMs]);

  return { elapsedMs: now - startTimeMs };
}
