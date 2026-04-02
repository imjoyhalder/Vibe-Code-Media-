import { z } from 'zod';

export const createProjectReviewSchema = z.object({
  params: z.object({
    projectId: z.string().uuid('Invalid projectId').nonempty(),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid userId').nonempty(),
    rating: z.object({
      vibes: z.number().int().min(1, 'Vibes must be between 1 and 5').max(5, 'Vibes must be between 1 and 5'),
      creativity: z.number().int().min(1, 'Creativity must be between 1 and 5').max(5, 'Creativity must be between 1 and 5'),
      usefulness: z.number().int().min(1, 'Usefulness must be between 1 and 5').max(5, 'Usefulness must be between 1 and 5'),
      cursedness: z.number().int().min(1, 'Cursedness must be between 1 and 5').max(5, 'Cursedness must be between 1 and 5'),
    }),
    comment: z
      .object({
        content: z.string().min(5, 'Comment must be at least 5 characters').max(1000, 'Comment too long'),
        type: z.enum(['ROAST', 'TOAST']).optional(),
      })
      .optional(),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title too long'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(4000, 'Description too long'),
    promptUsed: z.string().min(1, 'promptUsed is required'),
    siteUrl: z.string().url('Invalid siteUrl').optional(),
    repoUrl: z.string().url('Invalid repoUrl').optional(),
    screenshot: z.string().url('Invalid screenshot URL').optional(),
    tags: z.array(z.string().min(1, 'Tag cannot be empty')).optional(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export type CreateProjectReviewInput = z.infer<typeof createProjectReviewSchema>;
