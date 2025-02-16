import { StatusBar, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SignificantAction } from "@/components/theme/actions";
import {
  OnboardingFreeIcon,
  OnboardingProgressIcon,
  OnboardingWeightIcon,
} from "@/components/theme/icons";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import Animated, { FadeIn } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

const ICON_ONBOARDING_ICON_DIMENSION = 60;

const FEATURE_VISIBILITY_DELAY = 1000;

const FEATURES = [
  {
    title: "One-Tap Tracking",
    description: "Log your workouts with simple clicks",
    icon: <OnboardingWeightIcon />,
  },
  {
    title: "Visual Progress Insights",
    description: "Chart your gains across 6 metrics",
    icon: <OnboardingProgressIcon />,
  },
  {
    title: "100% Free, 100% Private",
    description: "All data stored locally on your device",
    icon: <OnboardingFreeIcon />,
  },
];

const onboardingIntroFeatureStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(25),
    alignItems: "center",
  },
  explanation: {
    ...StyleUtils.flexColumn(10),
  },
  icon: {
    height: ICON_ONBOARDING_ICON_DIMENSION,
    width: ICON_ONBOARDING_ICON_DIMENSION,
    borderRadius: ICON_ONBOARDING_ICON_DIMENSION / 2,
    ...StyleUtils.flexRowCenterAll(),
  },
});

type OnboardingIntroFeatureProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function OnboardingIntroFeature({
  icon,
  title,
  description,
}: OnboardingIntroFeatureProps) {
  return (
    <View style={onboardingIntroFeatureStyles.container}>
      <View
        style={[
          onboardingIntroFeatureStyles.icon,
          { backgroundColor: useThemeColoring("primaryViewBackground") },
        ]}
      >
        {icon}
      </View>
      <View style={onboardingIntroFeatureStyles.explanation}>
        <Text neutral style={{ fontWeight: 600 }}>
          {title}
        </Text>
        <Text neutral light>
          {description}
        </Text>
      </View>
    </View>
  );
}

const onboardingIntroStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    marginTop: "20%",
    paddingHorizontal: "10%",
  },
  title: {
    ...StyleUtils.flexColumn(5),
    alignItems: "center",
  },
  features: {
    ...StyleUtils.flexColumn(40),
    paddingTop: "10%",
  },
  cta: {
    marginTop: "70%",
  },
});

type OnboardingIntroProps = {
  onStart: () => void;
};

export function OnboardingIntro({ onStart }: OnboardingIntroProps) {
  return (
    <View style={onboardingIntroStyles.container}>
      <View style={onboardingIntroStyles.title}>
        <Text style={{ fontSize: 48, fontWeight: 600 }}>Callus</Text>
        <Text light large>
          Forge Your Fitness, Mark by Mark
        </Text>
      </View>
      <View style={onboardingIntroStyles.features}>
        {FEATURES.map((feature, index) => (
          <Animated.View
            key={feature.title}
            entering={FadeIn.delay(
              (index + 1) * FEATURE_VISIBILITY_DELAY
            ).duration(1000)}
          >
            <OnboardingIntroFeature {...feature} />
          </Animated.View>
        ))}
      </View>
      <Animated.View
        entering={FadeIn.delay(
          (FEATURES.length + 1) * FEATURE_VISIBILITY_DELAY
        ).duration(1000)}
        style={onboardingIntroStyles.cta}
      >
        <SignificantAction text="Get Started" onClick={onStart} />
      </Animated.View>
    </View>
  );
}

const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export function Onboarding() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View
      style={[
        onboardingStyles.container,
        {
          backgroundColor: useThemeColoring("appBackground"),
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar backgroundColor={useThemeColoring("appBackground")} />
      <OnboardingIntro
        onStart={() => {
          navigation.navigate("sign-up" as never);
        }}
      />
    </View>
  );
}
