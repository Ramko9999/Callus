import { useCallback, useEffect } from "react";
import { useThemeColoring, View } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { useState } from "react";
import { StyleUtils } from "@/util/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tintColor } from "@/util/color";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";
import { OnboardingName } from "./slides/name";
import { OnboardingWeight } from "./slides/weight";
import { OnboardingHeight } from "./slides/height";
import { OnboardingDob } from "./slides/dob";
import { DateOfBirth } from "./slides/common";
import { OnboardingConfirmation } from "./slides/confirmation";
import React from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "@/layout/types";
import { UserApi } from "@/api/user";
import { useUserDetails } from "@/components/user-details";

function toEpoch(date: DateOfBirth): number {
  return new Date(date.year, date.month - 1, date.day).getTime();
}

type IntroPaginationProps = {
  length: number;
  currentIndex: number;
};

const introPaginationDashStyles = StyleSheet.create({
  dash: {
    flex: 1,
    height: 6,
    overflow: "hidden",
  },
  activeDash: {
    position: "absolute",
    height: "100%",
  },
});

type IntroPaginationDashProps = {
  index: number;
  currentIndex: number;
  keepLeftBorderRadius: boolean;
  keepRightBorderRadius: boolean;
};

function IntroPaginationDash({
  index,
  currentIndex,
  keepLeftBorderRadius,
  keepRightBorderRadius,
}: IntroPaginationDashProps) {
  const backgroundColor = useThemeColoring("appBackground");
  const activeColor = useThemeColoring("primaryAction");
  const leftBorderRadius = useSharedValue(keepLeftBorderRadius ? 3 : 0);
  const rightBorderRadius = useSharedValue(keepRightBorderRadius ? 3 : 0);
  const inactiveColor = tintColor(backgroundColor, 0.1);
  const isActive = index < currentIndex;

  const fill = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    fill.value = isActive
      ? withSpring(1, { damping: 15 })
      : withSpring(0, { damping: 15 });
  }, [isActive]);

  useEffect(() => {
    leftBorderRadius.value = keepLeftBorderRadius ? 3 : 0;
    rightBorderRadius.value = keepRightBorderRadius ? 3 : 0;
  }, [keepLeftBorderRadius, keepRightBorderRadius]);

  const dashAnimatedStyle = useAnimatedStyle(() => ({
    borderTopLeftRadius: leftBorderRadius.value,
    borderBottomLeftRadius: leftBorderRadius.value,
    borderTopRightRadius: rightBorderRadius.value,
    borderBottomRightRadius: rightBorderRadius.value,
  }));

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
    backgroundColor: activeColor,
  }));

  return (
    <Animated.View
      style={[
        introPaginationDashStyles.dash,
        dashAnimatedStyle,
        { backgroundColor: inactiveColor },
      ]}
    >
      <Animated.View
        style={[introPaginationDashStyles.activeDash, animatedFillStyle]}
      />
    </Animated.View>
  );
}

const introPaginationStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(10),
    width: "100%",
    justifyContent: "space-between",
    paddingBottom: "4%",
  },
});

function IntroPagination({ length, currentIndex }: IntroPaginationProps) {
  const paginationFinishAnimation = useSharedValue(0);

  useEffect(() => {
    paginationFinishAnimation.value = withTiming(
      currentIndex >= length ? 0 : 1
    );
  }, [currentIndex, length]);

  const paginationParentStyle = useAnimatedStyle(() => {
    return {
      gap: paginationFinishAnimation.value * 10,
    };
  });

  return (
    <Animated.View
      style={[introPaginationStyles.container, paginationParentStyle]}
    >
      {Array.from({ length }).map((_, i) => (
        <IntroPaginationDash
          key={i}
          index={i}
          currentIndex={currentIndex}
          keepLeftBorderRadius={i === 0 || currentIndex < length}
          keepRightBorderRadius={i === length - 1 || currentIndex < length}
        />
      ))}
    </Animated.View>
  );
}

