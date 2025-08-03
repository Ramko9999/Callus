import React, {
  useState,
  forwardRef,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { View, Text } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { commonSheetStyles, SheetProps, SheetX } from "./common";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { WheelPicker, WheelPickerRef } from "@/components/util/wheel-picker";

// todo: DRY this up with the onboarding dob
const WHEEL_ITEM_HEIGHT = 40;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function generateYears(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear - 100; year <= currentYear - 2; year++) {
    years.push(year.toString());
  }
  return years;
}

function generateDays(month: number, year: number): string[] {
  const daysInMonth = getDaysInMonth(month, year);
  return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
}

type DateOfBirth = {
  year: number;
  month: number;
  day: number;
};

function fromUnixMillisToDateParts(dobMillis: number): DateOfBirth {
  const date = new Date(dobMillis);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function toUnixMillis(dob: DateOfBirth) {
  return new Date(dob.year, dob.month - 1, dob.day).getTime();
}

const YEARS = generateYears();

const editDobStyles = StyleSheet.create({
  pickerContainer: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    marginTop: "3%",
    height: "60%",
  },
  buttonContainer: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    paddingHorizontal: "5%",
    paddingBottom: "6%",
    width: "100%",
  },
  labelStyle: {
    fontSize: 20,
    fontWeight: "600",
  },
  pickerWrapper: {
    flex: 1,
    alignItems: "center",
  },
  monthWrapper: {
    flex: 1.4,
    alignItems: "center",
  },
});

type EditDobSheetProps = SheetProps & {
  dob: number;
  onUpdate: (dob: number) => Promise<void>;
};

export const EditDobSheet = forwardRef<BottomSheet, EditDobSheetProps>(
  ({ show, hide, onHide, dob, onUpdate }, ref) => {
    const primaryAction = useThemeColoring("primaryAction");
    const [selectedDob, setSelectedDob] = useState<DateOfBirth>(() =>
      fromUnixMillisToDateParts(dob)
    );
    const monthPickerRef = useRef<WheelPickerRef>(null);
    const dayPickerRef = useRef<WheelPickerRef>(null);
    const yearPickerRef = useRef<WheelPickerRef>(null);

    // todo: fix this, it does not work when we go from
    useEffect(() => {
      if (show) {
        const { month, day, year } = fromUnixMillisToDateParts(dob);
        monthPickerRef.current?.setIndex(month - 1);
        dayPickerRef.current?.setIndex(day - 1);
        yearPickerRef.current?.setIndex(YEARS.indexOf(year.toString()));
        setSelectedDob({ month, day, year });
      }
    }, [show]);

    const days = useMemo(
      () => generateDays(selectedDob.month, selectedDob.year),
      [selectedDob.month, selectedDob.year]
    );
    const handleMonthSelect = useCallback((_: string, index: number) => {
      setSelectedDob((prev) => ({
        ...prev,
        month: index + 1,
      }));
    }, []);

    const handleDaySelect = useCallback((_: string, index: number) => {
      setSelectedDob((prev) => ({
        ...prev,
        day: index + 1,
      }));
    }, []);

    const handleYearSelect = useCallback((yearStr: string) => {
      setSelectedDob((prev) => ({
        ...prev,
        year: parseInt(yearStr),
      }));
    }, []);

    const handleUpdate = useCallback(() => {
      onUpdate(toUnixMillis(selectedDob)).then(() => {
        hide();
      });
    }, [onUpdate, selectedDob, hide]);

    const isDateUnchanged = toUnixMillis(selectedDob) === dob;

    return (
      <PopupBottomSheet show={show} onHide={onHide} ref={ref}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            Edit your date of birth
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>
        <View style={editDobStyles.pickerContainer}>
          <View style={editDobStyles.monthWrapper}>
            <WheelPicker
              ref={monthPickerRef}
              values={MONTHS}
              onSelect={handleMonthSelect}
              defaultIndex={selectedDob.month - 1}
              itemHeight={WHEEL_ITEM_HEIGHT}
              labelStyle={editDobStyles.labelStyle}
            />
          </View>
          <View style={editDobStyles.pickerWrapper}>
            <WheelPicker
              ref={dayPickerRef}
              values={days}
              onSelect={handleDaySelect}
              defaultIndex={selectedDob.day - 1}
              itemHeight={WHEEL_ITEM_HEIGHT}
              labelStyle={editDobStyles.labelStyle}
            />
          </View>
          <View style={editDobStyles.pickerWrapper}>
            <WheelPicker
              ref={yearPickerRef}
              values={YEARS}
              onSelect={handleYearSelect}
              defaultIndex={YEARS.indexOf(selectedDob.year.toString())}
              itemHeight={WHEEL_ITEM_HEIGHT}
              labelStyle={editDobStyles.labelStyle}
            />
          </View>
        </View>
        <View style={[editDobStyles.buttonContainer]}>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              {
                backgroundColor: primaryAction,
                opacity: isDateUnchanged ? 0.5 : 1,
              },
            ]}
            onPress={handleUpdate}
            disabled={isDateUnchanged}
          >
            <Text emphasized>Update</Text>
          </TouchableOpacity>
        </View>
      </PopupBottomSheet>
    );
  }
);
