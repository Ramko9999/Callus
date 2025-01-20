import { WorkoutApi } from "@/api/workout";
import {
  generateEnclosingMonth,
  getNextMonth,
  getPreviousMonth,
} from "@/util/date";
import { ArrayUtils } from "@/util/misc";
import { useEffect, useState } from "react";

type UseWorkedOutDaysResult = {
  hasWorkedOut: (date: number) => boolean;
  refetch: (date: number, force?: boolean) => void;
};

type Range = {
  startDate: number;
  endDate: number;
};

function generateRange(date: number): Range {
  const startDate = generateEnclosingMonth(getPreviousMonth(date))[0][0];
  const endDate = ArrayUtils.last(
    ArrayUtils.last(generateEnclosingMonth(getNextMonth(date)))
  );
  return { startDate, endDate };
}

export function useWorkedOutDays(initialDate: number): UseWorkedOutDaysResult {
  const [range, setRange] = useState<Range>(generateRange(initialDate));
  const [workedOutDays, setWorkedOutDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    WorkoutApi.getWorkedOutDays(range.endDate, range.startDate).then(
      setWorkedOutDays
    );
  }, [range]);

  const refetch = (date: number, force?: boolean) => {
    const { startDate, endDate } = range;
    if (force || date < startDate || date > endDate) {
      setRange(generateRange(date));
    }
  };

  const hasWorkedOut = (date: number) => {
    return workedOutDays.has(date);
  };

  return { refetch, hasWorkedOut };
}
