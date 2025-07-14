import { Player } from "@/components/pages/workout/live/player";
import { EditExercises } from "./edit-exercises";
import { AddExercises } from "./add-exercises";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export function LiveWorkout() {
  return (
    <Stack.Navigator
      initialRouteName="player"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="player" component={Player} />
      <Stack.Screen name="editExercises" component={EditExercises} />
      <Stack.Screen name="addExercises" component={AddExercises} />
    </Stack.Navigator>
  );
}
