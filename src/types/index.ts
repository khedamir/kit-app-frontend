// User & Auth
export interface User {
  id: number;
  email: string;
  role: "student" | "admin";
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

// Student Profile
export interface StudentProfile {
  id: number;
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  group_name: string | null;
}

export interface StudentProfileUpdate {
  first_name?: string;
  last_name?: string;
  group_name?: string;
}

// Справочники
export interface SkillCategory {
  id: number;
  name: string;
}

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
}

export interface Interest {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
}

// Student Questionnaire
export interface StudentSkill {
  id: number;
  name: string;
  level: number;
  category: SkillCategory;
}

export interface SkillInput {
  skill_id: number;
  level: number;
}

// Skill Map (полная карта студента)
export interface SkillMap {
  profile: StudentProfile;
  interests: Interest[];
  roles: Role[];
  skills: StudentSkill[];
}

// Admin Profile
export interface AdminProfile {
  id: number;
  user_id: number;
  email: string;
  full_name: string | null;
  position: string | null;
}

export interface AdminProfileUpdate {
  full_name?: string;
  position?: string;
}

// Forum
export interface ForumAuthor {
  id: number;
  email: string;
  role: "student" | "admin";
  name?: string | null;
}

export interface ForumTopic {
  id: number;
  title: string;
  description: string | null;
  is_closed: boolean;
  is_pinned: boolean;
  messages_count: number;
  author: ForumAuthor;
  created_at: string;
  updated_at: string;
}

export interface ForumMessage {
  id: number;
  content: string;
  topic_id: number;
  parent_id: number | null;
  is_edited: boolean;
  author: ForumAuthor;
  created_at: string;
  updated_at: string;
  replies?: ForumMessage[];
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TopicsResponse {
  topics: ForumTopic[];
  pagination: Pagination;
}

export interface MessagesResponse {
  topic: ForumTopic;
  messages: ForumMessage[];
  pagination: Pagination;
}

export interface CreateTopicInput {
  title: string;
  description?: string;
}

export interface UpdateTopicInput {
  title?: string;
  description?: string;
  is_closed?: boolean;
  is_pinned?: boolean;
}

export interface CreateMessageInput {
  content: string;
  parent_id?: number;
}

export interface UpdateMessageInput {
  content: string;
}