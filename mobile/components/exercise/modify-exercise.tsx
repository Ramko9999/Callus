import { Text, View, useThemeColoring } from "@/components/Themed";
import {
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StyleUtils } from "@/util/styles";
import {
  Image as ImageIcon,
  Plus,
  X,
  ChevronDown,
  Check,
} from "lucide-react-native";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { DifficultyType } from "@/interface";
import {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { TextInput } from "@/components/Themed";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  LinearTransition,
  FadeIn,
} from "react-native-reanimated";
import { MuscleDistinction } from "@/components/heatmap";
import {
  getExerciseTypeDisplayInfo,
  getExerciseTypeExplanation,
} from "@/api/exercise";
import { SheetWarning } from "@/components/sheets/common";
import { HeaderPage } from "@/components/util/header-page";
import { BackButton, CloseButton } from "@/components/pages/common";
import { MusclePickerSheet } from "@/components/sheets/muscle-picker";
import { SetExerciseTypeSheet } from "@/components/sheets/set-exercise-type";
import { ExerciseMeta } from "@/interface";
import { getCustomExerciseUri } from "@/api/store/fs";
import BottomSheet from "@gorhom/bottom-sheet";
import { useExercisesStore } from "@/components/store";
import {
  createCustomExercise,
  toExerciseMeta,
} from "@/api/model/custom-exercise";
import { WorkoutApi } from "@/api/workout";

type MusclePickerState = {
  mode: "primary" | "secondary";
  show: boolean;
};

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const basicInformationStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
  },
  header: {
    paddingHorizontal: "5%",
  },
  headerText: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  group: {
    paddingHorizontal: "5%",
    borderRadius: 10,
  },
  input: {
    ...StyleUtils.flexRow(12),
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Platform.OS === "ios" ? "4%" : "2%",
  },
  value: {
    flex: 1,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  errorMessage: {
    paddingHorizontal: "5%",
  },
});

export type BasicInformationRef = {
  showError: (message: string) => void;
  hideError: () => void;
};

type BasicInformationProps = {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
};

export const BasicInformation = forwardRef<
  BasicInformationRef,
  BasicInformationProps
>(({ name, description, onNameChange, onDescriptionChange }, ref) => {
  const groupBgColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const placeholderColor = useThemeColoring("lightText");
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.12);
  const errorColor = useThemeColoring("dangerAction");

  const shakeAnimation = useSharedValue(0);

  const [errorMessage, setErrorMessage] = useState("");

  useImperativeHandle(ref, () => ({
    showError: (message: string) => {
      setErrorMessage(message);
      shakeAnimation.value = 10;
      shakeAnimation.value = withSpring(0, { damping: 8, stiffness: 500 });
    },
    hideError: () => {
      setErrorMessage("");
    },
  }));

  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: shakeAnimation.value,
        },
      ],
    };
  });

  return (
    <Animated.View style={basicInformationStyles.container}>
      <View style={basicInformationStyles.header}>
        <Text small light style={basicInformationStyles.headerText}>
          Basic Information
        </Text>
      </View>

      {errorMessage && (
        <Animated.View
          layout={LinearTransition.springify()}
          entering={FadeIn}
          style={basicInformationStyles.errorMessage}
        >
          <Text small style={{ color: errorColor }}>
            {errorMessage}
          </Text>
        </Animated.View>
      )}

      <View
        style={[
          basicInformationStyles.group,
          { backgroundColor: groupBgColor },
        ]}
      >
        <Animated.View
          style={[
            basicInformationStyles.input,
            basicInformationStyles.borderBottom,
            { borderBottomColor: borderColor },
            animatedInputStyle,
          ]}
        >
          <TextInput
            style={basicInformationStyles.value}
            value={name}
            onChangeText={onNameChange}
            placeholder="Name"
            placeholderTextColor={errorMessage ? errorColor : placeholderColor}
          />
        </Animated.View>
        <View style={basicInformationStyles.input}>
          <TextInput
            style={basicInformationStyles.value}
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="Description"
            placeholderTextColor={placeholderColor}
            multiline
          />
        </View>
      </View>
    </Animated.View>
  );
});

const exerciseTypeStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
  },
  header: {
    paddingHorizontal: "5%",
  },
  headerText: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    ...StyleUtils.flexRow(12),
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "4%",
    paddingHorizontal: "5%",
    borderRadius: 10,
  },
  label: {
    flex: 1,
  },
  value: {
    ...StyleUtils.flexColumn(5),
    flex: 0.9,
  },
});

type ExerciseTypeProps = {
  exerciseType: DifficultyType;
  onExerciseTypePress: () => void;
  isEditable?: boolean;
};

export function ExerciseType({
  exerciseType,
  onExerciseTypePress,
  isEditable = true,
}: ExerciseTypeProps) {
  const groupBgColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const lightText = useThemeColoring("lightText");

  return (
    <View style={exerciseTypeStyles.container}>
      <View style={exerciseTypeStyles.header}>
        <Text small light style={exerciseTypeStyles.headerText}>
          Exercise Type
        </Text>
      </View>
      {!isEditable && (
        <SheetWarning text="Exercise type cannot be edited as it would require changing all sets performed" />
      )}

      <TouchableOpacity
        style={[exerciseTypeStyles.input, { backgroundColor: groupBgColor }]}
        onPress={isEditable ? onExerciseTypePress : undefined}
        disabled={!isEditable}
      >
        <View style={exerciseTypeStyles.value}>
          <Text>{getExerciseTypeDisplayInfo(exerciseType).title}</Text>
          <Text small light>
            {getExerciseTypeExplanation(exerciseType)}
          </Text>
        </View>
        {isEditable && <ChevronDown size={20} color={lightText} />}
      </TouchableOpacity>
    </View>
  );
}

const imageSelectionStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imageContainer: {
    borderRadius: 10,
    padding: "5%",
    ...StyleUtils.flexRowCenterAll(),
  },
  subtext: {
    marginTop: "1%",
    textAlign: "center",
  },
  image: {
    aspectRatio: 1,
    borderRadius: 10,
  },
  clearButton: {
    position: "absolute",
    top: 5,
    right: 5,
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.6)",
    ...StyleUtils.flexRowCenterAll(),
    padding: "1%",
    zIndex: 1,
  },
});

type ImageSelectionProps = {
  onImageSelected?: (uri: string) => void;
  initialImageUri?: string;
};

export function ImageSelection({
  onImageSelected,
  initialImageUri,
}: ImageSelectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    initialImageUri || null
  );
  const { height } = useWindowDimensions();

  const imageBackgroundColor = tintColor(
    useThemeColoring("appBackground"),
    0.05
  );
  const placeholderImageColor = tintColor(
    useThemeColoring("appBackground"),
    0.13
  );

  const handleImagePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      onImageSelected?.(imageUri);
    }
  };

  const handleClearImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImage(null);
    onImageSelected?.("");
  };

  return (
    <View style={{ position: "relative" }}>
      <TouchableOpacity
        style={[
          imageSelectionStyles.container,
          {
            backgroundColor: imageBackgroundColor,
          },
        ]}
        onPress={handleImagePress}
        activeOpacity={0.8}
      >
        <View
          style={[
            imageSelectionStyles.imageContainer,
            { height: height * 0.3 },
          ]}
        >
          <View>
            {selectedImage ? (
              <>
                <Image
                  source={{ uri: selectedImage }}
                  style={[
                    imageSelectionStyles.image,
                    {
                      width: height * 0.25,
                      height: height * 0.25,
                    },
                  ]}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={imageSelectionStyles.clearButton}
                  onPress={handleClearImage}
                  activeOpacity={0.8}
                >
                  <X size={16} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <ImageIcon size={height * 0.2} color={placeholderImageColor} />
                <Text light style={imageSelectionStyles.subtext}>
                  Tap to upload an image
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const muscleIconStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(4),
    alignItems: "center",
  },
  icon: {
    borderRadius: "50%",
    padding: "8%",
    borderWidth: 1,
    overflow: "hidden",
    ...StyleUtils.flexRowCenterAll(),
  },
});

