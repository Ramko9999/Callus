# Routine Maker UX Redesign

**Date:** 2026-08-01
**Branch:** `fix-routine-maker`

## Problem

The routine maker and the live workout screens are two unrelated UI systems for
editing the same shape of data. A routine (`Routine → ExercisePlan[] → SetPlan[]`)
is structurally the live workout's `Workout → Exercise[] → Set[]` minus the
runtime state (set status, rest timers, sentiment). Despite that, almost nothing
is shared.

Observed on device (iPhone 16e, iOS 26.2):

| | Live workout (Edit tab) | Routine maker |
|---|---|---|
| Structure | One scroll: exercise → its sets inline | Two screens: exercise list → pushed sets screen |
| Exercise row | Thumbnail, name, progress, `⋮` menu | Text summary + chevron |
| Notes | Inline "Add notes here…" per exercise | Not available at all |
| Set list | `SET/REPS/✓` headers, zebra rows, `+ Add Set` | Bare `Set / Reps` list |
| Editing a value | Compact bar: text field + unit + −/+ steppers | Half-screen custom numeric keypad |
| Per-exercise menu | View Exercise, Edit Note, Reorder, Edit Rest, Remove | None |
| Reordering | `ReorderExercisesSheet` | Long-press drag |

Additional defects found:

1. Tapping `+` on the Routines list **immediately persists** a routine named
   "New Routine". Backing out leaves a permanent empty entry. Reproduced: an
   empty "New Routine · 0 exercises" row appears in the list.
2. Opening a routine needs two taps — the first is swallowed. This is the
   `// todo: fix the lag` at `components/modals/routine/index.tsx:52`.
3. The "Progress" button on the sets screen is a no-op stub
   (`onViewProgress={() => {}}`, `components/modals/routine/index.tsx:173`).
4. Empty-state copy says "There are no exercises in this **workout**" for a routine.
5. `components/modals/common/exercise/index.tsx:80` has a hardcoded
   `height * 0.65` with a `// todo: investigate`.
6. `CompletedWorkoutSet` and `LiveWorkoutSet`
   (`components/modals/common/set/item.tsx`) are exported but never imported.

## Goal

Make creating and editing a routine feel like the live workout screens, by
reusing those components rather than maintaining a parallel set.

## Design

### 1. Screen structure

Replace the routine maker's `native-stack` (`exercises` → `sets` → `addExercises`)
with the live workout's shape: one `HeaderPage` wrapping a
`material-top-tabs` navigator.

The routine maker is the live workout **minus the Player tab**:

| | Live workout | Routine maker |
|---|---|---|
| Tab 0 | Player | — |
| Tab 1 | Edit | **Edit** |
| Tab 2 | AddExercises | **AddExercises** |

The separate per-exercise "sets" screen is removed entirely. Sets are edited
inline under their exercise, as in the Edit tab.

### 2. Header actions

Reuse the crossfade pattern from `components/pages/workout/live/index.tsx`
(`AnimatedLeftAction`, `AnimatedRightAction`, `AnimatedHeader`), driven by
`tabSwitchProgress`.

| Tab | Left action | Title | Right action |
|---|---|---|---|
| Edit | Close | routine name | `⋮` More |
| AddExercises | Back | "Add Exercises" | `+` (create custom exercise) |

The current `ExercisesEditorTopActions` / `SetsEditorTopActions` rows
(`+ / flag / trash`, `back / progress / timer / +`) are deleted. Their actions
move into the `⋮` popover, matching how the live workout exposes workout-level
actions:

