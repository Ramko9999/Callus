import { useRef } from "react";

type UseDebounceProps = {
  delay: number;
};

type Function<T> = (...args: T[]) => void;

type UseDebounceResult<T> = {
  invoke: (fn: Function<T>) => Function<T>;
};

// todo: fix the typing and use this function
export function useDebounce<T>({ delay }: UseDebounceProps): UseDebounceResult<T> {
  // @ts-ignore
  const timer = useRef<any>();

  const invoke = (fn: Function<T>) => {
    const debouncedFn: Function<T> = (...args) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        fn(...args);
      }, delay);
    };
    return debouncedFn;
  };

  return { invoke };
}
