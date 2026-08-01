# Routine Maker UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the routine maker to reuse the live workout's screens, components, and interactions, and fix the routine creation flow.

**Architecture:** The routine maker becomes the live workout minus its Player tab — one `HeaderPage` wrapping a `material-top-tabs` navigator with `Edit` and `AddExercises` tabs, replacing the current three-screen `native-stack`. Sets are edited inline under their exercise instead of on a pushed screen. `SetPlan`/`ExercisePlan` are adapted to `Set`/`Exercise` at the render boundary so live workout components work unchanged.

**Tech Stack:** React Native 0.79, Expo SDK 53, TypeScript, `@react-navigation/material-top-tabs`, `@gorhom/bottom-sheet`, `react-native-reanimated`, Zustand.

**Spec:** `docs/superpowers/specs/2026-08-01-routine-maker-ux-design.md`

## Global Constraints

- **Working directory is `mobile/`.** All paths below are relative to `mobile/` unless stated otherwise. Run all commands from `mobile/`.
- **There is no test suite.** This repo has zero test files. Do not invent one; do not add a testing library. Verification is (a) the TypeScript gate below and (b) driving the app on a simulator, which the reviewing agent performs.
- **TypeScript gate:** `npx tsc --noEmit 2>&1 | grep -c "error TS"` must print **6 or fewer**. Six errors pre-exist on `main` in: `components/pages/workout/live/index.tsx`, `components/preload/index.tsx`, `components/Themed.tsx`, `components/util/reorderable/index.tsx`, `constants/Themes.ts`, `layout/index.tsx`. Introducing a 7th is a failure.
- **Do not start or restart Metro or the simulator.** Metro already runs on **port 8082** for this project. Port 8081 belongs to a different project (`skim`); attaching to it loads the wrong bundle and crashes the app. Fast Refresh picks up your edits automatically.
- **Do not run `npx expo run:ios`.** The app is already built and installed on the iPhone 16e simulator (`BAF86D60-4537-4A1C-80D0-7DCFE62D1CE3`).
- **Copy rule:** user-facing strings in the routine maker say "routine", never "workout".
- **Import alias:** this project uses `@/` for the `mobile/` root (see `tsconfig.json`). Use it.
- **Commit after every task.** Do not squash tasks together.

---

## File Structure

**Created:**
- `util/workout/routine-adapter.ts` — pure functions mapping `SetPlan`/`ExercisePlan` onto `Set`/`Exercise` so live workout components render routine data.
- `components/workout/no-exercises.tsx` — shared empty state for both Edit tabs.
- `components/workout/exercise-card.tsx` — shared exercise card (header, notes, set list, Add Set), extracted from the live workout.
- `components/sheets/edit-routine-name.tsx` — the name sheet, used for both creation and rename.
- `components/modals/routine/sheets.tsx` — routine sheet orchestration, mirroring `components/pages/workout/live/sheets.tsx`.
- `components/modals/routine/edit.tsx` — the routine Edit tab.
- `components/modals/routine/add-exercises.tsx` — the routine AddExercises tab.

**Modified:**
- `components/pages/workout/common.tsx` — `SetRow`/`SetHeader` gain `showStatus`.
- `components/pages/workout/live/edit-exercises.tsx` — consumes the shared card and empty state.
- `components/modals/routine/index.tsx` — rebuilt as `HeaderPage` + top tabs.
- `components/modals/routine/context.tsx` — draft support.
- `components/pages/routine/index.tsx` — `+` opens a draft instead of persisting.

**Deleted:** `components/modals/common/exercise/`, `components/modals/common/set/`, `components/modals/common/top-actions.tsx`, `components/modals/routine/top-actions.tsx`, `components/popup/routine/common/meta.tsx`, `components/util/popup/inputs-pad/`.

---

### Task 1: Routine adapters and optional status column

Foundation. No visible change yet.

**Files:**
- Create: `util/workout/routine-adapter.ts`
- Modify: `components/pages/workout/common.tsx:157-340`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `setPlanToSet(plan: SetPlan): Set`
  - `exercisePlanToExercise(plan: ExercisePlan): Exercise`
  - `SetRow` and `SetHeader` accept `showStatus?: boolean` (default `true`); `SetRow`'s `onToggle` becomes optional.

- [ ] **Step 1: Create the adapter module**

Create `util/workout/routine-adapter.ts`:

```ts
import {
  Exercise,
  ExercisePlan,
  Set,
  SetPlan,
  SetStatus,
} from "@/interface";

/**
 * Routines hold SetPlan/ExercisePlan, which are the live workout's
 * Set/Exercise without runtime state. Adapting them here lets the live
 * workout's row and sheet components render routine data unchanged.
 */
export function setPlanToSet(plan: SetPlan): Set {
  return {
    id: plan.id,
    difficulty: plan.difficulty,
    status: SetStatus.UNSTARTED,
    restDuration: 0,
  };
}

export function exercisePlanToExercise(plan: ExercisePlan): Exercise {
  return {
    id: plan.id,
    metaId: plan.metaId,
    sets: plan.sets.map(setPlanToSet),
    restDuration: plan.rest,
  };
}
```

