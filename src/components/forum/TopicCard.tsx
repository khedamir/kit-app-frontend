import { Link } from "react-router-dom";
import { MessageSquare, Pin, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AuthorBadge } from "@/components/forum/AuthorBadge";
import type { ForumTopic } from "@/types";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/date-utils";

interface TopicCardProps {
  topic: ForumTopic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const authorName = topic.author.name || topic.author.email;

  return (
    <Link to={`/forum/${topic.id}`}>
      <Card
        className={cn(
          "transition-colors hover:bg-muted/30",
          topic.is_pinned && "border-primary/30 bg-primary/5"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {topic.is_pinned && (
                  <Pin className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
                {topic.is_closed && (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <h3 className="font-medium truncate">{topic.title}</h3>
              </div>

              {topic.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {topic.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <AuthorBadge
                  name={authorName}
                  role={topic.author.role}
                  size="sm"
                />
                <span>•</span>
                <span>{formatRelativeDate(topic.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">
                {topic.messages_count}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
