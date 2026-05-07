import { z } from 'zod'

export const createLinkSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  tags: z.array(z.string()).optional().default([])
})