- [ ] **Step 2: Make the status column optional in `SetRow`**

In `components/pages/workout/common.tsx`, change `SetRowProps` (currently at line 157) to make `onToggle` optional and add `showStatus`:

```tsx
type SetRowProps = {
  set: Set;
  index: number;
  useAltBackground: boolean;
  difficultyType: DifficultyType;
  containerAnimatedStyle?: AnimatedStyle<ViewStyle>;
  overlayAnimatedStyle?: AnimatedStyle<ViewStyle>;
  onEdit: (setId: string, field: EditField) => void;
  onToggle?: (event: GestureResponderEvent) => void;
  showSwipeActions: boolean;
  showStatus?: boolean;
  onDelete: (setId: string) => void;
};
```

Add `showStatus = true` to the destructured parameters alongside `onToggle`.

Then replace the checkmark block (currently lines 262-264):

```tsx
      <View style={commonSetStyles.checkmark}>
        <SetStatusInput isActive={isActive} onToggle={onToggle} />
      </View>
```

with:

```tsx
      {showStatus && (
        <View style={commonSetStyles.checkmark}>
          <SetStatusInput isActive={isActive} onToggle={onToggle ?? (() => {})} />
        </View>
      )}
```

- [ ] **Step 3: Make the status column optional in `SetHeader`**

In the same file, change `SetHeaderProps` (currently line 296) and the header's checkmark block (currently lines 331-337):

```tsx
type SetHeaderProps = {
  difficultyType: DifficultyType;
  showStatus?: boolean;
};

export function SetHeader({ difficultyType, showStatus = true }: SetHeaderProps) {
```

and replace the trailing checkmark `View` with:

```tsx
      {showStatus && (
        <View style={commonSetStyles.checkmark}>
          <Check
            color={useThemeColoring("lightText")}
            strokeWidth={2}
            size={20}
          />
        </View>
      )}
```

Note: `useThemeColoring` is a hook inside a conditional here. Hoist it above the `return` as `const lightTextColor = useThemeColoring("lightText");` and use that variable, so the hook call is unconditional.

- [ ] **Step 4: Verify the TypeScript gate**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `6` or fewer.

- [ ] **Step 5: Commit**

```bash
git add util/workout/routine-adapter.ts components/pages/workout/common.tsx
git commit -m "Add routine adapters and optional set status column"
```

---

### Task 2: Shared empty state

**Files:**
- Create: `components/workout/no-exercises.tsx`
- Modify: `components/pages/workout/live/edit-exercises.tsx:764-790`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `NoExercises({ message, onAdd }: { message: string; onAdd: () => void })`.

- [ ] **Step 1: Create the component**

Follow the existing idiom in `components/pages/home/completed-workout.tsx:108-128` (`NoWorkoutsLogged`): centered column, 100px lucide icon at `strokeWidth 1.5` in `lightText`, `<Text light>` caption. Create `components/workout/no-exercises.tsx`:

```tsx
import { StyleSheet, TouchableOpacity } from "react-native";
import { Dumbbell, Plus } from "lucide-react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";

const noExercisesStyles = StyleSheet.create({
  container: {
    height: "60%",
    ...StyleUtils.flexColumn(10),
    alignItems: "center",
    justifyContent: "center",
  },
  action: {
    ...StyleUtils.flexRow(6),
    alignItems: "center",
    paddingHorizontal: "6%",
    paddingVertical: "3%",
    borderRadius: 8,
    marginTop: "2%",
  },
});

type NoExercisesProps = {
  message: string;
  onAdd: () => void;
};

export function NoExercises({ message, onAdd }: NoExercisesProps) {
  const lightTextColor = useThemeColoring("lightText");
  const primaryActionColor = useThemeColoring("primaryAction");

  return (
    <View style={noExercisesStyles.container}>
      <Dumbbell size={100} strokeWidth={1.5} color={lightTextColor} />
      <Text light>{message}</Text>
      <TouchableOpacity
        style={[
          noExercisesStyles.action,
          { backgroundColor: primaryActionColor },
        ]}
        onPress={onAdd}
      >
        <Plus size={16} color="white" />
        <Text style={{ color: "white" }}>Add Exercises</Text>
      </TouchableOpacity>
    </View>
  );
}
```

- [ ] **Step 2: Wire it into the live workout Edit tab**

`EditExercises` in `components/pages/workout/live/edit-exercises.tsx` currently maps over `workout?.exercises` with no empty branch, so an empty workout renders blank.

Add the import:

```tsx
import { NoExercises } from "@/components/workout/no-exercises";
```

The component already has `const navigation = useNavigation();` in scope. Inside the `<ScrollView>`, replace:

```tsx
        {workout?.exercises.map((exercise: Exercise) => (
```

with a guarded version:

```tsx
        {(workout?.exercises.length ?? 0) === 0 ? (
          <NoExercises
            message="No exercises in this workout"
            onAdd={() => {
              // @ts-ignore
              navigation.navigate("AddExercises");
            }}
          />
        ) : null}
        {workout?.exercises.map((exercise: Exercise) => (
```

