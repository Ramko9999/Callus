import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { ViewStyle, StyleSheet, TouchableOpacity } from "react-native";

const tabsNavigationStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    borderRadius: 5,
  },
  tab: {
    flex: 1,
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "flex-start",
    borderRadius: 5,
    paddingVertical: "1%",
  },
});

type TabsNavigationProps = {
  selectedTab: string;
  tabs: string[];
  onSelect: (tab: string) => void;
  containerStyle?: ViewStyle;
};

export function TabsNavigation({
  selectedTab,
  tabs,
  onSelect,
  containerStyle,
}: TabsNavigationProps) {
  const selectedTabBackgroundColor = useThemeColoring("dynamicHeaderBorder");
  const normalTabBackgroundColor = useThemeColoring("primaryViewBackground");

  return (
    <View style={[tabsNavigationStyles.container, containerStyle]}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            tabsNavigationStyles.tab,
            {
              backgroundColor:
                selectedTab === tab
                  ? selectedTabBackgroundColor
                  : normalTabBackgroundColor,
            },
          ]}
          onPress={() => onSelect(tab)}
        >
          <Text light={selectedTab !== tab}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
