import { HeaderPage } from "@/components/util/header-page";
import { TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import { useThemeColoring, Text, View } from "@/components/Themed";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { useEffect, useState } from "react";
import { tintColor } from "@/util/color";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Overview } from "./overview";
import { History } from "./history";
import { CompletedExercise } from "@/interface";
import { WorkoutApi } from "@/api/workout";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Progress } from "./progress";
import { useExerciseInsight } from "./context";

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

export function BetterExerciseInsight({ route }: BetterExerciseInsightProps) {
  const { name } = route.params;
  const { setExerciseName, setSelectedMetricConfigIndex } =
    useExerciseInsight();
  const navigation = useNavigation();
  const [completions, setCompletions] = useState<CompletedExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setExerciseName(name);
    setSelectedMetricConfigIndex(0);
    WorkoutApi.getExerciseCompletions(name).then((data) => {
      setCompletions(data);
      setIsLoading(false);
    });
  }, [name]);

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
                completions={completions}
                isLoading={isLoading}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="History">
            {() => (
              <History
                completions={completions}
                isLoading={isLoading}
                name={name}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Progress">
            {() => (
              <Progress
                name={name}
                completions={completions}
                isLoading={isLoading}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </HeaderPage>
    </View>
  );
}
