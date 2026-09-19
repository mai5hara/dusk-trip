import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isAdmin: z.boolean(),
});

export type User = z.infer<typeof userSchema>;

export const adminUserListItemSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isAdmin: z.boolean(),
});

export const adminUserDetailsSchema = adminUserListItemSchema.extend({
  tripCount: z.number(),
  itineraryCount: z.number(),
});

export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;

export type AdminUserDetails = z.infer<typeof adminUserDetailsSchema>;

export const adminUsersSchema = z.object({
  users: z.array(adminUserListItemSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type AdminUsers = z.infer<typeof adminUsersSchema>;

export const adminUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().min(2).max(120).optional(),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
