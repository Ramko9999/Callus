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
import { Store, DiskStore } from "./disk-store";
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
const START_DATE = new Date("2024-10-05T00:00:00.000");

class ProgramStoreApi {
  store: Store<Program>;

  constructor(store: Store<Program>) {
    this.store = store;
  }

  static instance(): ProgramStoreApi {
    SINGLETON_STORE_API =
      SINGLETON_STORE_API ??
      new ProgramStoreApi(new DiskStore(STORAGE_NAMESPACE));
    return SINGLETON_STORE_API;
  }

  async skipDay(date: number) {
    const program = await this.store.read(
      "programs",
      PUSH_PULL_LEGS_PROGRAM
    );
    if (
      program.skippedDays.length === 0 ||
      program.skippedDays[program.skippedDays.length - 1] < date
    ) {
      program.skippedDays.push(date);
    }
    console.log(`[PROGRAM-STORE-API] Skipping another day: ${program.skippedDays.map(sd => new Date(sd))}`);
    await this.store.write("programs", program);
  }

  async getSkippedDays(): Promise<number[]> {
    const program = await this.store.read(
      "programs",
      PUSH_PULL_LEGS_PROGRAM
    );
    return program.skippedDays;
  }
}

export class ProgramApi {
  static async getWorkoutPlans(date: number): Promise<WorkoutPlan[]> {
    const daysToSkip = await ProgramStoreApi.instance().getSkippedDays();
    if (daysToSkip.includes(date)) {
      // todo: show as rest day for now, change this in the future
      return [];
    }

    const actualDate = new Date(truncTime(date));
    let daysDelta = Math.floor(
      (actualDate.valueOf() - START_DATE.valueOf()) / Period.DAY
    );

    console.log(
      `[PROGRAM-API] Getting workouts for day ${actualDate} with days to skip: [${daysToSkip.map(
        (d) => new Date(d)
      )}]`
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
    console.log(
      `[PROGRAM-STORE-API] Skipping workouts for day to do it the next day ${new Date(
        localDate
      )}`
    );
    await ProgramStoreApi.instance().skipDay(localDate);
  }
}
