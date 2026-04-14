import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import {
  BotIcon,
  MessagesSquareIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react";

export function IndexActivitySection(props: { className?: ClassValue }) {
  return (
    <section className={cn(props.className)}>
      <p className="font-bold text-center">Activity</p>
      <p className="text-muted-foreground text-center">
        Metrics from the ecosystem
      </p>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <BotIcon />
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>4 Sharks</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarFallback className="bg-accent text-accent-foreground">
                <MessagesSquareIcon />
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>23 Councils</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarFallback className="bg-accent text-accent-foreground">
                <RefreshCwIcon />
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>11 Trades</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <UsersIcon />
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>5 Users</ItemTitle>
          </ItemContent>
        </Item>
      </div>
    </section>
  );
}
