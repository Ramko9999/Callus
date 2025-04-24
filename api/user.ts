import { Store } from "./store";

export type UserDetails = {
  name: string;
  bodyweight: number;
};

const USER_DETAILS_KEY = "user_details";
const HAS_LOADED_INITIAL_ROUTINES_KEY = "has_loaded_initial_routines";

async function getUserDetails() {
  const details = await Store.instance().readMetadata(USER_DETAILS_KEY);
  return details ? (JSON.parse(details) as UserDetails) : undefined;
}

async function upsertUserDetails(details: UserDetails) {
  await Store.instance().upsertMetadata(
    USER_DETAILS_KEY,
    JSON.stringify(details)
  );
}

async function hasLoadedInitialRoutines() {
  const hasLoaded = await Store.instance().readMetadata(HAS_LOADED_INITIAL_ROUTINES_KEY);
  return hasLoaded ? (JSON.parse(hasLoaded) as boolean) : false;
}

async function markInitialRoutinesLoaded() {
  await Store.instance().upsertMetadata(
    HAS_LOADED_INITIAL_ROUTINES_KEY,
    JSON.stringify(true)
  );
}


export const UserApi = {
  getUserDetails,
  upsertUserDetails,
  hasLoadedInitialRoutines,
  markInitialRoutinesLoaded,
};
