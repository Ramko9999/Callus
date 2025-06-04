import {
  SectionHeader,
  commonSettingsStyles,
  GoBackAction,
  SettingInput,
} from "./common";
import { HeaderPage } from "@/components/util/header-page";
import { useUserDetails } from "@/components/user-details";
import { ScrollView, StyleSheet, Keyboard } from "react-native";
import { useThemeColoring, Text, View } from "@/components/Themed";
import React, { useCallback, useRef, useState } from "react";
import { tintColor } from "@/util/color";
import { EditDobSheet } from "@/components/sheets/edit-dob";
import { EditWeightSheet } from "@/components/sheets/edit-weight";
import { EditHeightSheet } from "@/components/sheets/edit-height";
import { EditNameSheet } from "@/components/sheets/edit-name";
import BottomSheet from "@gorhom/bottom-sheet";
import { getNumberSuffix } from "@/util/misc";
import { UserApi } from "@/api/user";

function formatDOB(dob: number) {
  const date = new Date(dob);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    date
  );
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}. ${day}${getNumberSuffix(day)}, ${year}`;
}

function formatHeight(height: number) {
  const feet = Math.floor(height / 12);
  const inches = height % 12;
  return `${feet}' ${inches}"`;
}

const accountSettingsStyles = StyleSheet.create({
  group: {
    paddingHorizontal: "5%",
    borderRadius: 10,
  },
  header: {
    paddingHorizontal: "5%",
  },
});

export function AccountSettings({ navigation }: any) {
  const { userDetails, setUserDetails } = useUserDetails();
  const groupBgColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const dobSheetRef = useRef<BottomSheet>(null);
  const weightSheetRef = useRef<BottomSheet>(null);
  const heightSheetRef = useRef<BottomSheet>(null);
  const nameSheetRef = useRef<BottomSheet>(null);

  const name = userDetails?.name!;
  const weight = userDetails?.bodyweight!;
  const height = userDetails?.height!;
  const dob = userDetails?.dob!;
  const [showDobSheet, setShowDobSheet] = useState(false);
  const [showWeightSheet, setShowWeightSheet] = useState(false);
  const [showHeightSheet, setShowHeightSheet] = useState(false);
  const [showNameSheet, setShowNameSheet] = useState(false);

  const handleUpdateDob = useCallback(
    async (timestamp: number) => {
      const updatedDetails = { ...userDetails!, dob: timestamp };
      await UserApi.updateUserDetails(updatedDetails);
      setUserDetails(updatedDetails);
    },
    [userDetails, setUserDetails]
  );

  const handleUpdateWeight = useCallback(
    async (newWeight: number) => {
      const updatedDetails = { ...userDetails!, bodyweight: newWeight };
      await UserApi.updateUserDetails(updatedDetails);
      setUserDetails(updatedDetails);
    },
    [userDetails, setUserDetails]
  );

  const handleUpdateHeight = useCallback(
    async (newHeight: number) => {
      const updatedDetails = { ...userDetails!, height: newHeight };
      await UserApi.updateUserDetails(updatedDetails);
      setUserDetails(updatedDetails);
    },
    [userDetails, setUserDetails]
  );

  const handleUpdateName = useCallback(
    async (newName: string) => {
      const updatedDetails = { ...userDetails!, name: newName };
      await UserApi.updateUserDetails(updatedDetails);
      setUserDetails(updatedDetails);
    },
    [userDetails, setUserDetails]
  );

  const handleOnHideNameSheet = useCallback(() => {
    Keyboard.dismiss();
    setShowNameSheet(false);
  }, []);

  return (
    <>
      <HeaderPage
        title="Account"
        leftAction={<GoBackAction onClick={navigation.goBack} />}
      >
        <ScrollView contentContainerStyle={commonSettingsStyles.container}>
          <View style={accountSettingsStyles.header}>
            <SectionHeader title="Basic Info" />
          </View>
          <View
            style={[
              accountSettingsStyles.group,
              { backgroundColor: groupBgColor },
            ]}
          >
            <SettingInput
              label="Name"
              value={<Text light>{name}</Text>}
              includeBottomBorder
              onPress={() => setShowNameSheet(true)}
            />
            <SettingInput
              label="Weight"
              value={<Text light>{`${weight} lbs`}</Text>}
              includeBottomBorder
              onPress={() => setShowWeightSheet(true)}
            />
            <SettingInput
              label="Height"
              value={<Text light>{formatHeight(height)}</Text>}
              includeBottomBorder
              onPress={() => setShowHeightSheet(true)}
            />
            <SettingInput
              label="Date of Birth"
              value={<Text light>{formatDOB(dob)}</Text>}
              onPress={() => setShowDobSheet(true)}
            />
          </View>
          {/* Add more sections as needed */}
        </ScrollView>
      </HeaderPage>
      <EditDobSheet
        ref={dobSheetRef}
        show={showDobSheet}
        hide={() => dobSheetRef.current?.close()}
        onHide={() => setShowDobSheet(false)}
        dob={dob}
        onUpdate={handleUpdateDob}
      />
      <EditWeightSheet
        ref={weightSheetRef}
        show={showWeightSheet}
        hide={() => weightSheetRef.current?.close()}
        onHide={() => setShowWeightSheet(false)}
        weight={weight}
        onUpdate={handleUpdateWeight}
      />
      <EditHeightSheet
        ref={heightSheetRef}
        show={showHeightSheet}
        hide={() => heightSheetRef.current?.close()}
        onHide={() => setShowHeightSheet(false)}
        height={height}
        onUpdate={handleUpdateHeight}
      />
      <EditNameSheet
        ref={nameSheetRef}
        show={showNameSheet}
        hide={() => nameSheetRef.current?.close()}
        onHide={handleOnHideNameSheet}
        name={name}
        onUpdate={handleUpdateName}
      />
    </>
  );
}
