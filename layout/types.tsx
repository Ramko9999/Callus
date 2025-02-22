import { NavigatorScreenParams } from "@react-navigation/native";

export type TabParamList = {
  history: undefined;
  profile: undefined;
  exercises: undefined;
  routines: undefined;
};

type ModalParamsList = {
    exerciseInsight: {name: string};
    completedWorkout: {id: string};
    routine: {id: string};
}

export type RootStackParamList = {
  splash: undefined;
  onboarding: undefined;
  signUp: undefined;
  tabs: NavigatorScreenParams<TabParamList>;
} & ModalParamsList;
