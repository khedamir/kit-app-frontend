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
  total_points?: number;
  total_som?: number;
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

// Детальная информация о студенте (для просмотра профиля другого студента)
export interface StudentDetail extends SkillMap {}

// Student Rating
export interface RatingStudent {
  rank: number;
  id: number;
  user_id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  group_name: string | null;
  total_points: number;
  total_som: number;
}

export interface RatingResponse {
  students: RatingStudent[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

// Recommendations
export interface StudentRecommendation {
  student_id: number;
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  group_name: string | null;
  common_interests_count?: number;
  common_interests?: string[];
  roles_count?: number;
  roles?: Role[];
  match_type: "interests" | "roles";
}

export interface RecommendationsResponse {
  recommendations_by_interests: StudentRecommendation[];
  recommendations_by_interests_pagination: Pagination;
  recommendations_by_roles: StudentRecommendation[];
  recommendations_by_roles_pagination: Pagination;
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

// Admin - Student Management
export interface AdminStudentItem {
  id: number | null;
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  group_name: string | null;
  created_at: string | null;
  skills_count: number;
  interests_count: number;
  roles_count: number;
  total_points: number;
  total_som: number;
}

export interface AdminStudentsResponse {
  students: AdminStudentItem[];
  pagination: Pagination;
}

export interface AdminStudentsFilters {
  page?: number;
  per_page?: number;
  search?: string;
  group?: string;
  has_profile?: boolean;
  has_skills?: boolean;
  skill_id?: number;
  role_id?: number;
  interest_id?: number;
  sort_by?: 'email' | 'first_name' | 'last_name' | 'group_name' | 'created_at' | 'total_points' | 'total_som';
  sort_order?: 'asc' | 'desc';
}

// Admin - Filter Options
export interface FilterSkillCategory {
  category: { id: number; name: string };
  skills: { id: number; name: string }[];
}

export interface FilterRole {
  id: number;
  code: string;
  name: string;
}

export interface FilterInterest {
  id: number;
  name: string;
}

// Points System
export interface PointCategory {
  id: number;
  name: string;
  points: number;
  is_penalty: boolean;
  is_custom: boolean;
}

export interface PointTransaction {
  id: number;
  points: number;
  som_earned: number;
  description: string;
  category: {
    id: number;
    name: string;
    is_penalty: boolean;
  } | null;
  created_by: {
    id: number;
    email: string;
  } | null;
  created_at: string;
}

export interface AddPointsRequest {
  category_id: number;
  points?: number;  // только для кастомной категории
  description?: string;
}

export interface AddPointsResponse {
  message: string;
  transaction: {
    id: number;
    points: number;
    som_earned: number;
    description: string;
    created_at: string;
  };
  student: {
    id: number;
    total_points: number;
    total_som: number;
  };
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