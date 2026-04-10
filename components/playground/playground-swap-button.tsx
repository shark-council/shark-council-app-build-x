import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { Button } from "../ui/button";

// TODO: Implement this component
export function PlaygroundSwapButton(props: { className?: ClassValue }) {
  return <Button className={cn(props.className)}>Swap</Button>;
}
