import Home from "@/components/home";
import { LiveIndicatorProvider } from "@/components/live";

export default function () {
  return (
    <LiveIndicatorProvider>
      <Home />
    </LiveIndicatorProvider>
  );
}
