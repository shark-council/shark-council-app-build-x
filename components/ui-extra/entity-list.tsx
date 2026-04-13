import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { ReactNode } from "react";

export default function EntityList<T>(props: {
  entities: T[];
  renderEntityCard: (entity: T, index: number) => ReactNode;
  noEntitiesCard: ReactNode;
  className?: ClassValue;
}) {
  return (
    <div className={cn("flex flex-col gap-4", props.className)}>
      {props.entities.length > 0 &&
        props.entities.map((entity, index) =>
          props.renderEntityCard(entity, index),
        )}
      {props.entities.length === 0 && props.noEntitiesCard}
    </div>
  );
}
