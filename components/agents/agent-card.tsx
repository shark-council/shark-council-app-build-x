"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { erc8004Config } from "@/config/erc8004";
import { Erc8004Agent } from "@/types/erc8004";
import {
  ExternalLinkIcon,
  MessageSquareTextIcon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";

export function AgentCard(props: { agent: Erc8004Agent }) {
  const explorerLink = `${erc8004Config.explorerBaseUrl}/${props.agent.token_id}`;

  const stopPropagation = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  const stopSelectionHotkeys = (
    event: React.KeyboardEvent<HTMLAnchorElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.stopPropagation();
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-4">
      <div className="flex flex-row gap-4">
        {/* Image */}
        <Avatar className="size-12">
          <AvatarImage src={props.agent.image_url} alt={props.agent.name} />
          <AvatarFallback className="bg-accent text-accent-foreground">
            {props.agent.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Content */}
        <div className="w-full">
          <p className="font-bold">{props.agent.name}</p>
          <p className="text-sm text-muted-foreground">
            {props.agent.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {props.agent.total_feedbacks > 0 ? (
              <>
                <Badge variant="default" className="gap-1.5">
                  <StarIcon className="size-3 fill-current" />
                  {props.agent.average_score}
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <MessageSquareTextIcon className="size-3" />
                  {props.agent.total_feedbacks}{" "}
                  {props.agent.total_feedbacks === 1 ? "review" : "reviews"}
                </Badge>
              </>
            ) : (
              <Badge variant="outline">No feedback yet</Badge>
            )}
          </div>
          <Separator className="mt-4" />
          <Link
            href={explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stopPropagation}
            onKeyDown={stopSelectionHotkeys}
            className="flex items-center gap-1 mt-4 text-sm text-primary hover:underline"
          >
            ERC-8004 Explorer
            <ExternalLinkIcon className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
