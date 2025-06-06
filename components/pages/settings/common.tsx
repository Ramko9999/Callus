import { TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColoring, Text, View } from "@/components/Themed";
import { ChevronLeft } from "lucide-react-native";
import { StyleUtils } from "@/util/styles";
import React from "react";
import { convertHexToRGBA } from "@/util/color";

type GoBackActionProps = {
  onClick: () => void;
};

export function GoBackAction({ onClick }: GoBackActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <ChevronLeft color={useThemeColoring("primaryAction")} />
    </TouchableOpacity>
  );
}

export const commonSettingsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingHorizontal: "5%",
    paddingTop: "3%",
  },
  sectionHeader: {
    marginTop: "7%",
    marginBottom: "2%",
  },
  row: {
    ...StyleUtils.flexRow(12),
    alignItems: "center",
    paddingVertical: "4%",
  },
  rowIcon: {
    marginRight: 16,
  },
  chevron: {
    marginLeft: "auto",
  },
  value: {
    flex: 1,
    textAlign: "right",
    color: "#aaa",
  },
  input: {
    ...StyleUtils.flexRow(12),
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "4%",
  },
});

type SectionHeaderProps = { title: string };

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <Text small light style={commonSettingsStyles.sectionHeader}>
      {title}
    </Text>
  );
}

type SettingsRowProps = {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
};
export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightIcon,
  disabled,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View style={commonSettingsStyles.row}>
        {icon && <View style={commonSettingsStyles.rowIcon}>{icon}</View>}
        <Text>{label}</Text>
        {value && <Text>{value}</Text>}
        {rightIcon && (
          <View style={commonSettingsStyles.chevron}>{rightIcon}</View>
        )}
      </View>
    </TouchableOpacity>
  );
}

type SettingInputProps = {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  includeBottomBorder?: boolean;
  onPress?: () => void;
};

export function SettingInput({
  icon,
  label,
  value,
  includeBottomBorder,
  onPress,
}: SettingInputProps) {
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.12);

  return (
    <TouchableOpacity
      style={[
        commonSettingsStyles.input,
        {
          borderBottomWidth: includeBottomBorder ? 1 : 0,
          borderBottomColor: borderColor,
        },
      ]}
      onPress={onPress}
    >
      {icon && <View style={commonSettingsStyles.rowIcon}>{icon}</View>}
      <Text>{label}</Text>
      {value}
    </TouchableOpacity>
  );
}
