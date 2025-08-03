import Hero from "@/components/Hero";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import StickyWaitlist from "@/components/StickyWaitlist";

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Hero />

      {/* Feature Section 1 */}
      <FeatureSection
        title="Workout tracking made"
        subtitle="delightful"
        description="Logging sets and reps shouldn't feel like a chore. With clean controls and a rewarding sound after every set, tracking becomes something you look forward to, not something to tolerate."
        // imageSrc="/screenshots/workout-tracking.png"
        videoSrc="/assets/live-workout.mov"
      />

      {/* Feature Section 2 */}
      <FeatureSection
        title="Progress you can feel"
        subtitle="and see"
        description="See your strength evolve across reps, weight, and rest."
        videoSrc="/assets/progress.mov"
        isReversed={true}
      />

      {/* Feature Section 3 */}
      <FeatureSection
        title="Momentum you don't want to"
        subtitle="break"
        description="That feeling when you don't want to break your streak? That's by design. Built to addict you to the process."
        videoSrc="/assets/consistency.mov"
      />

      <Footer />
      <StickyWaitlist />
    </main>
  );
}