- [ ] **Step 3: Verify the TypeScript gate**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `6` or fewer.

- [ ] **Step 4: Commit**

```bash
git add components/workout/no-exercises.tsx components/pages/workout/live/edit-exercises.tsx
git commit -m "Add shared empty state for exercise lists"
```

---

### Task 3: Extract the shared exercise card

Move the card out of the live workout so the routine maker can use it. Live workout keeps its status animation and toggle behaviour by supplying its own set rows through a render prop — the same pattern `components/modals/common/` already uses.

**Files:**
- Create: `components/workout/exercise-card.tsx`
- Modify: `components/pages/workout/live/edit-exercises.tsx`

**Interfaces:**
- Consumes: `SetHeader` with `showStatus` (Task 1).
- Produces:

```ts
type SharedExerciseCardProps = {
  metaId: string;
  name: string;
  description: string;
  note?: string;
  difficultyType: DifficultyType;
  sets: Set[];
  showStatus?: boolean;
  moreButtonRef: React.RefObject<any>;
  onMorePress: () => void;
  onNotePress: () => void;
  onOpenExercise: () => void;
  onAddSet: () => void;
  renderSetRow: (set: Set, index: number) => React.ReactNode;
};
export function SharedExerciseCard(props: SharedExerciseCardProps): JSX.Element;
```

- [ ] **Step 1: Create the shared card**

Create `components/workout/exercise-card.tsx`. Move `exerciseCardHeaderStyles` and `ExerciseCardHeader` verbatim from `components/pages/workout/live/edit-exercises.tsx:67-159`, then add the card body. The card contains no live-workout state — all data and callbacks arrive as props.

```tsx
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  LinearTransition,
  LightSpeedOutLeft,
  LightSpeedInRight,
  LayoutAnimationConfig,
} from "react-native-reanimated";
import { Plus, MoreVertical } from "lucide-react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { DifficultyType, Set } from "@/interface";
import { StyleUtils } from "@/util/styles";
import { tintColor } from "@/util/color";
import { ExerciseImage } from "@/components/exercise/image";
import { SetHeader } from "@/components/pages/workout/common";

const exerciseCardHeaderStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  topHeader: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    marginBottom: "3%",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: "3%",
  },
  info: {
    ...StyleUtils.flexColumn(),
    justifyContent: "space-between",
    flex: 1,
  },
  name: {
    fontWeight: "600",
  },
  actions: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
  },
  notesContainer: {
    ...StyleUtils.flexColumn(),
    marginBottom: "3%",
  },
});

type ExerciseCardHeaderProps = {
  metaId: string;
  name: string;
  description: string;
  note?: string;
  onMorePress: () => void;
  moreButtonRef: React.RefObject<any>;
  onNotePress: () => void;
  onOpenExercise: () => void;
};

function ExerciseCardHeader({
  metaId,
  name,
  description,
  note,
  onMorePress,
  moreButtonRef,
  onNotePress,
  onOpenExercise,
}: ExerciseCardHeaderProps) {
  const primaryActionColor = useThemeColoring("primaryAction");

  return (
    <View style={exerciseCardHeaderStyles.container}>
      <View style={exerciseCardHeaderStyles.topHeader}>
        <TouchableOpacity onPress={onOpenExercise}>
          <ExerciseImage
            metaId={metaId}
            imageStyle={exerciseCardHeaderStyles.image}
            fallbackSize={50}
            fallbackColor={primaryActionColor}
          />
        </TouchableOpacity>
        <View style={exerciseCardHeaderStyles.info}>
          <Text header style={exerciseCardHeaderStyles.name}>
            {name}
          </Text>
          <Text light>{description}</Text>
        </View>
        <View style={exerciseCardHeaderStyles.actions}>
          <TouchableOpacity ref={moreButtonRef} onPress={onMorePress}>
            <MoreVertical size={24} color={primaryActionColor} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={exerciseCardHeaderStyles.notesContainer}
        onPress={onNotePress}
      >
        <Text light sneutral>
          {note || "Add notes here..."}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const exerciseCardStyles = StyleSheet.create({
  exerciseCard: {
    borderRadius: 12,
    marginBottom: "4%",
    padding: "2%",
  },
  setsContainer: {
    marginBottom: "3%",
  },
  addSetButton: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "3%",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addSetText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: "2%",
  },
});

type SharedExerciseCardProps = {
  metaId: string;
  name: string;
  description: string;
  note?: string;
  difficultyType: DifficultyType;
  sets: Set[];
  showStatus?: boolean;
  moreButtonRef: React.RefObject<any>;
  onMorePress: () => void;
  onNotePress: () => void;
  onOpenExercise: () => void;
  onAddSet: () => void;
  renderSetRow: (set: Set, index: number) => React.ReactNode;
};

export function SharedExerciseCard({
  metaId,
  name,
  description,
  note,
  difficultyType,
  sets,
  showStatus = true,
  moreButtonRef,
  onMorePress,
  onNotePress,
  onOpenExercise,
  onAddSet,
  renderSetRow,
}: SharedExerciseCardProps) {
  const primaryActionColor = useThemeColoring("primaryAction");
  const borderColor = tintColor(useThemeColoring("appBackground"), 0.1);

  return (
    <Animated.View
      style={exerciseCardStyles.exerciseCard}
      layout={LinearTransition}
    >
      <ExerciseCardHeader
        metaId={metaId}
        name={name}
        description={description}
        note={note}
        onMorePress={onMorePress}
        moreButtonRef={moreButtonRef}
        onNotePress={onNotePress}
        onOpenExercise={onOpenExercise}
      />
      <View style={exerciseCardStyles.setsContainer}>
        <SetHeader difficultyType={difficultyType} showStatus={showStatus} />
        <LayoutAnimationConfig skipEntering>
          {sets.map((set, index) => (
            <Animated.View
              key={set.id}
              layout={LinearTransition}
              exiting={LightSpeedOutLeft}
              entering={LightSpeedInRight}
            >
              {renderSetRow(set, index)}
            </Animated.View>
          ))}
          <Animated.View key="add-set-button" layout={LinearTransition}>
            <TouchableOpacity
              style={[
                exerciseCardStyles.addSetButton,
                { borderColor: borderColor },
              ]}
              onPress={onAddSet}
            >
              <Plus size={16} color={primaryActionColor} />
              <Text
                style={[
                  exerciseCardStyles.addSetText,
                  { color: primaryActionColor },
                ]}
              >
                Add Set
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </LayoutAnimationConfig>
      </View>
    </Animated.View>
  );
}
```

