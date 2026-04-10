import { PlaygroundSwapButton } from "@/components/playground/playground-swap-button";
import { Separator } from "@/components/ui/separator";

export default function PlaygroundPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold tracking-tight">Playground</h2>
      <h4 className="text-xl text-muted-foreground tracking-tight mt-2">
        Use this page for testing and experimentation
      </h4>
      <Separator className="mt-4" />
      <div className="flex flex-col mt-4">
        <PlaygroundSwapButton />
      </div>
    </main>
  );
}
