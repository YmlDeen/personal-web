import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([])
})

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional()
})
