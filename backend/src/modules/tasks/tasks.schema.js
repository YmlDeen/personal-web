import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  due_date: z.string().optional(),
  repeat: z.enum(['daily', 'weekly', 'monthly']).optional().nullable(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().optional().nullable(),
  repeat: z.enum(['daily', 'weekly', 'monthly']).optional().nullable(),
})
