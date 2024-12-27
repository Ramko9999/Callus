
export function getBrzyckiMaxEstimate(weight: number, reps: number): number {
    return (weight * 36) / (37 - reps);
}