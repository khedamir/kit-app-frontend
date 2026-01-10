import { apiClient } from "./client";
import type {
  ForumTopic,
  ForumMessage,
  TopicsResponse,
  MessagesResponse,
  CreateTopicInput,
  UpdateTopicInput,
  CreateMessageInput,
  UpdateMessageInput,
} from "@/types";

// Topics
export async function getTopics(
  page = 1,
  perPage = 20,
  pinnedFirst = true
): Promise<TopicsResponse> {
  const { data } = await apiClient.get<TopicsResponse>("/forum/topics", {
    params: { page, per_page: perPage, pinned_first: pinnedFirst },
  });
  return data;
}

export async function getTopic(topicId: number): Promise<ForumTopic> {
  const { data } = await apiClient.get<ForumTopic>(`/forum/topics/${topicId}`);
  return data;
}

export async function createTopic(input: CreateTopicInput): Promise<ForumTopic> {
  const { data } = await apiClient.post<ForumTopic>("/forum/topics", input);
  return data;
}

export async function updateTopic(
  topicId: number,
  input: UpdateTopicInput
): Promise<ForumTopic> {
  const { data } = await apiClient.patch<ForumTopic>(
    `/forum/topics/${topicId}`,
    input
  );
  return data;
}

export async function deleteTopic(topicId: number): Promise<void> {
  await apiClient.delete(`/forum/topics/${topicId}`);
}

// Messages
export async function getMessages(
  topicId: number,
  page = 1,
  perPage = 50
): Promise<MessagesResponse> {
  const { data } = await apiClient.get<MessagesResponse>(
    `/forum/topics/${topicId}/messages`,
    { params: { page, per_page: perPage } }
  );
  return data;
}

export async function createMessage(
  topicId: number,
  input: CreateMessageInput
): Promise<ForumMessage> {
  const { data } = await apiClient.post<ForumMessage>(
    `/forum/topics/${topicId}/messages`,
    input
  );
  return data;
}

export async function updateMessage(
  messageId: number,
  input: UpdateMessageInput
): Promise<ForumMessage> {
  const { data } = await apiClient.patch<ForumMessage>(
    `/forum/messages/${messageId}`,
    input
  );
  return data;
}

export async function deleteMessage(messageId: number): Promise<void> {
  await apiClient.delete(`/forum/messages/${messageId}`);
}