**Routine `⋮` menu** (mirrors live workout's Edit Name and Time / Edit Exercises / Finish Workout):

- Edit Name — opens a sheet
- Add Exercises — switches to the AddExercises tab
- Reorder Exercises — opens `ReorderExercisesSheet`
- Start Routine — primary-colored, opens `RoutineStartConfirmation`
- Delete Routine — danger-colored, opens `RoutineDeleteConfirmation`

The dead "Progress" action is dropped rather than reimplemented: a routine has
no performance history of its own, and per-exercise history is already reachable
via the per-exercise "View Exercise" item.

### 3. Exercise card

Port `ExerciseCard` / `ExerciseCardHeader` from
`components/pages/workout/live/edit-exercises.tsx` into a shared component used
by both. Per exercise:

```
🖼  Pull-Up                                    ⋮
    5 sets × 7 reps
    Add notes here…
    SET          REPS
    1            7
    2            7
         + Add Set
```

Per-exercise `⋮` menu — the same five items as live workout, all of which apply
to routines:

- View Exercise · Edit Note · Reorder Exercises · Edit Rest · Remove Exercise

This gives routines note editing and exercise info, neither of which exists today.

At the end of the exercise list, a `+ Add Exercise` dashed button mirroring the
existing `+ Add Set` button, so adding an exercise is reachable without opening
the menu.

### 4. Set rows and value editing

Reuse `SetRow`, `SetHeader`, and `EditField` from
`components/pages/workout/common.tsx`. Tapping a value opens `EditSetSheet`
(`components/sheets/edit-set.tsx`) — the compact text-field + steppers bar, and
the `WheelPicker` for durations.

A routine's sets have no status, so `SetRow` and `SetHeader` gain a
`showStatus?: boolean` prop (default `true`). The routine maker passes `false`,
which hides the `✓` column and its toggle. `SetRow`'s set prop is widened to
accept `SetPlan` (`{ id, difficulty }`) in addition to `Set`; status-dependent
behaviour is already gated behind the callbacks, which the routine simply does
not pass.

Swipe-to-delete is retained — both surfaces already use it.

The routine-only `InputsPad` / `NumericPad` / `DurationPad` stack and its
`InputsPadProvider` are retired.

### 5. Creating a routine

Current flow: `+` → persist "New Routine" → navigate into an empty screen whose
only affordance is passive text.

A routine differs from a workout here. A workout is named automatically (from its
routine, or the date) and is a one-off record. A routine is a reusable template
whose **name is its identity** — the Routines list shows nothing but name and
exercise count, so an unnamed routine cannot be told apart from another. Leaving
the default "New Routine" in place produces a list of identical rows. Naming is
therefore part of creation, not an afterthought buried in a menu.

New flow:

1. `+` on the Routines list opens the routine maker with an **in-memory draft**.
   Nothing is written to storage yet.
2. The routine maker opens on the Edit tab and immediately presents the
   **Name Routine sheet**: an autofocused input, placeholder `e.g. Push Day`,
   primary button "Continue".
3. Continue persists the draft under that name and switches to the
   **AddExercises** tab, so the user lands where the next action is.
4. Dismissing the sheet persists nothing. The user lands on the empty Edit tab,
   titled "New Routine", with the "Add Exercises" CTA. Naming remains available
   from `⋮` → Edit Name. This path exists for users who do not know the name
   until they have picked the exercises.
5. An empty or whitespace-only name is treated as a dismissal — the routine keeps
   "New Routine". Duplicate names are allowed; no deduplication or suffixing.
6. The draft is persisted on the first meaningful change — a name entered or the
   first exercise added. Thereafter the existing debounced autosave in
   `RoutineProvider` applies unchanged.
7. Closing a draft with neither a name nor an exercise discards it. No empty
   routine is left behind.

Existing routines are unaffected: they open on the Edit tab, present no sheet,
and autosave as they do today.

### 6. Naming a routine

Replace `MetaEditor` (`components/popup/routine/common/meta.tsx`), which keeps
its own local state and syncs only on `onEndEditing`, with a **routine name sheet**
— matching live workout's "Edit Name and Time".

One component serves both entry points, differing only in copy:

| Entry point | Title | Primary button | On dismiss |
|---|---|---|---|
| Creation (auto-presented) | "Name Routine" | "Continue" | draft not persisted |
| `⋮` → Edit Name | "Edit Name" | "Save" | no change |

The header title remains tappable as a shortcut to the rename variant. The sheet
autofocuses its input and commits on the primary button, so the routine name
follows the same save path as every other edit.

### 7. Empty state

The Edit tab is empty in three cases: a new routine where the name sheet was
dismissed, a new routine whose exercise picking was abandoned, and an existing
routine whose last exercise was deleted.

Today the routine shows left-aligned text that draws the `+` glyph inline to
point at a header button — "Add an exercise by clicking '`+`'". That instruction
becomes wrong under this design, since `+` no longer sits in the header on the
Edit tab.

The app's established empty-state idiom is `NoWorkoutsLogged`
(`components/pages/home/completed-workout.tsx:118`): a centered column at 60%
height, a 100px lucide icon at `strokeWidth 1.5` in `lightText`, and a
`<Text light>` caption. The routine empty state follows it, with a primary action
added:

```
            [ Dumbbell icon, 100px, lightText ]

              No exercises in this routine

                 [ + Add Exercises ]
```

The button switches to the AddExercises tab.

`EditExercises` in the live workout has **no** empty branch at all — it maps over
`workout.exercises` directly, so an empty workout renders a blank screen. This is
the same gap, so the empty state is built once as a shared component
parameterised by its caption:

- Routine: "No exercises in this routine"
- Live workout: "No exercises in this workout"

When the list is non-empty, the `+ Add Exercise` dashed button at the end of the
list is the affordance instead — prominent when empty, subdued when populated.

### 8. Picking exercises

No change to the picker itself — the routine maker and live workout already share
`ExerciseAdder` (`components/popup/workout/common/exercise/add.tsx`), including
search, filters, and the grid/list toggle. It becomes a tab instead of a pushed
screen, so it inherits the animated header and swipe-back gesture.

`AddExercisesTopActions` is replaced by the shared animated header.

## Code changes

### Reused (no change beyond the `showStatus` prop)

- `components/pages/workout/common.tsx` — `SetRow`, `SetHeader`, `EditField`
- `components/sheets/edit-set.tsx` — `EditSetSheet`
- `components/sheets/reorder-exercises.tsx` — `ReorderExercisesSheet`
- `components/sheets/` — `AddNoteSheet`, `EditRestDuration`, `FilterExercisesSheet`
- `components/popup/workout/common/exercise/add.tsx` — `ExerciseAdder`
- `components/util/popover` — `Popover`, `PopoverItem`
- `components/util/header-page` — `HeaderPage`

### Extracted to shared

`ExerciseCard`, `ExerciseCardHeader`, and the animated header/action components
move out of `components/pages/workout/live/` into a shared location so both the
live workout and the routine maker consume one copy. The live workout keeps its
status-specific behaviour by passing callbacks the routine omits.

A new shared empty-state component (§7), parameterised by caption and add-action,
is consumed by both Edit tabs.

### Deleted

All of the following are consumed only by the routine maker and become
unreachable once it adopts the live workout components (verified by grep):

- `components/modals/common/exercise/` (`ExerciseEditor`, `RoutineExercise`)
- `components/modals/common/set/` (`SetEditor`, `RoutineSet`, plus the already-dead
  `CompletedWorkoutSet` and `LiveWorkoutSet`)
- `components/modals/common/top-actions.tsx` — `AddExercisesTopActions`
- `components/modals/routine/top-actions.tsx`
- `components/popup/routine/common/meta.tsx` — `MetaEditor`
- `components/util/popup/inputs-pad/` — `InputsPad`, `NumericPad`, `DurationPad`,
  `InputsPadProvider`

### Fixed along the way

- The two-tap-to-open lag (`modals/routine/index.tsx:52`) — the `ExerciseEditor`
  `shouldRender` delay and the hardcoded `height * 0.65` both disappear with the
  component swap.
- Empty-state copy: "workout" → "routine", and no longer instructs the user to
  press a button that has moved.
- The live workout's missing empty state — an empty workout currently renders a
  blank Edit tab.

## Directory layout

Routine code currently lives in three trees:

- `components/pages/routine/` — the Routines list
- `components/modals/routine/` — the actual builder
- `components/popup/routine/` — the name editor

The name editor tree disappears with `MetaEditor`. The list stays in `pages/`,
the builder stays in `modals/`. No broader reorganisation is in scope.

## Out of scope

- The Routines list screen itself (rows, empty state, ordering)
- The completed-workout screens
- Any change to the `Routine` / `ExercisePlan` / `SetPlan` data model
- Routine duplication, templates, or scheduling

## Verification

Because there is no test suite for these screens, verification is by driving the
app on a simulator:

1. Open an existing routine — opens on first tap, shows exercises with sets inline.
2. Edit a weight/reps/duration — the compact `EditSetSheet` appears, not a keypad.
3. Add and delete a set via `+ Add Set` and swipe.
4. Open a per-exercise `⋮` — all five items present; Edit Note persists a note.
5. Reorder exercises via the sheet.
6. `⋮` → Edit Name — renames and persists.
7. `⋮` → Start Routine — starts a live workout from the routine.
8. Tap `+` — the Name Routine sheet auto-presents with the input focused.
9. Enter a name, Continue — lands on AddExercises; the routine appears in the
   list under that name.
10. Tap `+`, dismiss the sheet, back out immediately — **no** empty routine in
    the list.
11. Tap `+`, dismiss the sheet, add an exercise, back out — routine is saved as
    "New Routine" with that exercise.
12. Tap `+`, enter only whitespace, Continue — treated as a dismissal.
13. Delete the last exercise from a routine — the empty state appears with a
    working "Add Exercises" button.
14. Start an empty live workout — the same empty state appears, worded "workout".
15. Confirm the live workout screens still behave identically after the shared
    extraction.

Run on a simulator other than the iPhone 17 (in use by another project) and on
Metro port 8082 — port 8081 is occupied by the `skim` project, and attaching to
it loads the wrong bundle and crashes the app in `WorkletsModule`.
