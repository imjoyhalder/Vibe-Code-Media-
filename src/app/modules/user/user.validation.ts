import { z } from 'zod';

export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
        bio: z.string().max(500, 'Bio too long').optional(),
    }),
});

export const getProfileSchema = z.object({});

export const getUserProjectsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
});

export const getUserActivitySchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GetUserProjectsInput = z.infer<typeof getUserProjectsSchema>;
export type GetUserActivityInput = z.infer<typeof getUserActivitySchema>;