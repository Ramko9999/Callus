import { TextInput, View, Text } from "@/components/Themed";
import { Workout, WorkoutMetadata } from "@/interface";
import { getLongDateDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { useCallback, useRef, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  TextInput as DefaultTextInput,
  Keyboard
} from "react-native";
import { WorkoutSummary } from "../../view";

const workoutTitleMetaStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    paddingLeft: "3%",
  },
});

type MetaEditor = {
  workout: Workout;
  onUpdateMeta: (meta: Partial<WorkoutMetadata>) => void;
  onDateClick: () => void;
};
export function MetaEditor({ workout, onUpdateMeta, onDateClick }: MetaEditor) {
  const { name, startedAt } = workout;

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
      <WorkoutSummary workout={workout} />
    </View>
  );
}

const noteEditorStyles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: "3%",
    paddingBottom: "3%"
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
