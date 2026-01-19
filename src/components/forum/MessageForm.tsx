import { useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmojiInput } from "@/components/ui/emoji-input";
import { useCreateMessage } from "@/hooks/useForum";
import { handleError } from "@/lib/error-handler";

interface MessageFormProps {
  topicId: number;
  replyTo?: number | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export function MessageForm({
  topicId,
  replyTo,
  onCancelReply,
  disabled = false,
}: MessageFormProps) {
  const [content, setContent] = useState("");
  const createMessage = useCreateMessage(topicId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    try {
      await createMessage.mutateAsync({
        content: content.trim(),
        parent_id: replyTo ?? undefined,
      });
      
      setContent("");
      onCancelReply?.();
    } catch (error) {
      handleError(error, "MessageForm");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {replyTo && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Ответ на сообщение</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <EmojiInput
            value={content}
            onChange={setContent}
            placeholder={replyTo ? "Написать ответ..." : "Написать сообщение..."}
            multiline
            rows={2}
            disabled={disabled}
          />
        </div>
        
        <Button
          type="submit"
          size="icon"
          className="h-auto self-end"
          disabled={!content.trim() || createMessage.isPending || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

