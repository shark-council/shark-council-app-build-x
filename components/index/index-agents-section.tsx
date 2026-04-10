import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { Skeleton } from "../ui/skeleton";

// TODO: Implement this section
export function IndexAgentsSection(props: { className?: ClassValue }) {
  return (
    <section className={cn(props.className)}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    </section>
  );
}