- [ ] **Step 2: Make the live workout use it**

In `components/pages/workout/live/edit-exercises.tsx`:

1. Delete `exerciseCardHeaderStyles` and `ExerciseCardHeader` (lines 67-159) — they now live in the shared file.
2. Delete `editExercisesStyles.exerciseCard`, `.setsContainer`, `.addSetButton`, `.addSetText` from `editExercisesStyles` (keep `.container` and `.scrollContainer`).
3. Add `import { SharedExerciseCard } from "@/components/workout/exercise-card";`
4. Keep `EditSetRow` exactly as it is — it carries the status animation and toggle logic.
5. Rewrite the body of the local `ExerciseCard` (its `return`, currently lines 537-614) to delegate, keeping its `memo` wrapper and all existing hooks:

```tsx
    return (
      <SharedExerciseCard
        metaId={exercise.metaId}
        name={exerciseName}
        description={getInProgressExerciseDescription(exercise, difficultyType)}
        note={exercise.note}
        difficultyType={difficultyType}
        sets={exercise.sets}
        moreButtonRef={moreButtonRef}
        onMorePress={handleMorePress}
        onNotePress={handleNotePress}
        onOpenExercise={handleOpenExerciseDescription}
        onAddSet={handleAddSet}
        renderSetRow={(set, index) => {
          const isCurrent = currentSet?.set.id === set.id;
          const isBefore = currentSet
            ? exercise.sets.indexOf(set) <
              exercise.sets.indexOf(currentSet.set)
            : false;
          const isAfter = currentSet
            ? exercise.sets.indexOf(set) >
              exercise.sets.indexOf(currentSet.set)
            : false;

          return (
            <EditSetRow
              set={set}
              index={index}
              difficultyType={difficultyType}
              onEdit={handleEditSet}
              showSwipeActions={true}
              isCurrent={isCurrent}
              isBefore={isBefore}
              isAfter={isAfter}
              currentSetStatus={currentSet?.set.status}
              currentSetId={currentSet?.set.id}
              saveWorkout={saveWorkout}
            />
          );
        }}
      />
    );
```

Note: `handleMorePress` currently takes `(exerciseId, ref)` and is called as `onMorePress(exercise.id, moreButtonRef)`. The shared card calls `onMorePress()` with no arguments, so keep the local `handleMorePress` closing over `exercise.id` and `moreButtonRef` as it already does — its signature is unchanged.

Remove any imports that are now unused (`ExerciseImage`, `MoreVertical`, `SetHeader`, `LayoutAnimationConfig`, `LightSpeedInRight`) **only if** nothing else in the file references them. `LightSpeedOutLeft` and `LinearTransition` may still be used elsewhere in the file — check before deleting.

- [ ] **Step 3: Verify the TypeScript gate**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `6` or fewer.

- [ ] **Step 4: Commit**

```bash
git add components/workout/exercise-card.tsx components/pages/workout/live/edit-exercises.tsx
git commit -m "Extract shared exercise card from live workout"
```

**Reviewer gate:** the live workout Edit tab must look and behave exactly as before — set toggling, the completion pulse, swipe-to-delete, Add Set, and the per-exercise menu.

---

### Task 4: Routine name sheet

