import { WorkoutPlan, SetPlan, Difficulty } from "@/interface";

function repeat(difficulty: Difficulty, n: number): SetPlan[] {
  return Array(n).fill({ difficulty });
}

export const PUSH: WorkoutPlan = {
  name: "Push Day",
  exercises: [
    {
      name: "Weighted Dip",
      rest: 180,
      sets: [
        { difficulty: { weight: 20, reps: 3 } },
        { difficulty: { weight: 20, reps: 3 } },
        { difficulty: { weight: 20, reps: 3 } },
        { difficulty: { weight: 20, reps: 3 } },
        { difficulty: { weight: 20, reps: 3 } },
        { difficulty: { weight: 20, reps: 3 } },
      ],
    },
    {
      name: "Pike Push-Up",
      rest: 180,
      sets: [
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
      ],
    },
    {
      name: "Dip",
      rest: 180,
      sets: [
        { difficulty: { reps: 6 } },
        { difficulty: { reps: 6 } },
        { difficulty: { reps: 6 } },
        { difficulty: { reps: 6 } },
      ],
    },
    {
      name: "Dumbbell Shoulder Press",
      rest: 90,
      sets: [
        { difficulty: { weight: 25, reps: 8 } },
        { difficulty: { weight: 25, reps: 8 } },
        { difficulty: { weight: 25, reps: 8 } },
        { difficulty: { weight: 25, reps: 8 } },
      ],
    },
    {
      name: "Ring Push-Up",
      rest: 120,
      sets: [
        { difficulty: { reps: 6 } },
        { difficulty: { reps: 6 } },
        { difficulty: { reps: 6 } },
      ],
    },
    {
      name: "Ring Overhead Extension",
      rest: 90,
      sets: [
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
      ],
    },
    {
      name: "Dumbbell Lateral Raise",
      rest: 90,
      sets: [
        { difficulty: { weight: 7.5, reps: 30 } },
        { difficulty: { weight: 7.5, reps: 30 } },
        { difficulty: { weight: 7.5, reps: 30 } },
      ],
    },
  ],
};

export const PULL: WorkoutPlan = {
  name: "Pull Day",
  exercises: [
    {
      name: "Weighted Pull-Up",
      rest: 180,
      sets: [
        { difficulty: { reps: 5, weight: 30 } },
        { difficulty: { reps: 5, weight: 30 } },
        { difficulty: { reps: 5, weight: 30 } },
        { difficulty: { reps: 5, weight: 30 } },
        { difficulty: { reps: 5, weight: 30 } },
      ],
    },
    {
      name: "Pull-Up",
      rest: 180,
      sets: [
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
      ],
    },
    {
      name: "Chin-Up",
      rest: 180,
      sets: [{ difficulty: { reps: 8 } }, { difficulty: { reps: 8 } }],
    },
    {
      name: "Ring Row",
      rest: 120,
      sets: [
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
      ],
    },
    {
      name: "Ring Arc Row",
      rest: 120,
      sets: [
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
      ],
    },
    {
      name: "Ring Face Pull",
      rest: 120,
      sets: [
        { difficulty: { reps: 10 } },
        { difficulty: { reps: 10 } },
        { difficulty: { reps: 10 } },
      ],
    },
    {
      name: "Barbell Curl",
      rest: 120,
      sets: [
        { difficulty: { weight: 50, reps: 8 } },
        { difficulty: { weight: 50, reps: 8 } },
        { difficulty: { weight: 50, reps: 8 } },
      ],
    },
  ],
};

export const VOLUME_PULL: WorkoutPlan = {
  name: "Volume Pull",
  exercises: [
    {
      name: "Pull-Up",
      rest: 90,
      sets: Array(8).fill({ ...{ difficulty: { reps: 6 } } }),
    },
    {
      name: "Chin-Up",
      rest: 90,
      sets: Array(8).fill({ ...{ difficulty: { reps: 6 } } }),
    },
    {
      name: "Hammer Curl",
      rest: 60,
      sets: Array(3).fill({ ...{ difficulty: { weight: 15, reps: 10 } } }),
    },
    {
      name: "Barbell Curl",
      rest: 75,
      sets: Array(4).fill({ ...{ difficulty: { weight: 45, reps: 6 } } }),
    },
    {
      name: "Ring Row",
      rest: 60,
      sets: Array(4).fill({ ...{ difficulty: { reps: 8 } } }),
    },
    {
      name: "Ring Arc Row",
      rest: 75,
      sets: [
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
        { difficulty: { reps: 8 } },
      ],
    },
    {
      name: "Ring Face Pull",
      rest: 60,
      sets: [
        { difficulty: { reps: 10 } },
        { difficulty: { reps: 10 } },
        { difficulty: { reps: 10 } },
      ],
    },
  ],
};

