import { BottomSheet } from "@/components/util/popup/sheet";
import { View, Text } from "@/components/Themed";
import { getDateEditDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { DateTimePicker } from "../datetime-picker";

const timestampEditStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
  },
  display: {
    ...StyleUtils.flexRow(10),
  },
});

type TimestampEditProps = {
  label: string;
  fallback?: string;
  timestamp?: number;
  onUpdate: (timestamp: number) => void;
};

function TimestampEdit({
  label,
  timestamp,
  fallback,
  onUpdate,
}: TimestampEditProps) {
  const [isEditing, setIsEditing] = useState(false);

  const hasTimestamp = timestamp != undefined;

  return (
    <View style={timestampEditStyles.container}>
      <TouchableOpacity
        onPress={() => setIsEditing((_isEditing) => !_isEditing)}
        disabled={!hasTimestamp}
      >
        <View style={timestampEditStyles.display}>
          <Text neutral>{label}</Text>

          <Text neutral light>
            {hasTimestamp ? getDateEditDisplay(timestamp) : fallback}
          </Text>
        </View>
      </TouchableOpacity>
      {isEditing && hasTimestamp && (
        <DateTimePicker timestamp={timestamp} onUpdate={onUpdate} />
      )}
    </View>
  );
}

const timestampRangeEditStyles = StyleSheet.create({
  container: {
    paddingVertical: "6%",
    ...StyleUtils.flexColumn(10),
    alignItems: "center",
  },
  part: {
    ...StyleUtils.flexRow(10),
  },
  title: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
  },
});

type TimestampRange = {
  startedAt: number;
  endedAt?: number;
};

type TimestampRangeEdit = {
  show: boolean;
  hide: () => void;
  range: TimestampRange;
  onUpdate: (update: Partial<TimestampRange>) => void;
};

// todo: add guard rails such that the user cannot set a future time
// todo: handle when started at is after ended at due to a selection
export function TimestampRangeEdit({
  range,
  show,
  hide,
  onUpdate,
}: TimestampRangeEdit) {
  const { height } = useWindowDimensions();

  const { startedAt, endedAt } = range;

  return (
    <BottomSheet show={show} hide={hide} onBackdropPress={hide}>
      <View
        background
        style={[timestampRangeEditStyles.container, { height: height * 0.6 }]}
      >
        <View style={timestampRangeEditStyles.title}>
          <Text large>Adjust Start/End Time</Text>
        </View>
        <TimestampEdit
          timestamp={startedAt}
          label="Start Time"
          onUpdate={(startedAt) => onUpdate({ startedAt })}
        />
        <TimestampEdit
          timestamp={endedAt}
          label="End Time"
          onUpdate={(endedAt) => onUpdate({ endedAt })}
          fallback="Currently Active"
        />
      </View>
    </BottomSheet>
  );
}
