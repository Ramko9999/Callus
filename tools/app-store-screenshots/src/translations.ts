// Callus App Store screenshot copy.
// English only for now.

export type SlideId =
  | "live-workout"
  | "log-sets"
  | "progress"
  | "consistency";

export type SlideContent = {
  id: SlideId;
  label: string; // editor-only label in the preview grid
  headline: string;
  subhead: string;
};

export const SLIDES: SlideContent[] = [
  {
    id: "live-workout",
    label: "1 · Live Workout",
    headline: "Workout tracking made delightful",
    subhead: "Clean controls and a rewarding ring after every set",
  },
  {
    id: "log-sets",
    label: "2 · Log Sets",
    headline: "Log every set in a tap",
    subhead: "Weight, reps, and rest — without breaking your flow",
  },
  {
    id: "progress",
    label: "3 · Progress",
    headline: "Progress you can feel and see",
    subhead: "Watch your strength climb across reps, weight, and rest",
  },
  {
    id: "consistency",
    label: "4 · Consistency",
    headline: "Momentum you don't want to break",
    subhead: "Streaks and history that keep you coming back",
  },
];
