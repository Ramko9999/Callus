import { WorkoutPlan } from "@/interface";

export const PUSH: WorkoutPlan = {
  name: "Push Day",
  exercises: [
    {
      name: "Weighted Dips",
      rest: 180,
      sets: [
        { weight: 20, reps: 3 },
        { weight: 20, reps: 3 },
        { weight: 20, reps: 3 },
        { weight: 20, reps: 3 },
        { weight: 20, reps: 3 },
        { weight: 20, reps: 3 },
      ],
    },
    {
      name: "Pike Pushups",
      rest: 180,
      sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }],
    },
    {
      name: "Dips",
      rest: 180,
      sets: [{ reps: 6 }, { reps: 6 }, { reps: 6 }, { reps: 6 }],
    },
    {
      name: "One-Handed Shoulder Press",
      rest: 90,
      sets: [
        { weight: 25, reps: 8 },
        { weight: 25, reps: 8 },
        { weight: 25, reps: 8 },
        { weight: 25, reps: 8 },
      ],
    },
    {
      name: "Ring Pushup",
      rest: 120,
      sets: [{ reps: 6 }, { reps: 6 }, { reps: 6 }],
    },
    {
      name: "Ring Tricep Extensions",
      rest: 90,
      sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }],
    },
    {
      name: "Lateral Raises",
      rest: 90,
      sets: [{ reps: 30 }, { reps: 30 }, { reps: 30 }],
    },
  ],
};

export const PULL: WorkoutPlan = {
  name: "Pull Day",
  exercises: [
    {
      name: "Weighted Pull Ups",
      rest: 180,
      sets: [
        { reps: 5, weight: 30 },
        { reps: 5, weight: 30 },
        { reps: 5, weight: 30 },
        { reps: 5, weight: 30 },
        { reps: 5, weight: 30 },
      ],
    },
    {
      name: "Pull Ups",
      rest: 180,
      sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }],
    },
    { name: "Chin Ups", rest: 180, sets: [{ reps: 8 }, { reps: 8 }] },
    {
      name: "Ring Rows",
      rest: 120,
      sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }],
    },
    {
      name: "Arc Rows",
      rest: 120,
      sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }],
    },
    {
      name: "Face Pulls",
      rest: 120,
      sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }],
    },
    {
      name: "Bicep Curls",
      rest: 120,
      sets: [
        { weight: 50, reps: 8 },
        { weight: 50, reps: 8 },
        { weight: 50, reps: 8 },
      ],
    },
  ],
};

export const NORMAL_LEG: WorkoutPlan = {
  name: "Leg Day",
  exercises: [
    {
      name: "Squat",
      rest: 180,
      sets: [
        { weight: 180, reps: 6 },
        { weight: 180, reps: 6 },
        { weight: 180, reps: 6 },
        { weight: 180, reps: 6 },
      ],
    },
    {
      name: "Deadlift",
      rest: 180,
      sets: [
        { weight: 225, reps: 6 },
        { weight: 225, reps: 6 },
        { weight: 225, reps: 6 },
      ],
    },
    {
      name: "Pistol Squats",
      rest: 90,
      sets: [{ reps: 7 }, { reps: 7 }, { reps: 7 }],
    },
    {
      name: "Knee Raises",
      rest: 90,
      sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }],
    },
    {
      name: "Hip Thrusts",
      rest: 90,
      sets: [
        { weight: 60, reps: 10 },
        { weight: 60, reps: 10 },
        { weight: 60, reps: 10 },
      ],
    },
    {
      name: "Hollow Body Holds",
      rest: 90,
      sets: [{ reps: 1 }, { reps: 1 }, { reps: 1 }],
    },
    {
      name: "Oblique Landmines",
      rest: 90,
      sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }],
    },
  ],
};

export const PAUSE_LEG: WorkoutPlan = {
  name: "Leg Day (Pause)",
  exercises: [
    {
      name: "Squat",
      rest: 150,
      sets: [
        { weight: 165, reps: 4 },
        { weight: 165, reps: 4 },
        { weight: 165, reps: 4 },
        { weight: 165, reps: 4 },
        { weight: 165, reps: 4 },
        { weight: 165, reps: 4 },
      ],
    },
    {
      name: "Deadlift",
      rest: 180,
      sets: [
        { weight: 205, reps: 4 },
        { weight: 205, reps: 4 },
        { weight: 205, reps: 4 },
      ],
    },
    {
      name: "Pistol Squats",
      rest: 90,
      sets: [{ reps: 7 }, { reps: 7 }, { reps: 7 }],
    },
    {
      name: "Knee Raises",
      rest: 90,
      sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }],
    },
    {
      name: "Hip Thrusts",
      rest: 90,
      sets: [
        { weight: 60, reps: 10 },
        { weight: 60, reps: 10 },
        { weight: 60, reps: 10 },
      ],
    },
    {
      name: "Hollow Body Holds",
      rest: 90,
      sets: [{ reps: 1 }, { reps: 1 }, { reps: 1 }],
    },
    {
      name: "Oblique Landmines",
      rest: 90,
      sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }],
    },
  ],
};


export const NECK = {
  name: "Auxillary Neck Work",
  exercises: [
    {
      name: "Neck Flexions",
      rest: 60,
      sets: [{ reps: 20 }, { reps: 20 }],
    },
    {
      name: "Neck Extensions",
      rest: 60,
      sets: [{ weight: 2.5, reps: 20 }, { weight: 5, reps: 20 }],
    },
    {
      name: "Neck Side Flexions",
      rest: 60,
      sets: [{ weight: 0, reps: 20 }],
    },
  ],
};

export const PUSH_PULL_LEGS_PROGRAM = {
  name: "Push Pull Legs",
  id: "Push Pull Legs",
  skippedDays: []
}
