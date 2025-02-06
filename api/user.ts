import { Store } from "./store";

export type UserDetails = {
  name: string;
  bodyweight: number;
};

const USER_DETAILS_KEY = "user_details";

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

export const UserApi = {
  getUserDetails,
  upsertUserDetails,
};
