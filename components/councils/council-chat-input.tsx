import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { SendIcon } from "lucide-react";
import { useRef } from "react";
import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";

export function CouncilChatInput(props: {
  onSend: (message: string) => void;
  disabled: boolean;
  className?: ClassValue;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    const value = textareaRef.current?.value.trim();
    if (!value || props.disabled) {
      return;
    }
    props.onSend(value);
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col items-start gap-2", props.className)}>
      <Textarea
        ref={textareaRef}
        onKeyDown={handleKeyDown}
        disabled={props.disabled}
        placeholder="Write your trade idea..."
        rows={1}
      />
      <Button
        onClick={handleSubmit}
        disabled={props.disabled}
        className="py-3 px-6"
      >
        {props.disabled ? <Spinner /> : <SendIcon />}
        Send
      </Button>
    </div>
  );
}
