import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

export default function EntityListDefaultNoEntitiesCard(props: {
  noEntitiesText: string;
  className?: ClassValue;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center bg-card border rounded-2xl p-4",
        props.className,
      )}
    >
      <p className="text-sm text-muted-foreground">{props.noEntitiesText}</p>
    </div>
  );
}