**Files:**
- Create: `components/sheets/edit-routine-name.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:

```ts
type EditRoutineNameProps = {
  show: boolean;
  hide: () => void;
  onHide: () => void;
  name: string;
  mode: "create" | "rename";
  onSave: (name: string) => void;
};
export const EditRoutineName: React.ForwardRefExoticComponent<...>;
```

One component, two entry points; only the copy differs:

| mode | title | primary button |
|---|---|---|
| `create` | "Name Routine" | "Continue" |
| `rename` | "Edit Name" | "Save" |

- [ ] **Step 1: Read the model**

Read `components/sheets/edit-workout.tsx:91-235`. `EditWorkoutName` there is the pattern being copied: a centered `AnimatedTextInput` over a `DashedDivider`, a `commonSheetStyles.sheetButton` in `primaryAction` that dims when disabled, and a `KeyboardSpacer`. `DashedDivider` (line 91) and `AnimatedTextInput` (line 113) are module-private in that file, so re-declare them in the new file.

- [ ] **Step 2: Create the sheet**

Create `components/sheets/edit-routine-name.tsx`:

```tsx
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { TextInput as RNTextInput } from "react-native";
import Animated from "react-native-reanimated";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { View, Text, TextInput, useThemeColoring } from "@/components/Themed";
import { commonSheetStyles, KeyboardSpacer } from "./common";
import { PopupBottomSheetModal } from "@/components/util/popup/sheet";
import { StyleUtils } from "@/util/styles";
import { tintColor } from "@/util/color";
import { Svg, Line } from "react-native-svg";

function DashedDivider({
  color,
  thickness,
  width,
  offset,
}: {
  color: string;
  thickness: number;
  width: number;
  offset: number;
}) {
  return (
    <Svg height={thickness} width={width}>
      <Line
        x1="0"
        y1={thickness / 2}
        x2={width}
        y2={thickness / 2}
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={`${offset},${offset}`}
      />
    </Svg>
  );
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const editRoutineNameStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "3%",
    paddingVertical: "3%",
  },
  header: {
    ...StyleUtils.flexRowCenterAll(),
    paddingTop: "3%",
  },
  inputContainer: {
    ...StyleUtils.flexColumnCenterAll(),
    marginVertical: "8%",
    paddingHorizontal: "3%",
    paddingVertical: "3%",
  },
  input: {
    fontWeight: "600",
    textAlign: "center",
  },
  buttonContainer: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    width: "100%",
  },
});

type EditRoutineNameProps = {
  show: boolean;
  hide: () => void;
  onHide: () => void;
  name: string;
  mode: "create" | "rename";
  onSave: (name: string) => void;
};

export const EditRoutineName = forwardRef<
  BottomSheetModal,
  EditRoutineNameProps
