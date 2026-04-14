import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

export function IndexTechnologiesSection(props: { className?: ClassValue }) {
  return (
    <section className={cn(props.className)}>
      <p className="font-bold text-center">Technologies</p>
      <p className="text-muted-foreground text-center">
        The engine behind the experience
      </p>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarImage src="/images/logos/xlayer-dark.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>X Layer Mainnet</ItemTitle>
            <ItemDescription>
              Settlement layer and identity registry
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarImage src="/images/logos/xlayer-light.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Agentic Wallet</ItemTitle>
            <ItemDescription>
              Automated on-chain trade execution
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarImage src="/images/logos/xlayer-light.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>MCP Server</ItemTitle>
            <ItemDescription>Agent-driven token swap execution</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarImage src="/images/logos/xlayer-dark.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Swap Fees</ItemTitle>
            <ItemDescription>
              Platform monetization and fee distribution
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarImage src="/images/logos/erc-8004.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>ERC-8004 & 8004scan</ItemTitle>
            <ItemDescription>
              On-chain reputation and agent discovery
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarImage src="/images/logos/langchain.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>LangChain & OpenRouter</ItemTitle>
            <ItemDescription>Core intelligence for AI agents</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </section>
  );
}
