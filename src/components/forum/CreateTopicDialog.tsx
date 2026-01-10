import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmojiInput } from "@/components/ui/emoji-input";
import { useCreateTopic } from "@/hooks/useForum";

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTopicDialog({ open, onOpenChange }: CreateTopicDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const createTopic = useCreateTopic();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    try {
      await createTopic.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create topic:", error);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleClose} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Создать тему</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название темы</Label>
            <EmojiInput
              value={title}
              onChange={setTitle}
              placeholder="О чём хотите поговорить?"
              maxLength={255}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Описание{" "}
              <span className="text-muted-foreground font-normal">
                (необязательно)
              </span>
            </Label>
            <EmojiInput
              value={description}
              onChange={setDescription}
              placeholder="Расскажите подробнее..."
              multiline
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createTopic.isPending}
            >
              <Plus className="h-4 w-4" />
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

