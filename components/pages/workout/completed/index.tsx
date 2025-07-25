import { createStackNavigator } from "@react-navigation/stack";
import { CompletedWorkoutInitial } from "./initial";
import { CompletedWorkoutProvider } from "./context";
import { AddExercises } from "./add-exercises";
import { SetsEditor } from "./sets-editor";

const Stack = createStackNavigator();

export function CompletedWorkout({ route }: { route: any }) {
  return (
    <CompletedWorkoutProvider workoutId={route.params.id}>
      <Stack.Navigator
        initialRouteName="initial"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="initial" component={CompletedWorkoutInitial} />
        <Stack.Screen name="addExercises" component={AddExercises} />
        <Stack.Screen name="setsEditor" component={SetsEditor} />
      </Stack.Navigator>
    </CompletedWorkoutProvider>
  );
}
