import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChatMessageRole, ChatUiMessage } from "@/types/chat";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ROLE_LABELS: Record<ChatMessageRole, string> = {
  user: "You",
  orchestrator: "Orchestrator",
  "sentiment-expert": "Sentiment Expert",
  "technical-expert": "Technical Expert",
};

const ROLE_AVATARS: Record<ChatMessageRole, string | null> = {
  user: null,
  orchestrator: "/images/avatars/great-white-shark.png",
  "technical-expert": "/images/avatars/hammerhead-shark.png",
  "sentiment-expert": "/images/avatars/megalodon-shark.png",
};

const ROLE_BADGE_STYLES: Record<ChatMessageRole, string> = {
  user: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
  orchestrator: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
  "sentiment-expert": "bg-green-500/20 text-green-400 hover:bg-green-500/30",
  "technical-expert": "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
};

export function CouncilChatMessage(props: { message: ChatUiMessage }) {
  const isFinal = props.message.type === "final";
  const isToolCall = props.message.type === "tool-call";

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg p-4 border",
        isFinal && " border-purple-500/40 bg-purple-500/5",
        isToolCall && "opacity-60",
      )}
    >
      <Avatar className="size-12">
        {ROLE_AVATARS[props.message.role] ? (
          <AvatarImage
            src={ROLE_AVATARS[props.message.role]!}
            alt={ROLE_LABELS[props.message.role]}
          />
        ) : null}
        <AvatarFallback className="bg-primary">
          {props.message.role === "user" ? (
            <User className="text-primary-foreground" />
          ) : (
            <Bot className="text-primary-foreground" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(ROLE_BADGE_STYLES[props.message.role])}
          >
            {ROLE_LABELS[props.message.role]}
          </Badge>
          {isFinal && (
            <span className="text-xs text-muted-foreground font-medium">
              Final Answer
            </span>
          )}
          {isToolCall && (
            <span className="text-xs text-muted-foreground italic">
              Thinking / Calling tool...
            </span>
          )}
        </div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="text-sm leading-relaxed mt-1">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
                {children}
              </ol>
            ),
            li: ({ children }) => <li>{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            code: ({ children }) => (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="mt-2 overflow-x-auto rounded-md border bg-muted/50 p-3 text-xs">
                {children}
              </pre>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="mt-2 border-l-2 border-border pl-3 text-muted-foreground">
                {children}
              </blockquote>
            ),
          }}
        >
          {props.message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
