type Function = (...args: any[]) => void;

export function debounce(f: Function, period: number): Function {
  let timer: any;
  const debounced = (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => f(...args), period);
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

export function clamp(value: number, maxBoundary: number, minBoundary: number){
  return Math.min(Math.max(value, minBoundary), maxBoundary);
}