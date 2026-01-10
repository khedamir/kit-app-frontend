import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from "@/api/forum";
import type {
  CreateTopicInput,
  UpdateTopicInput,
  CreateMessageInput,
  UpdateMessageInput,
  ForumMessage,
  ForumTopic,
  TopicsResponse,
  MessagesResponse,
} from "@/types";
import { useAuthStore } from "@/store/auth";

// Время в минутах для редактирования/удаления
const MESSAGE_EDIT_WINDOW_MINUTES = 30;

// Хелперы для проверки прав
export function canEditMessage(message: ForumMessage, userId?: number, userRole?: string): boolean {
  if (!userId) return false;
  if (message.author.id !== userId) return false;
  
  // Админ-автор может редактировать без ограничений
  if (userRole === "admin") return true;
  
  // Обычный автор - только в течение 30 минут
  const createdAt = new Date(message.created_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  return diffMinutes <= MESSAGE_EDIT_WINDOW_MINUTES;
}

export function canDeleteMessage(message: ForumMessage, userId?: number, userRole?: string): boolean {
  if (!userId) return false;
  
  // Админ может удалить любое сообщение
  if (userRole === "admin") return true;
  
  // Не автор - не может удалить
  if (message.author.id !== userId) return false;
  
  // Автор может удалить только в течение 30 минут
  const createdAt = new Date(message.created_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  return diffMinutes <= MESSAGE_EDIT_WINDOW_MINUTES;
}

// Query keys
export const forumKeys = {
  all: ["forum"] as const,
  topics: () => [...forumKeys.all, "topics"] as const,
  topicsList: (page: number) => [...forumKeys.topics(), { page }] as const,
  topic: (id: number) => [...forumKeys.all, "topic", id] as const,
  messages: (topicId: number) => [...forumKeys.all, "messages", topicId] as const,
  messagesList: (topicId: number, page: number) => [...forumKeys.messages(topicId), { page }] as const,
};

// Hooks
export function useTopics(page = 1) {
  return useQuery<TopicsResponse>({
    queryKey: forumKeys.topicsList(page),
    queryFn: () => getTopics(page),
  });
}

export function useTopic(topicId: number) {
  return useQuery<ForumTopic>({
    queryKey: forumKeys.topic(topicId),
    queryFn: () => getTopic(topicId),
    enabled: !!topicId,
  });
}

export function useMessages(topicId: number, page = 1) {
  return useQuery<MessagesResponse>({
    queryKey: forumKeys.messagesList(topicId, page),
    queryFn: () => getMessages(topicId, page),
    enabled: !!topicId,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateTopicInput) => createTopic(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ topicId, input }: { topicId: number; input: UpdateTopicInput }) =>
      updateTopic(topicId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
      queryClient.setQueryData(forumKeys.topic(data.id), data);
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (topicId: number) => deleteTopic(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
  });
}

export function useCreateMessage(topicId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateMessageInput) => createMessage(topicId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.messages(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
  });
}

export function useUpdateMessage(topicId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, input }: { messageId: number; input: UpdateMessageInput }) =>
      updateMessage(messageId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.messages(topicId) });
    },
  });
}

export function useDeleteMessage(topicId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: number) => deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.messages(topicId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.topics() });
    },
  });
}

// Хук для проверки прав текущего пользователя
export function useMessagePermissions(message: ForumMessage) {
  const { user } = useAuthStore();
  
  return {
    canEdit: canEditMessage(message, user?.id, user?.role),
    canDelete: canDeleteMessage(message, user?.id, user?.role),
  };
}

