import { apiClient } from "@/lib/api/client";
import type { User } from "@mood-trip/validators";

export async function getUser(id: string): Promise<User> {
  return apiClient<User>(`/user/${id}`);
}