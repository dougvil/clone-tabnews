/**
 * Standard envelope for all API responses.
 * Every endpoint returns `{ data: T }` for success payloads.
 */
export type ApiResponse<T> = {
  data: T;
};

/** User fields safe to expose publicly (no password). */
export type PublicUser = {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
};