>(({ show, hide, onHide, name, mode, onSave }, ref) => {
  const isCreating = mode === "create";
  const seed = isCreating && name === "New Routine" ? "" : name;

  const [selectedName, setSelectedName] = useState(seed);
  const inputRef = useRef<RNTextInput>(null);
  const { width } = useWindowDimensions();

  const primaryAction = useThemeColoring("primaryAction");
  const backgroundColor = useThemeColoring("appBackground");
  const placeholderColor = tintColor(backgroundColor, 0.2);

  useEffect(() => {
    if (show) {
      setSelectedName(seed);
      const timeout = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  const isEmpty = selectedName.trim().length === 0;

  const handleSave = () => {
    if (isEmpty) {
      hide();
      return;
    }
    onSave(selectedName.trim());
    hide();
  };

  return (
    <PopupBottomSheetModal show={show} onDismiss={onHide} ref={ref}>
      <View style={editRoutineNameStyles.container}>
        <View style={editRoutineNameStyles.header}>
          <Text action>{isCreating ? "Name Routine" : "Edit Name"}</Text>
        </View>
        <View style={editRoutineNameStyles.inputContainer}>
          <AnimatedTextInput
            ref={inputRef as any}
            style={editRoutineNameStyles.input}
            placeholder="e.g. Push Day"
            placeholderTextColor={placeholderColor}
            value={selectedName}
            onChangeText={setSelectedName}
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
          />
          <DashedDivider
            color={placeholderColor}
            thickness={6}
            width={width * 0.8}
            offset={10}
          />
        </View>
        <View style={editRoutineNameStyles.buttonContainer}>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              { backgroundColor: primaryAction, opacity: isEmpty ? 0.5 : 1 },
            ]}
            onPress={handleSave}
            disabled={isEmpty}
          >
            <Text neutral emphasized>
              {isCreating ? "Continue" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
        <KeyboardSpacer />
      </View>
    </PopupBottomSheetModal>
  );
});
```

If `PopupBottomSheetModal` does not accept a `show` prop, drive it by ref with `present()`/`dismiss()` the way the other sheets in `components/sheets/` do — match whichever convention `edit-workout.tsx` uses, and keep the rest of this component as written.

- [ ] **Step 3: Verify the TypeScript gate**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `6` or fewer.

- [ ] **Step 4: Commit**

```bash
git add components/sheets/edit-routine-name.tsx
git commit -m "Add routine name sheet"
```

---

### Task 5: Rebuild the routine maker screens

The largest task. Replaces the three-screen `native-stack` with `HeaderPage` + two `material-top-tabs`.

**Files:**
- Create: `components/modals/routine/sheets.tsx`
- Create: `components/modals/routine/edit.tsx`
- Create: `components/modals/routine/add-exercises.tsx`
- Modify: `components/modals/routine/index.tsx` (full rewrite)

**Interfaces:**
- Consumes: `exercisePlanToExercise`, `setPlanToSet` (Task 1); `NoExercises` (Task 2); `SharedExerciseCard` (Task 3); `EditRoutineName` (Task 4); `useRoutine()` from `./context`.
- Produces: `RoutineModal` (unchanged export name and route registration in `layout/index.tsx:219`).

- [ ] **Step 1: Read the model you are copying**

Read these three files completely before writing any code. Task 5 is a port of their structure:
- `components/pages/workout/live/index.tsx` — `HeaderPage`, `Tab.Navigator`, `AnimatedLeftAction`, `AnimatedRightAction`, `AnimatedHeader`, the `⋮` popover.
- `components/pages/workout/live/sheets.tsx` — the sheet-orchestration context pattern.
- `components/modals/routine/index.tsx` — the current behaviour you must preserve (start, delete, add exercises, edit rest).

- [ ] **Step 2: Create the routine sheets provider**

Create `components/modals/routine/sheets.tsx`, modelled directly on `components/pages/workout/live/sheets.tsx`. It owns the sheets and exposes openers via context:

```ts
type RoutineSheetsContextValue = {
  openEditName: (mode: "create" | "rename") => void;
  openEditSet: (exercisePlanId: string, setId: string, field?: EditField) => void;
  openEditRest: (exercisePlanId: string) => void;
  openAddNote: (exercisePlanId: string) => void;
  openReorderExercises: () => void;
  openStartConfirmation: () => void;
  openDeleteConfirmation: () => void;
  muscleFilters: string[];
  exerciseTypeFilters: string[];
  onUpdateMuscleFilters: (filters: string[]) => void;
  onUpdateExerciseTypeFilters: (filters: string[]) => void;
};
export function useRoutineSheets(): RoutineSheetsContextValue;
```

Sheets it renders, all already existing: `EditRoutineName` (Task 4), `EditSetSheet` (`@/components/sheets/edit-set`), `EditRestDuration`, `AddNoteSheet`, `ReorderExercisesSheet`, `RoutineStartConfirmation`, `RoutineDeleteConfirmation`, `FilterExercisesSheet`.

**Critical — adapting for `EditSetSheet`:** its props are `{ exercise?: Exercise; setId?: string; focusField?: EditField; onUpdate: (setId, update: Partial<Set>) => void }`. It reads only `exercise.metaId` and `exercise.sets[].difficulty`. Pass `exercisePlanToExercise(plan)` for `exercise`. In `onUpdate`, take `update.difficulty` and write it back with `SetPlanActions(routine, exercisePlanId).update(setId, { difficulty: update.difficulty })` — ignore any other fields, since a `SetPlan` has none.

`ExercisePlan` has no `note` field (see `interface/index.ts:48-53`). Add one: `note?: string` on `ExercisePlan`, and have `AddNoteSheet` write through `ExercisePlanActions(routine).update(exercisePlanId, { note })`. This is additive and back-compatible with stored routines.

- [ ] **Step 3: Create the Edit tab**

Create `components/modals/routine/edit.tsx`. Structure mirrors `EditExercises` in `components/pages/workout/live/edit-exercises.tsx`:

- `ScrollView` with `contentContainerStyle={{ paddingBottom: "30%" }}`.
- When `routine.plan.length === 0`, render `<NoExercises message="No exercises in this routine" onAdd={...} />` where `onAdd` navigates to the `AddExercises` tab.
- Otherwise map `routine.plan` to `SharedExerciseCard`, passing:
  - `sets={exercisePlanToExercise(plan).sets}`
  - `showStatus={false}`
  - `difficultyType` and `name` from `useExercisesStore` / `ExerciseStoreSelectors.getExercise(plan.metaId, state)` (same as the current `SetsEditor` does at `components/modals/routine/index.tsx:145-154`)
  - `description` from `getHistoricalExerciseDescription` (`@/util/workout/display:14`), which takes exactly what a plan can supply:

    ```tsx
    getHistoricalExerciseDescription({
      difficulties: plan.sets.map((set) => set.difficulty),
      difficultyType,
    })
    ```

    This yields the same "5 sets for 7 reps" phrasing the Routines list already shows.
  - `renderSetRow={(set, index) => <SetRow ... showStatus={false} showSwipeActions onEdit={...} onDelete={...} useAltBackground={index % 2 === 1} />}` — no `onToggle`.
  - `onAddSet` → `SetPlanActions(routine, plan.id).add()`
- After the list, a `+ Add Exercise` dashed button styled exactly like the card's Add Set button, navigating to the `AddExercises` tab.
- A per-exercise `Popover` with five `PopoverItem`s, copying the icons and colors from `edit-exercises.tsx:814-842`: **View Exercise** (`Info`), **Edit Note** (`StickyNote`), **Reorder Exercises** (`Shuffle`), **Edit Rest** (`Clock`), **Remove Exercise** (`Trash2`, `dangerAction` color).
  - View Exercise navigates to `exerciseInsightSheet` with `{ id: plan.metaId }`, as the live workout does.
  - Remove Exercise calls `ExercisePlanActions(routine).remove(plan.id)`.
  - Reuse the popover positioning logic from `edit-exercises.tsx:670-685` and `handleLayout` at `728-734` verbatim.

- [ ] **Step 4: Create the AddExercises tab**

Create `components/modals/routine/add-exercises.tsx`. Take the body of the current `AddExercises` function (`components/modals/routine/index.tsx:207-250`) but **remove** `ModalWrapper` and `AddExercisesTopActions` — the shared animated header now provides the chrome. Keep `ExerciseAdder` with the same props, and keep `FilterExercisesSheet` wired to the filter state (which now lives in the sheets provider from Step 2).

On add, call `ExercisePlanActions(routine).add(metas)` then navigate back to the `Edit` tab.

- [ ] **Step 5: Rewrite `index.tsx`**

Rewrite `components/modals/routine/index.tsx` as a port of `components/pages/workout/live/index.tsx`, with two tabs instead of three:

```tsx
export type RoutineTabParamList = {
  Edit: undefined;
  AddExercises: undefined;
};
```

- `tabSwitchProgress` goes `0` (Edit) → `1` (AddExercises). Because there are only two tabs, use `tabSwitchProgress.value` directly for crossfades rather than the live workout's `Math.min(v, 1)` / `Math.max(v - 1, 0)` split.
- Left action: `CloseButton` on Edit, `BackButton` on AddExercises. Close calls `navigation.goBack()`; Back navigates to the `Edit` tab.
- Right action: `MoreButton` (`⋮`) on Edit, `PlusButton` on AddExercises. The `+` navigates to `createExerciseSheet`, matching the live workout.
- Title: routine name on Edit, "Add Exercises" on AddExercises. Subtitle: `` `${routine.plan.length} exercises` `` on Edit, nothing on AddExercises.
- Tapping the title opens the name sheet in `rename` mode.
- The `⋮` popover has five items:
  - **Edit Name** (`FilePenLine`) → `openEditName("rename")`
  - **Add Exercises** (`Dumbbell`) → navigate to the `AddExercises` tab
  - **Reorder Exercises** (`Shuffle`) → `openReorderExercises()`
  - **Start Routine** (`Flag`, `primaryAction` color) → `openStartConfirmation()`
  - **Delete Routine** (`Trash2`, `dangerAction` color) → `openDeleteConfirmation()`
- Preserve the existing start and delete behaviour verbatim from the current `ExercisesEditor` (`components/modals/routine/index.tsx:71-92`), including the `isInWorkout` toast guard and `WorkoutCreation.createFromRoutine`.
- Wrap in `BottomSheetModalProvider` then the routine sheets provider, exactly as `LiveWorkout` does at `components/pages/workout/live/index.tsx:414-420`.

Do **not** change the route registration; `layout/index.tsx:219` keeps `<Stack.Screen name="routine" component={RoutineModal} />`.

- [ ] **Step 6: Verify the TypeScript gate**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `6` or fewer.

- [ ] **Step 7: Commit**

```bash
git add components/modals/routine components/sheets
git commit -m "Rebuild routine maker on live workout screens"
```

**Reviewer gate:** open an existing routine — exercises with sets inline, one tap to open, tapping a value opens the compact `EditSetSheet` (not a keypad), all five per-exercise menu items work, Add Set and swipe-delete work, `⋮` menu works, Start Routine still starts a live workout.

---

### Task 6: Draft creation flow

**Files:**
- Modify: `components/modals/routine/context.tsx`
- Modify: `components/pages/routine/index.tsx:97-104`
- Modify: `components/modals/routine/index.tsx` (auto-present the name sheet)
- Modify: `layout/types.tsx` (route param)

**Interfaces:**
- Consumes: `EditRoutineName` (Task 4), `RoutineModal` (Task 5).
- Produces: `RoutineProvider` accepts `isDraft?: boolean`; the `routine` route accepts `{ id: string; isDraft?: boolean }`.

- [ ] **Step 1: Add draft support to the provider**

In `components/modals/routine/context.tsx`, add an `isDraft` prop. When `isDraft` is true, do not fetch from the API — seed state with `RoutineActions.makeEmptyRoutine()` passed in via the route, and suppress persistence until the first meaningful change:

```tsx
type RoutineProviderProps = {
  routineId: string;
  isDraft?: boolean;
  children: React.ReactNode;
};

export function RoutineProvider({
  routineId,
  isDraft = false,
  children,
}: RoutineProviderProps) {
  const [routine, setRoutine] = useState<Routine | undefined>(
    isDraft ? { id: routineId, name: "New Routine", plan: [] } : undefined
  );
  const hasPersisted = useRef(!isDraft);
  const { invoke } = useDebounce({ delay: 200 });

  useEffect(() => {
    if (!isDraft) {
      WorkoutApi.getRoutine(routineId).then(setRoutine);
    }
  }, [isDraft, routineId]);

  const onSave = (updated: Routine) => {
    setRoutine(updated);
    const isMeaningful =
      updated.name !== "New Routine" || updated.plan.length > 0;
    if (!hasPersisted.current && !isMeaningful) {
      return;
    }
    hasPersisted.current = true;
    //@ts-ignore
    invoke(WorkoutApi.saveRoutine)(updated);
  };

  if (!routine) {
    return <Skeleton />;
  }

  return (
    <context.Provider value={{ routine, onSave }}>{children}</context.Provider>
  );
}
```

Add `useRef` to the React import.

- [ ] **Step 2: Stop persisting on `+`**

In `components/pages/routine/index.tsx`, replace `onCreateRoutine` (currently lines 97-104) so it navigates without writing:

```tsx
  const onCreateRoutine = () => {
    const createdRoutine = RoutineActions.makeEmptyRoutine();
    //@ts-ignore
    navigation.navigate("routine", { id: createdRoutine.id, isDraft: true });
  };
```

- [ ] **Step 3: Thread the param through**

In `layout/types.tsx`, widen the `routine` route params to `{ id: string; isDraft?: boolean }`.

In `components/modals/routine/index.tsx`, pass it through:

```tsx
<RoutineProvider routineId={route.params.id} isDraft={route.params.isDraft}>
```

- [ ] **Step 4: Auto-present the name sheet for drafts**

In `components/modals/routine/index.tsx`, when `route.params.isDraft` is true, open the name sheet in `create` mode once on mount:

```tsx
  useEffect(() => {
    if (isDraft) {
      openEditName("create");
    }
  }, []);
```

Place this inside the component that sits **below** the sheets provider so `openEditName` is in scope.

On save from `create` mode, after applying the name, navigate to the `AddExercises` tab. On dismiss, do nothing — the user lands on the empty Edit tab, and nothing has been persisted.

- [ ] **Step 5: Verify the TypeScript gate**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `6` or fewer.

- [ ] **Step 6: Commit**

```bash
git add components/modals/routine components/pages/routine/index.tsx layout/types.tsx
git commit -m "Hold new routines as drafts until first meaningful change"
```

**Reviewer gate:** `+` presents the name sheet focused; Continue lands on AddExercises and the routine appears in the list; dismissing then backing out leaves **no** empty routine; dismissing then adding an exercise saves it as "New Routine"; a whitespace-only name behaves as a dismissal.

---

### Task 7: Delete dead code

Only after Tasks 1-6 are verified working.

**Files:**
- Delete: `components/modals/common/exercise/index.tsx`, `components/modals/common/exercise/item.tsx`
- Delete: `components/modals/common/set/index.tsx`, `components/modals/common/set/item.tsx`
- Delete: `components/modals/common/top-actions.tsx`
- Delete: `components/modals/routine/top-actions.tsx`
- Delete: `components/popup/routine/common/meta.tsx`
- Delete: `components/util/popup/inputs-pad/` (whole directory)

- [ ] **Step 1: Confirm each is unreferenced**

For every path above, run a reference check before deleting. Example:

```bash
grep -rn "modals/common/set\|modals/common/exercise\|inputs-pad\|routine/common/meta\|routine/top-actions\|common/top-actions" --include="*.tsx" --include="*.ts" . | grep -v node_modules
```

Expected: no hits outside the files being deleted. **If anything else still imports these, stop and report it** rather than deleting.

Keep `components/modals/common/index.tsx` (`ModalWrapper`) and `components/modals/common/styles.tsx` if other modals still use them — check separately with:

```bash
grep -rn "ModalWrapper\|modals/common/styles" --include="*.tsx" . | grep -v node_modules
```

- [ ] **Step 2: Delete**

```bash
git rm -r components/modals/common/exercise components/modals/common/set
git rm components/modals/common/top-actions.tsx components/modals/routine/top-actions.tsx
git rm components/popup/routine/common/meta.tsx
git rm -r components/util/popup/inputs-pad
```

- [ ] **Step 3: Verify the TypeScript gate**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: `6` or fewer.

- [ ] **Step 4: Commit**

```bash
git commit -m "Remove routine maker's parallel UI components"
```

---

## Verification

Performed by the reviewing agent against the iPhone 16e simulator (`BAF86D60-4537-4A1C-80D0-7DCFE62D1CE3`) via the ios-simulator MCP. Full list in the spec's Verification section; the gates per task are noted above.

1. Existing routine opens on the first tap, exercises with sets inline.
2. Editing weight/reps/duration opens `EditSetSheet`, not a keypad.
3. Add and delete a set via `+ Add Set` and swipe.
4. Per-exercise `⋮` — all five items; Edit Note persists.
5. Reorder exercises via the sheet.
6. `⋮` → Edit Name renames and persists.
7. `⋮` → Start Routine starts a live workout.
8. `+` presents the name sheet with the input focused.
9. Name + Continue lands on AddExercises; routine appears under that name.
10. `+`, dismiss, back out — no empty routine in the list.
11. `+`, dismiss, add an exercise, back out — saved as "New Routine".
12. `+`, whitespace-only name, Continue — treated as a dismissal.
13. Deleting the last exercise shows the empty state with a working button.
14. An empty live workout shows the same empty state, worded "workout".
15. The live workout Edit tab behaves exactly as before the extraction.