type MuscleIconProps = {
  muscle: string;
  size: number;
  onPress?: () => void;
};

function MuscleIcon({ muscle, size, onPress }: MuscleIconProps) {
  const iconContainerColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const iconContainerBorderColor = convertHexToRGBA(
    useThemeColoring("lightText"),
    0.12
  );

  return (
    <TouchableOpacity
      style={muscleIconStyles.container}
      onPress={onPress}
      activeOpacity={1}
    >
      <View
        style={[
          muscleIconStyles.icon,
          {
            backgroundColor: iconContainerColor,
            borderColor: iconContainerBorderColor,
            width: size,
            height: size,
          },
        ]}
      >
        <MuscleDistinction size={44} muscle={muscle} intensity={1} />
      </View>
      <Text light small style={{ fontSize: 10 }}>
        {muscle}
      </Text>
    </TouchableOpacity>
  );
}

const muscleGroupStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(12),
    paddingHorizontal: "5%",
  },
  headerText: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  musclesContainer: {
    ...StyleUtils.flexRow(12),
    flexWrap: "wrap",
    gap: 12,
  },
  addButton: {
    borderRadius: "50%",
    ...StyleUtils.flexRowCenterAll(),
    borderWidth: 1,
    borderStyle: "dashed",
  },
});

export type MuscleGroupRef = {
  showError: (message: string) => void;
  hideError: () => void;
};

type MuscleGroupProps = {
  label: "Primary Muscles" | "Secondary Muscles";
  muscles: string[];
  onAddPress: () => void;
};

export const MuscleGroup = forwardRef<MuscleGroupRef, MuscleGroupProps>(
  ({ label, muscles, onAddPress }, ref) => {
    const addButtonColor = convertHexToRGBA(useThemeColoring("lightText"), 0.3);
    const lightText = useThemeColoring("lightText");
    const errorColor = useThemeColoring("dangerAction");
    const { width } = useWindowDimensions();
    const addButtonColorAnimation = useSharedValue(0);
    const shakeAnimation = useSharedValue(0);
    const [errorMessage, setErrorMessage] = useState("");
    const muscleIconSize = width * 0.14;

    useImperativeHandle(ref, () => ({
      showError: (message: string) => {
        setErrorMessage(message);
        addButtonColorAnimation.value = withTiming(1, { duration: 300 });
        shakeAnimation.value = 10;
        shakeAnimation.value = withSpring(0, { damping: 8, stiffness: 500 });
      },
      hideError: () => {
        setErrorMessage("");
        addButtonColorAnimation.value = 0;
      },
    }));

    const animatedAddButtonStyle = useAnimatedStyle(() => {
      return {
        borderColor: interpolateColor(
          addButtonColorAnimation.value,
          [0, 1],
          [addButtonColor, errorColor]
        ),
        transform: [
          {
            translateX: shakeAnimation.value,
          },
        ],
      };
    });

    return (
      <Animated.View style={muscleGroupStyles.container}>
        <Text small light style={muscleGroupStyles.headerText}>
          {label}
        </Text>

        {errorMessage && (
          <Animated.View key={"error-message"}>
            <Text small style={{ color: errorColor }}>
              {errorMessage}
            </Text>
          </Animated.View>
        )}

        <View style={muscleGroupStyles.musclesContainer}>
          {muscles.map((muscle) => (
            <MuscleIcon
              key={muscle}
              muscle={muscle}
              size={muscleIconSize}
              onPress={onAddPress}
            />
          ))}

          <AnimatedTouchableOpacity
            style={[
              muscleGroupStyles.addButton,
              {
                width: muscleIconSize,
                height: muscleIconSize,
              },
              animatedAddButtonStyle,
            ]}
            onPress={onAddPress}
            activeOpacity={1}
          >
            <Plus size={24} color={errorMessage ? errorColor : lightText} />
          </AnimatedTouchableOpacity>
        </View>
      </Animated.View>
    );
  }
);

