import { RootStackParamList } from "@/layout/types";
import { StackScreenProps } from "@react-navigation/stack";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet, useWindowDimensions } from "react-native";
import { StyleUtils } from "@/util/styles";
import { useEffect, useState } from "react";
import { WorkoutApi } from "@/api/workout";
import { Workout } from "@/interface";
import { getWorkoutSummary } from "@/context/WorkoutContext";
import { DurationMetaIcon, RepsMetaIcon, WeightMetaIcon, Star } from "@/components/theme/icons";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import { useNavigation } from "@react-navigation/native";
import { contentStyles } from "@/components/modals/common/styles";
import { ModalWrapper } from "../common";
import { textTheme } from "@/constants/Themes";
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
    SharedValue,
    withDelay,
    LightSpeedInRight,
} from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";
import { getNumberSuffix } from "@/util/misc";
import { X } from "lucide-react-native";
import { Pressable } from "react-native";
import Svg, { Rect } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useUserDetails } from "@/components/user-details";

const CONGRATULATION_MESSAGES = [
    "Huge win, {USER_NAME}! Your {WORKOUT} is complete. That energy? Unreal.",
    "Well done, {USER_NAME} — you crushed your {WORKOUT}. That's power in motion.",
    "Boom! {USER_NAME}, the {WORKOUT} is locked in. You brought the fire today.",
    "That's what progress feels like. {USER_NAME}, your {WORKOUT} just raised the bar.",
    "Your {WORKOUT} is done, {USER_NAME}. That kind of focus is hard to miss.",
    "All set, all sweat. {USER_NAME}, your {WORKOUT} delivered.",
    "You showed up, {USER_NAME}, and your {WORKOUT} shows it. Let's go!"
];

function getRandomCongratulationMessage(username: string, nthWorkout: number) {
    const ordinalWorkout = `${nthWorkout}${getNumberSuffix(nthWorkout)} workout`;
    return CONGRATULATION_MESSAGES[Math.floor(Math.random() * CONGRATULATION_MESSAGES.length)].replace("{USER_NAME}", username).replace("{WORKOUT}", ordinalWorkout);
}

const CONFETTI_COUNT = 100;
const CONFETTI_ANIMATION_DURATION = 3000;
const EXERCISE_SUMMARY_ANIMATION_GAP = 50;

type ConfettiPieceProps = {
    progress: SharedValue<number>;
    color: string;
    originX: number;
    originY: number;
};

function ConfettiPiece({ progress, color, originX, originY }: ConfettiPieceProps) {
    // Generate random angle and speed for outward explosion
    const angle = Math.random() * Math.PI * 2; // Random angle in radians
    const speed = Math.random() * 5 + 2; // Random speed between 2 and 7
    const xSpeed = Math.cos(angle) * speed;
    const ySpeed = Math.sin(angle) * speed;
    const rotationSpeed = (Math.random() - 0.5) * 10;
    const scale = Math.random() * 0.5 + 0.5;

    const animatedStyle = useAnimatedStyle(() => {
        const currentProgress = progress.value;
        return {
            position: "absolute",
            opacity: 1 - currentProgress,
            transform: [
                { translateX: originX + xSpeed * currentProgress * 100 },
                { translateY: originY + ySpeed * currentProgress * 100 },
                { rotate: `${rotationSpeed * currentProgress * 360}deg` },
                { scale },
            ],
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            <Svg width={10} height={10}>
                <Rect
                    x={0}
                    y={0}
                    width={10}
                    height={10}
                    fill={color}
                    opacity={0.8}
                />
            </Svg>
        </Animated.View>
    );
}

const confettiAnimationStyles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: "none",
    },
});


type ConfettiAnimationProps = {
    originX: number;
    originY: number;
    shouldStart: boolean;
};


function ConfettiAnimation({ originX, originY, shouldStart }: ConfettiAnimationProps) {
    const primaryAction = useThemeColoring("primaryAction");
    const progress = useSharedValue(0);

    useEffect(() => {
        if (shouldStart) {
            progress.value = withTiming(1, {
                duration: CONFETTI_ANIMATION_DURATION,
                easing: Easing.linear,
            });
        }
    }, [shouldStart]);

    return (
        <View style={confettiAnimationStyles.container}>
            {Array.from({ length: CONFETTI_COUNT }).map((_, index) => (
                <ConfettiPiece
                    key={index}
                    progress={progress}
                    color={primaryAction}
                    originX={originX}
                    originY={originY}
                />
            ))}
        </View>
    );
}

const animatedDividerStyles = StyleSheet.create({
    container: {
        height: 2,
        opacity: 0.3,
    },
});

