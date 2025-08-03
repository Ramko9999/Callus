import { useEffect, useRef, useState } from "react";

type RefreshProps = {
  period: number;
};

// used to trigger a re-render at an interval
export function useRefresh({ period }: RefreshProps) {
  // @ts-ignore
  const watch = useRef<any>();
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    watch.current = setInterval(() => {
      setCounter((counter) => counter + 1);
    }, period);
    return () => {
      if (watch.current) {
        clearInterval(watch.current);
      }
    };
  }, []);

  return { counter };
}
