export function generateRandomId(prefix = "", length = 8) {
  return `${prefix}-${Math.random().toString(36).substring(2, length)}`;
}

export function timeout(duration: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export function getNumberSuffix(number: number) {
  switch (number) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

type Function = (...args: any[]) => void;

// todo: debounce won't work in a React component
export function debounce(f: Function, period: number): Function {
  let timer: any;
  const debounced = (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      f(...args);
    }, period);
  };
  return debounced;
}

export function popAndInsert(
  arr: any[],
  popIndex: number,
  insertIndex: number
) {
  const item = arr[popIndex];

  const removed = [
    ...arr.slice(0, popIndex),
    ...arr.slice(popIndex + 1, arr.length),
  ];
  return [
    ...removed.slice(0, insertIndex),
    item,
    ...removed.slice(insertIndex, removed.length),
  ];
}

export function batch(arr: any[], batchSize: number) {
  const newArr = [];
  let currentBatch = [];
  for (let i = 0; i < arr.length; i++) {
    currentBatch.push(arr[i]);
    if (i % batchSize === batchSize - 1 || i === arr.length - 1) {
      newArr.push([...currentBatch]);
      currentBatch = [];
    }
  }
  return newArr;
}

export function safeDiv(x: number, y: number) {
  if (y === 0) {
    return x > 0 ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
  }
  return x / y;
}

function minBy<T>(arr: T[], valueExtractor: (item: T) => number) {
  return arr.reduce((minimumItem, currentItem) => {
    if (valueExtractor(minimumItem) > valueExtractor(currentItem)) {
      return currentItem;
    }
    return minimumItem;
  });
}

function maxBy<T>(arr: T[], valueExtractor: (item: T) => number) {
  return arr.reduce((maximumItem, currentItem) => {
    if (valueExtractor(maximumItem) < valueExtractor(currentItem)) {
      return currentItem;
    }
    return maximumItem;
  });
}

function last<T>(arr: T[]) {
  return arr[arr.length - 1];
}

type Group<K, T> = {
  key: K;
  items: T[];
};

function groupBy<K, T>(arr: T[], keyExtractor: (item: T) => K): Group<K, T>[] {
  const map = new Map<K, T[]>();
  arr.forEach((item) => {
    const key = keyExtractor(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    (map.get(key) as T[]).push(item);
  });

  return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
}

function sortBy<K, T>(
  arr: T[],
  sortKeyExtractor: (item: T) => K,
  comparator?: (a: K, b: K) => number
) {
  const defaultSortComparator = (a: K, b: K) => {
    if (a <= b) {
      return -1;
    }
    return 1;
  };

  return [...arr].sort((a, b) =>
    (comparator || defaultSortComparator)(
      sortKeyExtractor(a),
      sortKeyExtractor(b)
    )
  );
}

function sumBy<T>(arr: T[], valueExtractor: (item: T) => number) {
  if (arr.length === 0) {
    return 0;
  }
  return arr.map(valueExtractor).reduce((total, current) => total + current);
}

export const ArrayUtils = { minBy, maxBy, groupBy, sortBy, sumBy, last };
