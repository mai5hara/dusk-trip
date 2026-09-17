import { z } from 'zod';

export const userListItemSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isAdmin: z.boolean(),
});

export const userDetailsSchema = userListItemSchema.extend({
  tripCount: z.number(),
  itineraryCount: z.number(),
});

export type UserListItem = z.infer<typeof userListItemSchema>;

export type UserDetails = z.infer<typeof userDetailsSchema>;

export const usersSchema = z.object({
  users: z.array(userListItemSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  search: z.string().trim().min(2).max(120).optional(),
});

export type Users = z.infer<typeof usersSchema>;

export const usersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().min(2).max(120).optional(),
});

export type UsersQuery = z.infer<typeof usersQuerySchema>;
