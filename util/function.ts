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


export function clamp(value: number, maxBoundary: number, minBoundary: number){
  return Math.min(Math.max(value, minBoundary), maxBoundary);
}