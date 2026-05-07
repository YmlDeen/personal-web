import { z } from 'zod'

export const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().optional().default('#7C6AF7')
})

export const logHabitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})