const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "8%",
    paddingBottom: "3%",
    paddingHorizontal: "5%",
    justifyContent: "flex-start",
  },
  flicker: {
    position: "absolute",
    top: 0,
    left: 0,
    ...StyleUtils.expansive(),
    backgroundColor: "blue",
  },
});

type OnboardingState = {
  name: string;
  weight: number;
  height: number;
  age: number;
  dob: DateOfBirth;
};

type OnboardingProps = StackScreenProps<RootStackParamList, "onboarding">;

export function Onboarding({ navigation }: OnboardingProps) {
  const [state, setState] = useState<OnboardingState>({
    name: "",
    weight: 150,
    height: 72,
    age: 0,
    dob: {
      month: 6,
      day: 1,
      year: 2004,
    },
  });
  const backgroundColor = useThemeColoring("appBackground");
  const primaryAction = useThemeColoring("primaryAction");
  const { setUserDetails } = useUserDetails();

  const [currentPage, setCurrentPage] = useState(0);
  const insets = useSafeAreaInsets();
  const flickerAnimation = useSharedValue(0);

  const finishOnboarding = useCallback(() => {
    const userData = {
      name: state.name,
      bodyweight: state.weight,
      height: state.height,
      dob: toEpoch(state.dob),
    };
    UserApi.onboardUser(userData)
      .then(() => {
        setUserDetails(userData);
        navigation.replace("tabs", {
          screen: "history",
          fromOnboarding: true,
        });
      })
      .catch((error) => {
        // handle this error please good sir
        console.error("Error upserting user details:", error);
      });
  }, [state.name, state.weight, state.height, state.dob]);

  const onSetName = useCallback((name: string) => {
    setState((s) => ({ ...s, name }));
  }, []);

  const onSetWeight = useCallback((weight: number) => {
    setState((s) => ({ ...s, weight }));
  }, []);

  const onSetHeight = useCallback((height: number) => {
    setState((s) => ({ ...s, height }));
  }, []);

  const onSetDob = useCallback((dobUpdate: Partial<DateOfBirth>) => {
    setState((s) => ({ ...s, dob: { ...s.dob, ...dobUpdate } }));
  }, []);

  const onBack = useCallback(() => {
    setCurrentPage((page) => page - 1);
  }, []);

  const onNext = useCallback(() => {
    setCurrentPage((page) => page + 1);
  }, []);

  const handleSubmit = useCallback(() => {
    flickerAnimation.value = withTiming(1, { duration: 1000 }, (finished) => {
      if (finished) {
        runOnJS(finishOnboarding)();
      }
    });
  }, [finishOnboarding]);

  const flickerAnimationStyle = useAnimatedStyle(() => {
    return {
      display: flickerAnimation.value === 0 ? "none" : "flex",
      backgroundColor: interpolateColor(
        flickerAnimation.value,
        [0, 1],
        ["transparent", primaryAction]
      ),
    };
  });

  return (
    <>
      <View
        style={[
          onboardingStyles.container,
          {
            backgroundColor,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <IntroPagination length={4} currentIndex={currentPage} />
        {currentPage === 0 ? (
          <OnboardingName
            onSetName={onSetName}
            onSubmit={onNext}
            name={state.name}
          />
        ) : currentPage === 1 ? (
          <OnboardingWeight
            onSubmit={onNext}
            onBack={onBack}
            onSetWeight={onSetWeight}
            weight={state.weight}
          />
        ) : currentPage === 2 ? (
          <OnboardingHeight
            onSubmit={onNext}
            onBack={onBack}
            onSetHeight={onSetHeight}
            height={state.height}
          />
        ) : currentPage === 3 ? (
          <OnboardingDob
            dob={state.dob}
            onSetDob={onSetDob}
            onSubmit={onNext}
            onBack={onBack}
          />
        ) : currentPage === 4 ? (
          <OnboardingConfirmation
            onSubmit={handleSubmit}
            onBack={onBack}
            name={state.name}
            dob={state.dob}
            weight={state.weight}
            height={state.height}
          />
        ) : null}
      </View>

      <Animated.View
        style={[onboardingStyles.flicker, flickerAnimationStyle]}
      />
    </>
  );
}
