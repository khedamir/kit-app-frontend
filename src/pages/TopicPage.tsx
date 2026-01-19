import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmojiInput } from "@/components/ui/emoji-input";
import { MessageItem } from "@/components/forum/MessageItem";
import { MessageForm } from "@/components/forum/MessageForm";
import { AuthorBadge } from "@/components/forum/AuthorBadge";
import { useMessages, useUpdateTopic, useDeleteTopic } from "@/hooks/useForum";
import { useAuthStore } from "@/store/auth";
import { handleError } from "@/lib/error-handler";
import { formatFullDate } from "@/lib/date-utils";
import type { ForumMessage } from "@/types";

export function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [page, setPage] = useState(1);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const { data, isLoading, error } = useMessages(Number(topicId), page);
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();

  const topic = data?.topic;
  const messages = data?.messages ?? [];
  const pagination = data?.pagination;

  const isAuthor = topic?.author.id === user?.id;
  const isAdmin = user?.role === "admin";
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;

  const handleOpenEdit = () => {
    if (!topic) return;
    setEditTitle(topic.title);
    setEditDescription(topic.description || "");
    setShowEditDialog(true);
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    if (!topic || !editTitle.trim()) return;

    try {
      await updateTopic.mutateAsync({
        topicId: topic.id,
        input: {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
        },
      });
      setShowEditDialog(false);
    } catch (error) {
      handleError(error, "TopicPage.updateTopic");
    }
  };

  const handleDelete = async () => {
    if (!topic) return;

    try {
      await deleteTopic.mutateAsync(topic.id);
      navigate("/forum");
    } catch (error) {
      handleError(error, "TopicPage.deleteTopic");
    }
  };

  const handleTogglePin = async () => {
    if (!topic) return;
    setShowMenu(false);

    try {
      await updateTopic.mutateAsync({
        topicId: topic.id,
        input: { is_pinned: !topic.is_pinned },
      });
    } catch (error) {
      handleError(error, "TopicPage.togglePin");
    }
  };

  const handleToggleClose = async () => {
    if (!topic) return;
    setShowMenu(false);

    try {
      await updateTopic.mutateAsync({
        topicId: topic.id,
        input: { is_closed: !topic.is_closed },
      });
    } catch (error) {
      handleError(error, "TopicPage.toggleClose");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-32 bg-muted/50 rounded animate-pulse" />
        <div className="h-32 bg-muted/50 rounded-xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-muted/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-destructive mb-4">Тема не найдена</p>
        <Link
          to="/forum"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться к форуму
        </Link>
      </div>
    );
  }

  const authorName = topic.author.name || topic.author.email;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)] md:h-auto md:min-h-0">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto md:overflow-visible space-y-6 pb-28 md:pb-6">
        <Link
          to="/forum"
          className="-ml-2 inline-flex items-center gap-2 h-8 px-3 rounded-md text-xs font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к форуму
        </Link>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {topic.is_pinned && (
                    <Badge variant="secondary" className="gap-1">
                      <Pin className="h-3 w-3" />
                      Закреплено
                    </Badge>
                  )}
                  {topic.is_closed && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Закрыто
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl font-bold">{topic.title}</h1>
              </div>

              {canEdit && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10 py-1">
                      <button
                        className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                        onClick={handleOpenEdit}
                      >
                        <Pencil className="h-4 w-4" />
                        Редактировать
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                            onClick={handleTogglePin}
                          >
                            {topic.is_pinned ? (
                              <>
                                <PinOff className="h-4 w-4" />
                                Открепить
                              </>
                            ) : (
                              <>
                                <Pin className="h-4 w-4" />
                                Закрепить
                              </>
                            )}
                          </button>
                          <button
                            className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                            onClick={handleToggleClose}
                          >
                            {topic.is_closed ? (
                              <>
                                <Unlock className="h-4 w-4" />
                                Открыть тему
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4" />
                                Закрыть тему
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {canDelete && (
                        <button
                          className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive"
                          onClick={() => {
                            setShowMenu(false);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Удалить тему
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          {topic.description && (
            <CardContent className="pt-0 pb-4">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {topic.description}
              </p>
            </CardContent>
          )}

          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AuthorBadge name={authorName} role={topic.author.role} />
              <span>•</span>
              <span>{formatFullDate(topic.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Desktop message form - shown at top on desktop */}
        <div className="hidden md:block">
          {topic.is_closed ? (
            <Card className="bg-muted/30">
              <CardContent className="py-4 text-center text-muted-foreground">
                <Lock className="h-5 w-5 mx-auto mb-2" />
                Тема закрыта для новых сообщений
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-4">
                <MessageForm
                  topicId={topic.id}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold">
            Сообщения ({pagination?.total ?? 0})
          </h2>

          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Пока нет сообщений. Будьте первым!
            </p>
          ) : (
            <div className="space-y-6">
              {messages.map((message: ForumMessage) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  topicId={topic.id}
                  onReply={topic.is_closed ? undefined : setReplyTo}
                />
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_prev}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                {pagination.page} из {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_next}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed message form at bottom - mobile only */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-background pt-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-4 border-t border-border/50 z-50">
        {topic.is_closed ? (
          <Card className="bg-muted/30">
            <CardContent className="py-4 text-center text-muted-foreground">
              <Lock className="h-5 w-5 mx-auto mb-2" />
              Тема закрыта для новых сообщений
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-4">
              <MessageForm
                topicId={topic.id}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent onClose={() => setShowEditDialog(false)}>
          <DialogHeader>
            <DialogTitle>Редактировать тему</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <EmojiInput
                value={editTitle}
                onChange={setEditTitle}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <EmojiInput
                value={editDescription}
                onChange={setEditDescription}
                multiline
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim() || updateTopic.isPending}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClose={() => setShowDeleteDialog(false)}>
          <DialogHeader>
            <DialogTitle>Удалить тему?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Тема и все сообщения будут удалены
              навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTopic.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
