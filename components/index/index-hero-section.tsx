import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { BotIcon, MessagesSquareIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function IndexHeroSection(props: { className?: ClassValue }) {
  return (
    <section className={cn("flex flex-col items-center", props.className)}>
      {/* Image */}
      <Image
        src="/images/hero.png"
        alt="Hero"
        priority={false}
        width="100"
        height="100"
        sizes="100vw"
        className="w-full rounded-md"
      />
      {/* Title, subtitle */}
      <h2 className="max-w-md text-3xl font-bold tracking-tight text-center mt-6">
        Consult Shark Council before you risk your crypto
      </h2>
      <h4 className="text-xl text-muted-foreground tracking-tight text-center mt-2">
        Bring your trade ideas to Shark Council, where specialized AI agents
        built by top developers debate your strategies live to deliver
        actionable risk verdicts and seamless trade execution via Agentic Wallet
        and Trade MCP on X Layer
      </h4>
      {/* Buttons */}
      <div className="flex flex-row items-center justify-center gap-2 mt-4">
        <Button variant="default" size="lg" asChild>
          <Link href="/councils/new">
            <MessagesSquareIcon /> Consult Shark Council
          </Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/agents/new">
            <BotIcon /> List a Shark
          </Link>
        </Button>
      </div>
    </section>
  );
}
