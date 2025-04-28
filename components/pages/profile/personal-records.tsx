import { View, Text, useThemeColoring } from "@/components/Themed";
import { ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { StyleUtils } from "@/util/styles";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { convertHexToRGBA } from "@/util/color";
import { CompletedExercise } from "@/interface";
import { WorkoutApi } from "@/api/workout";
import { DifficultyType } from "@/interface";
import { NAME_TO_EXERCISE_META } from "@/api/exercise";
import {
    getOneRepMaxEstimate,
    getOneRepMaxEstimateForWeightedBodyWeight,
    getMaxRepsPerSet,
    getMaxDurationPerSet
} from "@/api/metric/util";
import { ArrayUtils } from "@/util/misc";
import { TextSkeleton } from "@/components/util/loading";

type PersonalRecordData = {
    exercise: string;
    performance: string;
    value: number;
    date: number;
    recordType: string;
};


function getPersonalRecordEvaluationFunc(difficultyType: DifficultyType) {
    if (difficultyType === DifficultyType.WEIGHT) {
        return getOneRepMaxEstimate;
    } else if (difficultyType === DifficultyType.BODYWEIGHT) {
        return getMaxRepsPerSet;
    } else if (difficultyType === DifficultyType.TIME) {
        return getMaxDurationPerSet;
    } else {
        return getOneRepMaxEstimateForWeightedBodyWeight;
    }
}

function formatPersonalRecordPerformance(difficultyType: DifficultyType, value: number) {
    if (difficultyType === DifficultyType.WEIGHT || difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) {
        return `${value} lbs`;
    } else if (difficultyType === DifficultyType.BODYWEIGHT) {
        return `${value} reps`;
    } else {
        return `${value}s`;
    }
}

function getPersonalRecordType(difficultyType: DifficultyType) {
    if (difficultyType === DifficultyType.WEIGHT || difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) {
        return "Estimated 1RM Max";
    } else if (difficultyType === DifficultyType.BODYWEIGHT) {
        return "Max Reps";
    } else {
        return "Max Duration";
    }
}

function getPersonalRecord(
    exerciseName: string,
    exercises: CompletedExercise[]
): PersonalRecordData | null {
    const exerciseMeta = NAME_TO_EXERCISE_META.get(exerciseName);
    if (!exerciseMeta) return null;

    const validExercises = exercises.filter(exercise => exercise.sets.length > 0);
    if (validExercises.length === 0) return null;

    const difficultyType = exerciseMeta.difficultyType;

    // Get the appropriate evaluation function based on difficulty type
    const evaluationFunc = getPersonalRecordEvaluationFunc(difficultyType);

    // Calculate performance value for each exercise
    const performances = validExercises.map(exercise => {
        const value = evaluationFunc(exercise);
        return {
            exercise,
            value
        };
    });

    // Find the best performance
    let bestPerformance = null;
    let maxValue = 0;

    for (const performance of performances) {
        if (performance.value > maxValue) {
            maxValue = performance.value;
            bestPerformance = performance;
        }
    }

    if (!bestPerformance || bestPerformance.value <= 0) return null;

    // Format the performance value based on difficulty type
    const formattedPerformance = formatPersonalRecordPerformance(
        difficultyType,
        Math.round(bestPerformance.value)
    );

    return {
        exercise: exerciseName,
        performance: formattedPerformance,
        value: bestPerformance.value,
        date: bestPerformance.exercise.workoutStartedAt,
        recordType: getPersonalRecordType(difficultyType)
    };
}

function getPersonalRecords(completedExercises: CompletedExercise[]): PersonalRecordData[] {
    const exerciseMap: Record<string, CompletedExercise[]> = {};

    completedExercises.forEach(exercise => {
        if (!exerciseMap[exercise.name]) {
            exerciseMap[exercise.name] = [];
        }
        exerciseMap[exercise.name].push(exercise);
    });

    const exerciseWithMeta = Object.entries(exerciseMap).map(([exerciseName, exercises]) => {
        const meta = NAME_TO_EXERCISE_META.get(exerciseName);
        return { exerciseName, exercises, meta };
    });

    const personalRecords = exerciseWithMeta
        .map(group => getPersonalRecord(group.exerciseName, group.exercises))
        .filter((record): record is PersonalRecordData => record !== null);

    // Sort by date (most recent first)
    return ArrayUtils.sortBy(personalRecords, record => -record.date).slice(0, 5);
}

const recordItemStyles = StyleSheet.create({
    container: {
        ...StyleUtils.flexColumn(),
        paddingHorizontal: 12,
        borderRadius: 12,
        marginRight: 10,
    },
    centerContent: {
        ...StyleUtils.flexColumn(2),
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        flex: 1,
    },
    recordType: {
        fontSize: 11,
        opacity: 0.8,
    },
    value: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        opacity: 0.9,
        textAlign: "center",
    },
});

