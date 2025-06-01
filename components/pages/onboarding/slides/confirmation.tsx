import React, { useCallback, useEffect, useRef } from "react";
import { View, Text } from "@/components/Themed";
import { useWindowDimensions } from "react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { tintColor } from "@/util/color";
import { StyleUtils } from "@/util/styles";
import { commonSlideStyles, DateOfBirth, formatHeight } from "./common";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay,
  useAnimatedProps,
  runOnJS,
} from "react-native-reanimated";
import { Fingerprint } from "lucide-react-native";
import { Circle, Svg } from "react-native-svg";
import * as Haptics from "expo-haptics";

const SLIDE_UP_TEXT_DURATION = 600;
const SLIDE_UP_TEXT_DELAY = 400;

function getAge(dob: DateOfBirth): number {
  const today = new Date();
  const birthDate = new Date(dob.year, dob.month, dob.day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

type SlideUpTextProps = {
  duration?: number;
  delay?: number;
  children?: React.ReactNode;
};

function SlideUpText({
  duration = 600,
  delay = 0,
  children,
}: SlideUpTextProps) {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [duration, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: (1 - animationProgress.value) * 80 }],
      opacity: animationProgress.value,
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const commitFingerprintStyles = StyleSheet.create({
  container: {
    borderRadius: "50%",
    aspectRatio: 1,
    ...StyleUtils.flexColumnCenterAll(),
  },
});

type CommitFingerprintProps = {
  onPressIn?: () => void;
  onPressOut?: () => void;
  size?: number;
};

function CommitFingerprint({
  onPressIn,
  onPressOut,
  size,
}: CommitFingerprintProps) {
  const primaryText = useThemeColoring("primaryText");
  const primaryAction = useThemeColoring("primaryAction");
  return (
    <TouchableOpacity
      style={[
        commitFingerprintStyles.container,
        {
          shadowColor: primaryText,
          backgroundColor: primaryAction,
          width: size,
          height: size,
          borderRadius: "50%",
        },
      ]}
      activeOpacity={0.7}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Fingerprint
        color={primaryText}
        strokeWidth={2}
        size={size ? size * 0.62 : 40}
      />
    </TouchableOpacity>
  );
}

const commitStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumnCenterAll(),
    width: "100%",
  },
  description: {
    textAlign: "center",
    marginTop: "2%",
  },
  fingerprintCommit: {
    alignSelf: "center",
    justifyContent: "center",
    ...StyleUtils.flexRow(),
  },
  fingerprintContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    ...StyleUtils.flexRowCenterAll(),
  },
});

type CommitProps = {
  onCommit: () => void;
};

function Commit({ onCommit }: CommitProps) {
  const { width } = useWindowDimensions();
  const ringSize = width * 0.28; // 28% of screen width for the ring
  const fingerprintSize = width * 0.18; // 18% for the fingerprint button
  const ringStroke = ringSize * 0.09; // 9% of ring size
  const radius = (ringSize - ringStroke - 5) / 2;
  const circumference = 2 * Math.PI * radius;
  const committedRef = useRef(false);

  const primaryAction = useThemeColoring("primaryAction");
  const ringColor = tintColor(primaryAction, 0.5);

  const animationProgress = useSharedValue(0);
  const holdDuration = 3000;

  // Animate the ring as progress goes from 0 to 1
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animationProgress.value),
    opacity: animationProgress.value > 0 ? 1 : 0,
  }));

  const handleCommit = () => {
    committedRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCommit();
  };

  // Handle press in/out
  const handlePressIn = () => {
    animationProgress.value = withTiming(
      1,
      { duration: holdDuration, easing: Easing.linear },
      (finished) => {
        if (finished) {
          runOnJS(handleCommit)();
        }
      }
    );
  };

  const handlePressOut = () => {
    if (committedRef.current) return;
    animationProgress.value = withTiming(0, { duration: 200 });
  };

  return (
    <View style={commitStyles.container}>
      <View
        style={[
          {
            width: ringSize,
            height: ringSize,
          },
          commitStyles.fingerprintCommit,
        ]}
      >
        <Svg
          width={ringSize}
          height={ringSize}
          style={{
            transform: [{ rotate: "-90deg" }],
          }}
        >
          <AnimatedCircle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={ringStroke}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
          />
        </Svg>
        <View
          style={{
            ...commitStyles.fingerprintContainer,
            width: ringSize,
            height: ringSize,
          }}
        >
          <CommitFingerprint
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            size={fingerprintSize}
          />
        </View>
      </View>
      <Text light style={commitStyles.description}>
        Tap and hold to commit to being in the best shape of your life
      </Text>
    </View>
  );
}

const onboardingConfirmationStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexColumn(),
    width: "100%",
    paddingHorizontal: "5%",
    paddingTop: "8%",
    paddingBottom: "3%",
  },
  content: {
    flex: 1,
    ...StyleUtils.flexColumn(20),
    width: "100%",
  },
  buttonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: "5%",
    paddingVertical: "5%",
    borderTopWidth: 1,
    ...StyleUtils.flexColumn(20),
  },
  slideUpText: {
    fontSize: 24,
    fontWeight: "600",
  },
  point: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
  },
  commitContainer: {
    marginTop: "40%",
  },
});

type OnboardingConfirmationProps = {
  onSubmit: () => void;
  onBack: () => void;
  name: string;
  dob: DateOfBirth;
  weight: number;
  height: number;
};

export function OnboardingConfirmation({
  onSubmit,
  onBack,
  name,
  dob,
  weight,
  height,
}: OnboardingConfirmationProps) {
  const handleOnSubmit = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <>
      <View style={commonSlideStyles.container}>
        <View style={onboardingConfirmationStyles.content}>
          <SlideUpText delay={SLIDE_UP_TEXT_DELAY}>
            <Text emphasized style={onboardingConfirmationStyles.slideUpText}>
              {`${name}, you are ${getAge(dob)} years old.`}
            </Text>
          </SlideUpText>
          <SlideUpText delay={SLIDE_UP_TEXT_DELAY * 2 + SLIDE_UP_TEXT_DURATION}>
            <Text emphasized style={onboardingConfirmationStyles.slideUpText}>
              {`You weigh ${weight} lbs at ${formatHeight(height)}.`}
            </Text>
          </SlideUpText>
          <SlideUpText
            delay={SLIDE_UP_TEXT_DELAY * 3 + SLIDE_UP_TEXT_DURATION * 2}
          >
            <Text emphasized style={onboardingConfirmationStyles.slideUpText}>
              {`You want to get into the best shape of your life!`}
            </Text>
          </SlideUpText>
          <SlideUpText
            delay={SLIDE_UP_TEXT_DELAY * 4 + SLIDE_UP_TEXT_DURATION * 3}
          >
            <View style={onboardingConfirmationStyles.commitContainer}>
              <Commit onCommit={handleOnSubmit} />
            </View>
          </SlideUpText>
        </View>
      </View>
    </>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
