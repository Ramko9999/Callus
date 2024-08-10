import { View, TextInput } from "../../Themed";
import { useState } from "react";


export function WorkoutEditor(){
    const [workoutName, setWorkoutName] = useState<string>("");

    return (<View>
        <TextInput style={{height: 50}} value={workoutName} onChangeText={setWorkoutName} placeholder="Workout Name"/>
    </View>)
}