type ModifyExerciseState = {
  name: string;
  description: string;
  exerciseType: DifficultyType;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  imageUri?: string;
};

const modifyExerciseStyles = StyleSheet.create({
  container: {
    padding: "3%",
  },
  contentContainer: {
    ...StyleUtils.flexColumn(16),
    paddingBottom: "30%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleUtils.flexRowCenterAll(),
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

type ModifyExerciseProps = {
  exerciseMeta: ExerciseMeta;
  isEditingCreatedExercise: boolean;
  onBack: () => void;
  title: string;
};

export function ModifyExercise({
  exerciseMeta,
  isEditingCreatedExercise,
  onBack,
  title,
}: ModifyExerciseProps) {
  const addExercise = useExercisesStore((state) => state.addExercise);

  const [modifyExerciseState, setModifyExerciseState] =
    useState<ModifyExerciseState>({
      name: exerciseMeta.name,
      description: exerciseMeta.description,
      exerciseType: exerciseMeta.difficultyType,
      primaryMuscles: exerciseMeta.primaryMuscles,
      secondaryMuscles: exerciseMeta.secondaryMuscles,
      imageUri: exerciseMeta.image
        ? getCustomExerciseUri(exerciseMeta.image)
        : undefined,
    });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const exerciseTypeSheetRef = useRef<BottomSheet>(null);
  const [showExerciseTypeSheet, setShowExerciseTypeSheet] = useState(false);
  const musclePickerSheetRef = useRef<BottomSheet>(null);
  const [musclePickerState, setMusclePickerState] = useState<MusclePickerState>(
    {
      mode: "primary",
      show: false,
    }
  );
  const [renderMusclePickerSheet, setRenderMusclePickerSheet] = useState(false);

  const basicInformationRef = useRef<BasicInformationRef>(null);
  const primaryMusclesRef = useRef<MuscleGroupRef>(null);

  useEffect(() => {
    setTimeout(() => {
      setRenderMusclePickerSheet(true);
    }, 300);
  }, []);

  const handleExerciseTypePress = () => {
    setShowExerciseTypeSheet(true);
  };

  const handleOnHideExerciseTypeSheet = useCallback(() => {
    setShowExerciseTypeSheet(false);
  }, []);

  const handlePrimaryMusclesPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMusclePickerState({ mode: "primary", show: true });
  }, []);

  const handleSecondaryMusclesPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMusclePickerState({ mode: "secondary", show: true });
  }, []);

  const handleOnHideMusclePickerSheet = useCallback(() => {
    setMusclePickerState((prev: MusclePickerState) => ({
      ...prev,
      show: false,
    }));
  }, []);

  const handleImageSelected = useCallback((imageUri: string) => {
    setModifyExerciseState((prev) => ({ ...prev, imageUri }));
  }, []);

  const handleMuscleSelection = useCallback(
    (muscle: string) => {
      setModifyExerciseState((prev) => {
        if (musclePickerState.mode === "primary") {
          const hasMuscle = prev.primaryMuscles.includes(muscle);

          if (hasMuscle) {
            return {
              ...prev,
              primaryMuscles: prev.primaryMuscles.filter((m) => m !== muscle),
            };
          } else {
            return {
              ...prev,
              primaryMuscles: [...prev.primaryMuscles, muscle].sort(),
              secondaryMuscles: prev.secondaryMuscles.filter(
                (m) => m !== muscle
              ),
            };
          }
        } else {
          const hasMuscle = prev.secondaryMuscles.includes(muscle);
          if (hasMuscle) {
            return {
              ...prev,
              secondaryMuscles: prev.secondaryMuscles.filter(
                (m) => m !== muscle
              ),
            };
          } else {
            return {
              ...prev,
              secondaryMuscles: [...prev.secondaryMuscles, muscle].sort(),
              primaryMuscles: prev.primaryMuscles.filter((m) => m !== muscle),
            };
          }
        }
      });
    },
    [musclePickerState.mode]
  );

  const handleSubmit = useCallback(async () => {
    const {
      name,
      description,
      exerciseType,
      primaryMuscles,
      secondaryMuscles,
      imageUri,
    } = modifyExerciseState;
    let hasError = false;

    basicInformationRef.current?.hideError();
    primaryMusclesRef.current?.hideError();

    if (!name.trim()) {
      basicInformationRef.current?.showError("Name is required");
      hasError = true;
    }

    if (primaryMuscles.length === 0) {
      primaryMusclesRef.current?.showError(
        "At least one primary muscle is required"
      );
      hasError = true;
    }

    if (!hasError) {
      setIsSubmitting(true);
      try {
        const updatedExercise = {
          id: exerciseMeta.metaId,
          name: name.trim(),
          type: exerciseType,
          primaryMuscles,
          secondaryMuscles,
          description: description.trim(),
          image: exerciseMeta.image,
        };

        const savedExercise = await WorkoutApi.saveCustomExercise(
          updatedExercise,
          imageUri
        );

        addExercise(toExerciseMeta(savedExercise));

        onBack();
      } catch (error) {
        console.error("Error submitting exercise:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [
    modifyExerciseState,
    isEditingCreatedExercise,
    exerciseMeta,
    addExercise,
    onBack,
  ]);

  const {
    name,
    description,
    exerciseType,
    primaryMuscles,
    secondaryMuscles,
    imageUri,
  } = modifyExerciseState;

  return (
    <View style={{ height: "100%" }}>
      <HeaderPage
        title={title}
        leftAction={
          isEditingCreatedExercise ? (
            <BackButton onClick={onBack} />
          ) : (
            <CloseButton onClick={onBack} />
          )
        }
        rightAction={
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.7}>
            <Check size={24} color={useThemeColoring("primaryAction")} />
          </TouchableOpacity>
        }
      >
        <ScrollView
          style={modifyExerciseStyles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={modifyExerciseStyles.contentContainer}>
            <ImageSelection
              onImageSelected={handleImageSelected}
              initialImageUri={imageUri}
            />
            <BasicInformation
              ref={basicInformationRef}
              name={name}
              description={description}
              onNameChange={(name) =>
                setModifyExerciseState((prev) => ({ ...prev, name }))
              }
              onDescriptionChange={(description) =>
                setModifyExerciseState((prev) => ({ ...prev, description }))
              }
            />
            <ExerciseType
              exerciseType={exerciseType}
              onExerciseTypePress={handleExerciseTypePress}
              isEditable={!isEditingCreatedExercise}
            />
            <MuscleGroup
              ref={primaryMusclesRef}
              label="Primary Muscles"
              muscles={primaryMuscles}
              onAddPress={handlePrimaryMusclesPress}
            />
            <MuscleGroup
              label="Secondary Muscles"
              muscles={secondaryMuscles}
              onAddPress={handleSecondaryMusclesPress}
            />
          </View>
        </ScrollView>
      </HeaderPage>

      {renderMusclePickerSheet && (
        <>
          <MusclePickerSheet
            ref={musclePickerSheetRef}
            show={musclePickerState.show}
            hide={() => musclePickerSheetRef.current?.close()}
            onHide={handleOnHideMusclePickerSheet}
            mode={musclePickerState.mode}
            primaryMuscles={primaryMuscles}
            secondaryMuscles={secondaryMuscles}
            onSelectMuscle={handleMuscleSelection}
          />
          <SetExerciseTypeSheet
            ref={exerciseTypeSheetRef}
            show={showExerciseTypeSheet}
            hide={() => exerciseTypeSheetRef.current?.close()}
            onHide={handleOnHideExerciseTypeSheet}
            selectedExerciseType={exerciseType}
            onSelect={(exerciseType) =>
              setModifyExerciseState((prev) => ({ ...prev, exerciseType }))
            }
          />
        </>
      )}

      {isSubmitting && (
        <View style={modifyExerciseStyles.overlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </View>
  );
}
