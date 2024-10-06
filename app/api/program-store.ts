import { PULL, NORMAL_LEG, PAUSE_LEG, PUSH, NECK } from "@/constants/SampleWorkouts";
import { WorkoutPlan } from "@/interface";
import { truncTime, Period } from "@/util";

const PROGRAM = [[PUSH, NECK], [PULL, NECK], [NORMAL_LEG], [], [PUSH, NECK], [PULL, NECK], [PAUSE_LEG], [], []];
const START_DATE = new Date('2024-10-05T00:00:00.000');


export class ProgramStoreApi {

    static getWorkoutPlans(date: number): WorkoutPlan[] {
        const today = new Date(truncTime(date));
        const daysDelta = Math.floor((today.valueOf() - START_DATE.valueOf()) / Period.DAY);

        console.log(`[PROGRAM-STORE-API] Getting workouts for day delta ${daysDelta}`);
        
        if(daysDelta < 0){
            return PROGRAM[PROGRAM.length + (daysDelta % PROGRAM.length)];
        }

        return PROGRAM[daysDelta % PROGRAM.length];
    }
}

