import { HeaderPage } from "@/components/util/header-page";
import { TouchableOpacity } from "react-native";
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
import { useUserDetails } from "@/components/user-details";
import { ExerciseInsightsProvider, useExerciseInsights } from "./context";
import { CloseButton, MoreButton } from "@/components/pages/common";
import { ExerciseStoreSelectors, useExercisesStore } from "@/components/store";
import { isExerciseCustom } from "@/api/exercise";
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import { Trash2 } from "lucide-react-native";
import { DeleteCustomExercise } from "@/components/sheets/delete-custom-exercise";
import { WorkoutApi } from "@/api/workout";
import { useLiveWorkout } from "../workout/live/context";
import { WorkoutActions } from "@/api/model/workout";

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

function TabBar({ state, descriptors, navigation }: any) {
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

const Tab = createMaterialTopTabNavigator();

type ExerciseInsightContentProps = {
  id: string;
};

function ExerciseInsightContent({ id }: ExerciseInsightContentProps) {
  const { userDetails } = useUserDetails();
  const navigation = useNavigation();
  const {
    completedExercises,
    selectedMetricIndex,
    setSelectedMetricIndex,
    isLoading,
  } = useExerciseInsights();
  const { saveWorkout, isInWorkout } = useLiveWorkout();
  const [showMetricSheet, setShowMetricSheet] = useState(false);
  const selectMetricSheetRef = useRef<BottomSheet>(null);
  const difficultyType = useExercisesStore(
    (state) => ExerciseStoreSelectors.getExercise(id, state)?.difficultyType
  );

  const name = useExercisesStore(
    (state) => ExerciseStoreSelectors.getExercise(id, state)?.name
  );
  const meta = useExercisesStore((state) =>
    ExerciseStoreSelectors.getExercise(id, state)
  );

  // Popover state for custom exercise actions
  const popoverRef = useRef<PopoverRef>(null);
  const moreButtonRef = useRef<any>(null);
  const popoverProgress = useSharedValue(0);
  const removeExercise = useExercisesStore((state) => state.removeExercise);
  const dangerAction = useThemeColoring("dangerAction");

  // Delete confirmation sheet state
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const deleteSheetRef = useRef<BottomSheet>(null);

  const metricConfigs = useMemo(
    () =>
      difficultyType
        ? MetricApi.getPossibleMetrics(
            difficultyType,
            userDetails?.bodyweight as number
          )
        : [],
    [difficultyType, userDetails?.bodyweight]
  );

  const selectedMetricConfig = metricConfigs[selectedMetricIndex];

  const handleMetricSelect = useCallback(
    (index: number) => {
      setSelectedMetricIndex(index);
      setShowMetricSheet(false);
    },
    [setSelectedMetricIndex]
  );

  const handleHide = useCallback(() => {
    selectMetricSheetRef.current?.close();
  }, []);

  const handleMorePress = useCallback(() => {
    if (moreButtonRef.current) {
      moreButtonRef.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          popoverRef.current?.open(pageX + width + 5, pageY + 20);
        }
      );
    }
  }, []);

  const handleDeleteExercise = useCallback(() => {
    popoverRef.current?.close();
    setShowDeleteSheet(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    deleteSheetRef.current?.close();
    WorkoutApi.deleteCustomExercise(id).then(() => {
      navigation.goBack();
      setTimeout(() => {
        removeExercise(id);
        saveWorkout((workout) =>
          workout ? WorkoutActions(workout).deleteByMetaId(id) : undefined
        );
      }, 300);
    });
  }, [id, removeExercise, navigation, saveWorkout]);

  const handleDeleteSheetHide = useCallback(() => {
    setShowDeleteSheet(false);
  }, []);

  if (!meta) {
    return null;
  }

  return (
    <View style={{ height: "100%" }}>
      <HeaderPage
        title={name}
        subtitle={
          isExerciseCustom(id) ? "Custom Exercise" : "Callus Library Exercise"
        }
        leftAction={<CloseButton onClick={navigation.goBack} />}
        rightAction={
          isExerciseCustom(id) ? (
            <MoreButton
              ref={moreButtonRef}
              onClick={handleMorePress}
              progress={popoverProgress}
            />
          ) : undefined
        }
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
                meta={meta}
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
                difficultyType={meta.difficultyType}
                name={meta.name}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Progress">
            {() => (
              <Progress
                name={meta.name}
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

      <Popover ref={popoverRef} progress={popoverProgress}>
        <PopoverItem
          label={<Text style={{ color: dangerAction }}>Delete Exercise</Text>}
          icon={<Trash2 size={20} color={dangerAction} />}
          onClick={handleDeleteExercise}
        />
      </Popover>

      <DeleteCustomExercise
        ref={deleteSheetRef}
        show={showDeleteSheet}
        hide={() => deleteSheetRef.current?.close()}
        onHide={handleDeleteSheetHide}
        onDelete={handleDeleteConfirm}
      />
    </View>
  );
}

type ExerciseInsightProps = {
  route: {
    params: {
      id: string;
    };
  };
};

export function ExerciseInsight({ route }: ExerciseInsightProps) {
  const { id } = route.params;

  return (
    <ExerciseInsightsProvider id={id}>
      <ExerciseInsightContent id={id} />
    </ExerciseInsightsProvider>
  );
}
