import { NavigatorScreenParams } from "@react-navigation/native";

export type TabParamList = {
  history: undefined;
  profile: undefined;
  exercises: undefined;
  routines: undefined;
};

type ModalParamsList = {
  exerciseInsight: { name: string };
  settings: undefined;
  completedWorkout: { id: string };
  liveWorkout: {};
  routine: { id: string };
  congratulations: { id: string };
};

export type RootStackParamList = {
  splash: undefined;
  onboarding: undefined;
  trueOnboarding: undefined;
  signUp: undefined;
  tabs: NavigatorScreenParams<TabParamList> & { fromOnboarding?: boolean };
} & ModalParamsList;

export type BottomSheetParamList = {
  exercise: { name: string };
};