import { useState } from "react";
import { Pencil, Trash2, Reply, Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmojiInput } from "@/components/ui/emoji-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMessagePermissions, useUpdateMessage, useDeleteMessage } from "@/hooks/useForum";
import type { ForumMessage } from "@/types";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/date-utils";

interface MessageItemProps {
  message: ForumMessage;
  topicId: number;
  onReply?: (messageId: number) => void;
  isReply?: boolean;
}

export function MessageItem({ message, topicId, onReply, isReply = false }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { canEdit, canDelete } = useMessagePermissions(message);
  const updateMessage = useUpdateMessage(topicId);
  const deleteMessage = useDeleteMessage(topicId);

  const authorName = message.author.name || message.author.email;
  const isAdmin = message.author.role === "admin";
  const initials = authorName.substring(0, 2).toUpperCase();

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    try {
      await updateMessage.mutateAsync({
        messageId: message.id,
        input: { content: editContent.trim() },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessage.mutateAsync(message.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={cn("group", isReply && "ml-10 mt-3")}>
      <div className="flex gap-3">
        <Avatar className={cn("shrink-0", isReply ? "h-7 w-7" : "h-9 w-9")}>
          <AvatarFallback
            className={cn(
              "text-xs",
              isAdmin ? "bg-primary/20 text-primary" : "bg-muted"
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-sm font-medium", isAdmin && "text-primary")}>
              {authorName}
            </span>
            {isAdmin && <Shield className="h-3 w-3 text-primary" />}
            <span className="text-xs text-muted-foreground">
              {formatShortDate(message.created_at)}
            </span>
            {message.is_edited && (
              <span className="text-xs text-muted-foreground">(изменено)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <EmojiInput
                value={editContent}
                onChange={setEditContent}
                multiline
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || updateMessage.isPending}
                >
                  <Check className="h-4 w-4" />
                  Сохранить
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4" />
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-1 mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {!isReply && onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={() => onReply(message.id)}
                >
                  <Reply className="h-3 w-3" />
                  Ответить
                </Button>
              )}
              
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                  Изменить
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-3 w-3" />
                  Удалить
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="space-y-3 mt-3">
          {message.replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              topicId={topicId}
              isReply
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClose={() => setShowDeleteDialog(false)}>
          <DialogHeader>
            <DialogTitle>Удалить сообщение?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Сообщение будет удалено навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMessage.isPending}
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