type PersonalRecordProps = {
    record: PersonalRecordData;
};

function PersonalRecord({ record }: PersonalRecordProps) {
    const accentColor = useThemeColoring("primaryAction");
    const { width, height } = useWindowDimensions();


    return (
        <View
            style={[
                recordItemStyles.container,
                { width: width * 0.35, height: height * 0.12 },
                { backgroundColor: convertHexToRGBA(accentColor, 0.1) },
            ]}
        >
            <View style={recordItemStyles.centerContent}>
                <Text style={recordItemStyles.value}>
                    {record.performance}
                </Text>
                <Text style={recordItemStyles.name}>
                    {record.exercise}
                </Text>
                <Text style={recordItemStyles.recordType}>
                    {record.recordType}
                </Text>
            </View>
        </View>
    );
}

function PersonalRecordSkeleton() {
    const accentColor = useThemeColoring("primaryAction");
    const { width, height } = useWindowDimensions();

    return (
        <View
            style={[
                recordItemStyles.container,
                { width: width * 0.35, height: height * 0.12 },
                { backgroundColor: convertHexToRGBA(accentColor, 0.1) },
            ]}
        >
            <View style={recordItemStyles.centerContent}>
                <TextSkeleton
                    text="225 lbs"
                    style={recordItemStyles.value}
                />
                <TextSkeleton
                    text="Bench Press"
                    style={recordItemStyles.name}
                />
                <TextSkeleton
                    text="Estimated 1RM Max"
                    style={recordItemStyles.recordType}
                />
            </View>
        </View>
    );
}

const personalRecordsGridStyles = StyleSheet.create({
    container: {
        ...StyleUtils.flexColumn(15),
    },
    header: {
        ...StyleUtils.flexRow(),
        justifyContent: "space-between",
    },
    loadingContainer: {
        minHeight: 150,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyRecords: {
        textAlign: "center",
        opacity: 0.6,
        marginTop: 20,
    },
    scrollViewContent: {
        paddingLeft: 10,
        paddingRight: 20,
    },
    scrollView: {
        width: "100%",
    }
});

export function PersonalRecords() {
    const [records, setRecords] = useState<PersonalRecordData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            WorkoutApi.getAllExerciseCompletions(0, Date.now())
                .then(completions => {
                    const personalRecords = getPersonalRecords(completions);
                    setRecords(personalRecords);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, [])
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <ScrollView
                    style={personalRecordsGridStyles.scrollView}
                    contentContainerStyle={personalRecordsGridStyles.scrollViewContent}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    {/* Render multiple skeleton loaders */}
                    {Array.from({ length: 5 }).map((_, index) => (
                        <PersonalRecordSkeleton key={`skeleton-${index}`} />
                    ))}
                </ScrollView>
            );
        }

        if (records.length === 0) {
            return (
                <View style={personalRecordsGridStyles.loadingContainer}>
                    <Text style={personalRecordsGridStyles.emptyRecords}>
                        No personal records found yet.
                    </Text>
                </View>
            );
        }

        return (
            <ScrollView
                style={personalRecordsGridStyles.scrollView}
                contentContainerStyle={personalRecordsGridStyles.scrollViewContent}
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                {records.map((record, index) => (
                    <PersonalRecord
                        key={`record-${index}-${record.exercise}`}
                        record={record}
                    />
                ))}
            </ScrollView>
        );
    };

    return (
        <View style={personalRecordsGridStyles.container}>
            <View style={personalRecordsGridStyles.header}>
                <Text header emphasized>
                    Personal Records
                </Text>
            </View>

            {renderContent()}
        </View>
    );
}