type AnimatedDividerProps = {
    endWidth: number;
    delay: number;
};

function AnimatedDivider({ endWidth, delay }: AnimatedDividerProps) {
    const width = useSharedValue(0);

    const dividerColor = useThemeColoring("lightText");

    useEffect(() => {
        width.value = withDelay(delay, withTiming(endWidth, {
            duration: 500,
            easing: Easing.out(Easing.ease),
        }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        width: width.value,
        backgroundColor: dividerColor,
    }));

    return (
        <Animated.View style={[animatedDividerStyles.container, animatedStyle]} />
    );
}

const congratulationsStyles = StyleSheet.create({
    header: {
        ...StyleUtils.flexColumn(),
        alignItems: "center",
        paddingHorizontal: "3%",
    },
    stars: {
        ...StyleUtils.flexRow(5),
        alignItems: "flex-end",
    },
    summaryContent: {
        ...StyleUtils.flexRow(5),
    },
    exercises: {
        paddingHorizontal: "3%",
        ...StyleUtils.flexColumn(10),
    },
    exercise: {
        ...StyleUtils.flexColumn(),
    },
    closeButton: {
        position: "absolute",
        top: 0,
        left: 0,
        padding: 8,
        zIndex: 1,
    },
    message: {
        paddingTop: "2%"
    },
    divider: {
        alignSelf: "center",
        marginVertical: "3%",
    },
});

type CongratulationsProps = StackScreenProps<
    RootStackParamList,
    "congratulations"
>;

type CongratulationsState = {
    workout: Workout;
    workoutsCompleted: number;
    shouldStartConfetti: boolean;
}

export function Congratulations({ route }: CongratulationsProps) {
    const { id } = route.params;
    const [state, setState] = useState<CongratulationsState>();
    const navigation = useNavigation();
    const { workout, workoutsCompleted, shouldStartConfetti } = state ?? {};
    const { width, height } = useWindowDimensions();
    const { userDetails } = useUserDetails();

    useEffect(() => {
        WorkoutApi.getWorkout(id).then((workout) => {
            WorkoutApi.getCompletedWorkoutsBefore(workout.startedAt).then((completed) => {
                setState({ workout, workoutsCompleted: completed, shouldStartConfetti: true });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            });
        });

    }, []);

    if (!workout || workoutsCompleted === undefined) {
        return null;
    }

    const { totalDuration, totalReps, totalWeightLifted } = getWorkoutSummary(workout);

    return (
        <ModalWrapper>
            <View style={contentStyles.container}>
                <ConfettiAnimation
                    originX={width / 2}
                    originY={height * 0.15}
                    shouldStart={shouldStartConfetti ?? false}
                />
                <Pressable
                    style={congratulationsStyles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <X size={24} color="gray" />
                </Pressable>
                <Animated.View
                    entering={FadeInDown.duration(300)}
                    style={congratulationsStyles.header}
                >
                    <View style={congratulationsStyles.stars}>
                        <Star size={textTheme.extraLarge.fontSize} />
                        <Star size={textTheme.stat.fontSize} />
                        <Star size={textTheme.extraLarge.fontSize} />
                    </View>
                    <Text extraLarge>{workout.name}</Text>
                    <View style={congratulationsStyles.summaryContent}>
                        <WeightMetaIcon weight={totalWeightLifted} />
                        <RepsMetaIcon reps={totalReps} />
                        <DurationMetaIcon durationInMillis={totalDuration} />
                    </View>
                    <View style={congratulationsStyles.message}>
                        <Text italic light>
                            {getRandomCongratulationMessage(userDetails!.name, workoutsCompleted + 1)}
                        </Text>
                    </View>
                </Animated.View>
                <View style={congratulationsStyles.divider}>
                    <AnimatedDivider endWidth={width * 0.96} delay={300} />
                </View>
                <ScrollView contentContainerStyle={congratulationsStyles.exercises}>
                    {workout.exercises.map((exercise, index) => (
                        <Animated.View
                            key={index}
                            entering={LightSpeedInRight
                                .delay(600 + (index + 1) * EXERCISE_SUMMARY_ANIMATION_GAP)
                                .duration(500)
                            }
                            style={congratulationsStyles.exercise}
                        >
                            <Text large>{exercise.name}</Text>
                            <Text neutral light>
                                {getHistoricalExerciseDescription(exercise)}
                            </Text>
                            {exercise.note && (
                                <Text neutral light italic numberOfLines={1}>
                                    {exercise.note}
                                </Text>
                            )}
                        </Animated.View>
                    ))}
                </ScrollView>
            </View>
        </ModalWrapper>
    );
}