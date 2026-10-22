import {
  AdminUsers,
  AdminUserDetails,
  AdminUsersQuery,
} from '@mood-trip/validators';
import { apiClient } from '../_common/client';

export async function getUsers(query: AdminUsersQuery): Promise<AdminUsers> {
  const params = new URLSearchParams({
    page: query.page.toString(),
    limit: query.limit.toString(),
  });

  if (query.search) {
    params.set('search', query.search);
  }

  return apiClient<AdminUsers>(`/admin/users?${params.toString()}`);
}

export async function getUserDetails(id: string): Promise<AdminUserDetails> {
  return apiClient<AdminUserDetails>(`/admin/users/${id}`, {
    method: 'GET',
  });
}