export const VOLUME_PUSH: WorkoutPlan = {
  name: "Volume Push",
  exercises: [
    {
      name: "Dip",
      rest: 90,
      sets: repeat({ reps: 6 }, 10),
    },
    {
      name: "Pike Push-Up",
      rest: 90,
      sets: repeat({ reps: 6 }, 5),
    },
    {
      name: "Push-Up",
      rest: 60,
      sets: repeat({ reps: 12 }, 4),
    },
    {
      name: "Dumbbell Shoulder Press",
      rest: 60,
      sets: [
        { difficulty: { weight: 22.5, reps: 8 } },
        { difficulty: { weight: 22.5, reps: 8 } },
        { difficulty: { weight: 22.5, reps: 8 } },
        { difficulty: { weight: 22.5, reps: 8 } },
      ],
    },
    {
      name: "Ring Overhead Extension",
      rest: 60,
      sets: [
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
      ],
    },
    {
      name: "Dumbbell Lateral Raise",
      rest: 60,
      sets: [
        { difficulty: { weight: 7.5, reps: 15 } },
        { difficulty: { weight: 7.5, reps: 15 } },
        { difficulty: { weight: 7.5, reps: 15 } },
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
        { difficulty: { weight: 180, reps: 6 } },
        { difficulty: { weight: 180, reps: 6 } },
        { difficulty: { weight: 180, reps: 6 } },
        { difficulty: { weight: 180, reps: 6 } },
      ],
    },
    {
      name: "Deadlift",
      rest: 180,
      sets: [
        { difficulty: { weight: 225, reps: 6 } },
        { difficulty: { weight: 225, reps: 6 } },
        { difficulty: { weight: 225, reps: 6 } },
      ],
    },
    {
      name: "Pistol Squat",
      rest: 90,
      sets: [
        { difficulty: { reps: 7 } },
        { difficulty: { reps: 7 } },
        { difficulty: { reps: 7 } },
      ],
    },
    {
      name: "Hanging Knee Raise",
      rest: 90,
      sets: [
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
      ],
    },
    {
      name: "Hip Thrust",
      rest: 90,
      sets: [
        { difficulty: { weight: 60, reps: 10 } },
        { difficulty: { weight: 60, reps: 10 } },
        { difficulty: { weight: 60, reps: 10 } },
      ],
    },
    {
      name: "Hollow Body Hold",
      rest: 90,
      sets: [
        { difficulty: { duration: 45 } },
        { difficulty: { duration: 45 } },
        { difficulty: { duration: 45 } },
      ],
    },
    {
      name: "Landmine 180",
      rest: 90,
      sets: [
        { difficulty: { reps: 10, weight: 45 } },
        { difficulty: { reps: 10, weight: 45 } },
        { difficulty: { reps: 10, weight: 45 } },
      ],
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
        { difficulty: { weight: 165, reps: 4 } },
        { difficulty: { weight: 165, reps: 4 } },
        { difficulty: { weight: 165, reps: 4 } },
        { difficulty: { weight: 165, reps: 4 } },
        { difficulty: { weight: 165, reps: 4 } },
        { difficulty: { weight: 165, reps: 4 } },
      ],
    },
    {
      name: "Deadlift",
      rest: 180,
      sets: [
        { difficulty: { weight: 205, reps: 4 } },
        { difficulty: { weight: 205, reps: 4 } },
        { difficulty: { weight: 205, reps: 4 } },
      ],
    },
    {
      name: "Pistol Squat",
      rest: 90,
      sets: [
        { difficulty: { reps: 7 } },
        { difficulty: { reps: 7 } },
        { difficulty: { reps: 7 } },
      ],
    },
    {
      name: "Hanging Knee Raise",
      rest: 90,
      sets: [
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
      ],
    },
    {
      name: "Hip Thrust",
      rest: 90,
      sets: [
        { difficulty: { weight: 60, reps: 10 } },
        { difficulty: { weight: 60, reps: 10 } },
        { difficulty: { weight: 60, reps: 10 } },
      ],
    },
    {
      name: "Hollow Body Hold",
      rest: 90,
      sets: [
        { difficulty: { duration: 45 } },
        { difficulty: { duration: 45 } },
        { difficulty: { duration: 45 } },
      ],
    },
    {
      name: "Landmine 180",
      rest: 90,
      sets: [
        { difficulty: { reps: 10, weight: 45 } },
        { difficulty: { reps: 10, weight: 45 } },
        { difficulty: { reps: 10, weight: 45 } },
      ],
    },
  ],
};

export const FUNCTIONAL_LEG: WorkoutPlan = {
  name: "Functional Leg",
  exercises: [
    {
      name: "Zercher Squat",
      rest: 90,
      sets: repeat({weight: 95, reps: 8}, 4)
    },
    {
      name: "Deadlift",
      rest: 120,
      sets: [
        { difficulty: { weight: 185, reps: 6 } },
        { difficulty: { weight: 205, reps: 6 } },
        { difficulty: { weight: 225, reps: 6 } },
        { difficulty: { weight: 245, reps: 4 } },
      ]
    },
    {
      name: "Hanging Knee Raise",
      rest: 60,
      sets: [
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
        { difficulty: { reps: 15 } },
      ],
    },
    {
      name: "Hollow Body Hold",
      rest: 60,
      sets: [
        { difficulty: { duration: 45 } },
        { difficulty: { duration: 45 } },
        { difficulty: { duration: 45 } },
      ],
    },
    {
      name: "Landmine 180",
      rest: 60,
      sets: [
        { difficulty: { reps: 10, weight: 45 } },
        { difficulty: { reps: 10, weight: 45 } },
        { difficulty: { reps: 10, weight: 45 } },
      ],
    },
  ]
}

export const NECK = {
  name: "Auxillary Neck Work",
  exercises: [
    {
      name: "Neck Flexion",
      rest: 60,
      sets: [
        { difficulty: { reps: 20, weight: 0 } },
        { difficulty: { reps: 20, weight: 0 } },
      ],
    },
    {
      name: "Neck Extension",
      rest: 60,
      sets: [
        { difficulty: { weight: 2.5, reps: 20 } },
        { difficulty: { weight: 5, reps: 20 } },
      ],
    },
    {
      name: "Neck Side Flexion",
      rest: 60,
      sets: [{ difficulty: { weight: 0, reps: 25 } }],
    },
  ],
};

export const PUSH_PULL_LEGS_PROGRAM = {
  name: "Push Pull Legs",
  id: "Push Pull Legs",
  skippedDays: [],
};
