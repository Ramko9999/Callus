import { INITIAL_ROUTINES } from "./model/routine";
import { WorkoutApi } from "./workout";
import { Store } from "./store";

export type UserDetails = {
  name: string;
  bodyweight: number;
  height: number;
  dob: number; // epoch time
};

const USER_DETAILS_KEY = "user_details";
const HAS_LOADED_INITIAL_ROUTINES_KEY = "has_loaded_initial_routines";

async function hasLoadedInitialRoutines() {
  const hasLoaded = await Store.instance().readMetadata(
    HAS_LOADED_INITIAL_ROUTINES_KEY
  );
  return hasLoaded ? (JSON.parse(hasLoaded) as boolean) : false;
}

async function markInitialRoutinesLoaded() {
  await Store.instance().upsertMetadata(
    HAS_LOADED_INITIAL_ROUTINES_KEY,
    JSON.stringify(true)
  );
}

async function getUserDetails() {
  const details = await Store.instance().readMetadata(USER_DETAILS_KEY);
  return details ? (JSON.parse(details) as UserDetails) : undefined;
}

async function onboardUser(details: UserDetails) {
  await Store.instance().upsertMetadata(
    USER_DETAILS_KEY,
    JSON.stringify(details)
  );
  if (!(await hasLoadedInitialRoutines())) {
    await WorkoutApi.importRoutines(INITIAL_ROUTINES);
    await markInitialRoutinesLoaded();
  }
}

async function updateUserDetails(details: UserDetails) {
  await Store.instance().upsertMetadata(USER_DETAILS_KEY, JSON.stringify(details));
}

export const UserApi = {
  getUserDetails,
  onboardUser,
  updateUserDetails,
};
