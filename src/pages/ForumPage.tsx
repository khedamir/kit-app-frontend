import { useState } from "react";
import { Plus, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopicCard } from "@/components/forum/TopicCard";
import { CreateTopicDialog } from "@/components/forum/CreateTopicDialog";
import { useTopics } from "@/hooks/useForum";
import type { ForumTopic } from "@/types";

export function ForumPage() {
  const [page, setPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data, isLoading, error } = useTopics(page);
  const topics = data?.topics || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Форум</h1>
          <p className="text-muted-foreground">
            Обсуждайте темы с другими участниками
          </p>
        </div>

        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Создать тему
        </Button>
      </div>

      {/* Topics List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          Ошибка загрузки тем
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Пока нет тем</h3>
          <p className="text-muted-foreground mb-4">
            Будьте первым, кто создаст тему для обсуждения
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            Создать тему
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {topics.map((topic: ForumTopic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!data.pagination.has_prev}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>

              <span className="text-sm text-muted-foreground px-4">
                {data.pagination.page} из {data.pagination.pages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!data.pagination.has_next}
                onClick={() => setPage((p) => p + 1)}
              >
                Вперёд
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Topic Dialog */}
      <CreateTopicDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
