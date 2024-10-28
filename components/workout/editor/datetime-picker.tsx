import RNDateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Text, View } from "@/components/Themed";
import { Platform, TouchableOpacity } from "react-native";
import { getDateDisplay, getTimeDisplay, usingDateOf, usingTimeOf } from "@/util";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  androidDateTimePicker: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
});

type DatetimePickerProps = {
  value: number;
  onUpdate: (value: number) => void;
};

type IOSDatetimePickerProps = DatetimePickerProps;

function IOSDatetimePicker({ value, onUpdate }: IOSDatetimePickerProps) {
  return (
    <RNDateTimePicker
      value={new Date(value)}
      mode={"datetime"}
      onChange={({ nativeEvent }) => onUpdate(nativeEvent.timestamp)}
    />
  );
}

type AndroidDatePartPickerProps = {
  value: number;
  onUpdate: (value: number) => void;
  mode: "date" | "time";
};

function AndroidDatePartPicker({
  value,
  onUpdate,
  mode,
}: AndroidDatePartPickerProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        DateTimePickerAndroid.open({
          mode,
          value: new Date(value),
          onChange: (event) => {
            if (event.type === "set") {
              onUpdate(event.nativeEvent.timestamp);
            }
          },
        });
      }}
    >
      <View>
        <Text _type="neutral">{mode == "date" ? getDateDisplay(value): getTimeDisplay(value)}</Text>
      </View>
    </TouchableOpacity>
  );
}

type AndroidDatetimePickerProps = DatetimePickerProps;

function AndroidDatetimePicker({
  value,
  onUpdate,
}: AndroidDatetimePickerProps) {
  return (
    <View style={styles.androidDateTimePicker}>
      <AndroidDatePartPicker
        value={value}
        mode="date"
        onUpdate={(updatedValue) => onUpdate(usingDateOf(value, updatedValue))}
      />
      <AndroidDatePartPicker
        value={value}
        mode="time"
        onUpdate={(updatedValue) => onUpdate(usingTimeOf(value, updatedValue))}
      />
    </View>
  );
}

export function DatetimePicker({ value, onUpdate }: DatetimePickerProps) {
  if (Platform.OS === "ios") {
    return <IOSDatetimePicker value={value} onUpdate={onUpdate} />;
  } else {
    return <AndroidDatetimePicker value={value} onUpdate={onUpdate} />;
  }
}
