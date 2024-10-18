import {
  PULL,
  NORMAL_LEG,
  PAUSE_LEG,
  PUSH,
  NECK,
  PUSH_PULL_LEGS_PROGRAM,
} from "@/constants/SampleWorkouts";
import { Program, WorkoutPlan } from "@/interface";
import { truncTime, Period } from "@/util";
import { Store, DiskStore } from "./store";
import { STORAGE_NAMESPACE } from "@/constants";

let SINGLETON_STORE_API: ProgramStoreApi;

const PROGRAM = [
  [PUSH, NECK],
  [PULL, NECK],
  [NORMAL_LEG],
  [],
  [PUSH, NECK],
  [PULL, NECK],
  [PAUSE_LEG],
  [],
  [],
];
const START_DATE = new Date("2024-10-18T00:00:00.000");

class ProgramStoreApi {
  store: Store<Program>;

  constructor(store: Store<Program>) {
    this.store = store;
  }

  static instance(): ProgramStoreApi {
    SINGLETON_STORE_API =
      SINGLETON_STORE_API ??
      new ProgramStoreApi(
        new DiskStore(STORAGE_NAMESPACE, PUSH_PULL_LEGS_PROGRAM)
      );
    return SINGLETON_STORE_API;
  }

  async skipDay(date: number) {
    const program = await this.store.read("programs");
    if (
      program.skippedDays.length === 0 ||
      program.skippedDays[program.skippedDays.length - 1] < date
    ) {
      program.skippedDays.push(date);
    }
    await this.store.write("programs", program);
  }

  async getSkippedDays(): Promise<number[]> {
    const program = await this.store.read("programs");
    return program.skippedDays;
  }
}

export class ProgramApi {
  static async getWorkoutPlans(date: number): Promise<WorkoutPlan[]> {
    const daysToSkip = await ProgramStoreApi.instance().getSkippedDays();
    if (daysToSkip.includes(date) || date < START_DATE.valueOf()) {
      // todo: show as rest day for now, change this in the future, we need more information than just rest day here
      return [];
    }

    const actualDate = new Date(truncTime(date));
    let daysDelta = Math.floor(
      (actualDate.valueOf() - START_DATE.valueOf()) / Period.DAY
    );

    const skippedDayCount = daysToSkip.filter(
      (d) => d < actualDate.valueOf()
    ).length;
    daysDelta -= skippedDayCount;

    if (daysDelta < 0) {
      return PROGRAM[PROGRAM.length + (daysDelta % PROGRAM.length)];
    }

    return PROGRAM[daysDelta % PROGRAM.length];
  }

  static async skipDate(localDate: number) {
    await ProgramStoreApi.instance().skipDay(localDate);
  }
}
