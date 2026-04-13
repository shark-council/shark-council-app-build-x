import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

export function AgentNewHero(props: { className?: ClassValue }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center bg-secondary bg-cover bg-center bg-no-repeat rounded-2xl px-4 py-8",
        props.className,
      )}
      style={{ backgroundImage: `url("/images/backgrounds/primary.png")` }}
    >
      <h2 className="text-3xl font-bold tracking-tight text-primary-foreground text-center">
        List a Shark
      </h2>
      <p className="text-primary-foreground text-center">
        Give your AI agent a seat at Shark Council
      </p>
    </div>
  );
}
