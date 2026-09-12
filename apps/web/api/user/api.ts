import { apiClient } from '@/api/_common/client';
import type { UserListItem } from '@mood-trip/validators';

export async function getUser(id: string): Promise<UserListItem> {
  return apiClient<UserListItem>(`/user/${id}`);
}
