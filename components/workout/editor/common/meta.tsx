import {
  DurationMetaIconProps,
  RepsMetaIcon,
  WeightMetaIcon,
} from "@/components/theme/icons";
import { TextInput, View, Text } from "@/components/Themed";
import { getWorkoutSummary } from "@/context/WorkoutContext";
import { Workout, WorkoutMetadata } from "@/interface";
import { getLongDateDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { useCallback, useRef, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  TextInput as DefaultTextInput,
  Keyboard,
} from "react-native";

const workoutTitleMetaStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    paddingLeft: "3%",
  },
  summary: {
    ...StyleUtils.flexRow(10),
    paddingTop: "1%",
  },
});

type MetaEditor = {
  workout: Workout;
  onUpdateMeta: (meta: Partial<WorkoutMetadata>) => void;
  onDateClick: () => void;
};
export function MetaEditor({ workout, onUpdateMeta, onDateClick }: MetaEditor) {
  const { name, startedAt } = workout;
  const { totalWeightLifted, totalReps, totalDuration } =
    getWorkoutSummary(workout);

  const [workoutName, setWorkoutName] = useState(name);

  return (
    <View style={workoutTitleMetaStyles.container}>
      <TextInput
        extraLarge
        value={workoutName}
        onChangeText={(name) => {
          setWorkoutName(name);
        }}
        onEndEditing={() => {
          if (workoutName.trim().length > 0) {
            onUpdateMeta({ name: workoutName.trim() });
          } else {
            setWorkoutName(name);
          }
        }}
      />
      <TouchableOpacity onPress={onDateClick}>
        <Text neutral light>
          {getLongDateDisplay(startedAt, true)}
        </Text>
      </TouchableOpacity>
      <View style={workoutTitleMetaStyles.summary}>
        <WeightMetaIcon weight={totalWeightLifted} />
        <RepsMetaIcon reps={totalReps} />
        <DurationMetaIconProps durationInMillis={totalDuration} />
      </View>
    </View>
  );
}

const noteEditorStyles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: "3%",
    paddingBottom: "3%",
  },
});

type NoteEditorProps = {
  note?: string;
  onUpdateNote: (note?: string) => void;
};

export function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  const noteRef = useRef<DefaultTextInput>(null);
  const [currentNote, setCurrentNote] = useState(note);

  const onNoteFocus = useCallback(() => {
    if (noteRef.current) {
      noteRef.current.focus();
    }
  }, []);

  return (
    <TouchableOpacity onPress={onNoteFocus}>
      <View style={noteEditorStyles.container}>
        <TextInput
          ref={noteRef}
          neutral
          value={currentNote}
          onChangeText={setCurrentNote}
          placeholder="Note down any thoughts..."
          multiline
          onSubmitEditing={Keyboard.dismiss}
          submitBehavior="blurAndSubmit"
          onEndEditing={(e) => {
            if (currentNote && currentNote.trim().length > 0) {
              onUpdateNote(currentNote);
            } else {
              setCurrentNote(undefined);
              onUpdateNote(undefined);
            }
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
