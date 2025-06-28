import { HeaderPage } from "@/components/util/header-page";
import { TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import { useThemeColoring, Text, View } from "@/components/Themed";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { tintColor } from "@/util/color";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Overview } from "./overview";
import { History } from "./history";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Progress } from "./progress";
import { SelectMetricSheet } from "@/components/sheets/select-metric";
import BottomSheet from "@gorhom/bottom-sheet";
import * as MetricApi from "@/api/metric";
import { getDifficultyType } from "@/api/exercise";
import { useUserDetails } from "@/components/user-details";
import { ExerciseInsightsProvider, useExerciseInsights } from "./context";

type CloseButtonProps = {
  onClick: () => void;
};

function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <X color={useThemeColoring("primaryAction")} />
    </TouchableOpacity>
  );
}

const insightTabsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    marginHorizontal: "3%",
    borderRadius: 5,
    position: "relative",
  },
  tab: {
    paddingHorizontal: "4%",
    paddingVertical: "2%",
    flex: 1,
    ...StyleUtils.flexRowCenterAll(),
  },
  indicator: {
    position: "absolute",
    left: "0%",
    height: "100%",
    borderRadius: 5,
  },
});

function TabBar({ state, descriptors, navigation, position }: any) {
  const selectedTabPosition = useSharedValue(0);
  const bgColor = tintColor(useThemeColoring("appBackground"), 0.05);
  const indicatorColor = tintColor(useThemeColoring("appBackground"), 0.1);

  useEffect(() => {
    selectedTabPosition.value = withSpring(
      (state.index / state.routes.length) * 100,
      {
        damping: 15,
        stiffness: 180,
        mass: 0.4,
      }
    );
  }, [state.index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${100 / state.routes.length}%`,
      left: `${selectedTabPosition.value}%`,
    };
  });

  return (
    <View style={[insightTabsStyles.container, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          insightTabsStyles.indicator,
          { backgroundColor: indicatorColor },
          animatedStyle,
        ]}
      />
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isSelected = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            style={insightTabsStyles.tab}
            onPress={() => navigation.navigate(route.name)}
          >
            <Text {...(isSelected ? {} : { light: true })}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

type BetterExerciseInsightProps = {
  route: {
    params: {
      name: string;
    };
  };
};

const Tab = createMaterialTopTabNavigator();

function BetterExerciseInsightContent({ name }: { name: string }) {
  const { userDetails } = useUserDetails();
  const navigation = useNavigation();
  const { completedExercises, selectedMetricIndex, setSelectedMetricIndex, isLoading } = useExerciseInsights();
  const [showMetricSheet, setShowMetricSheet] = useState(false);
  const selectMetricSheetRef = useRef<BottomSheet>(null);

  const type = useMemo(() => (name ? getDifficultyType(name) : null), [name]);

  const metricConfigs = useMemo(
    () =>
      type
        ? MetricApi.getPossibleMetrics(type, userDetails?.bodyweight as number)
        : [],
    [type, userDetails?.bodyweight]
  );

  const selectedMetricConfig = metricConfigs[selectedMetricIndex];

  const handleMetricSelect = useCallback((index: number) => {
    setSelectedMetricIndex(index);
    setShowMetricSheet(false);
  }, [setSelectedMetricIndex]);

  const handleHide = useCallback(() => {
    selectMetricSheetRef.current?.close();
  }, []);

  return (
    <View style={{ height: "100%" }}>
      <HeaderPage
        title={name}
        leftAction={<CloseButton onClick={navigation.goBack} />}
      >
        <Tab.Navigator
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{
            swipeEnabled: false,
          }}
        >
          <Tab.Screen name="Overview">
            {() => (
              <Overview
                name={name}
                completions={completedExercises ?? []}
                isLoading={isLoading}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="History">
            {() => (
              <History
                completions={completedExercises ?? []}
                isLoading={isLoading}
                name={name}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Progress">
            {() => (
              <Progress
                name={name}
                completions={completedExercises ?? []}
                isLoading={isLoading}
                selectedMetricConfig={selectedMetricConfig}
                showMetricSheet={() => setShowMetricSheet(true)}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </HeaderPage>
      <SelectMetricSheet
        ref={selectMetricSheetRef}
        show={showMetricSheet}
        hide={handleHide}
        onHide={() => setShowMetricSheet(false)}
        metricConfigs={metricConfigs}
        selectedMetricConfigIndex={selectedMetricIndex}
        onSelect={handleMetricSelect}
      />
    </View>
  );
}

export function BetterExerciseInsight({ route }: BetterExerciseInsightProps) {
  const { name } = route.params;

  return (
    <ExerciseInsightsProvider exerciseName={name}>
      <BetterExerciseInsightContent name={name} />
    </ExerciseInsightsProvider>
  );
}
