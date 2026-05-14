import { z } from 'zod'

export const createLinkSchema = z.object({
  title:       z.string().min(1).max(100),
  url:         z.string().url(),
  tags:        z.array(z.string()).optional().default([]),
  description: z.string().max(300).optional().default(''),
  category:    z.string().optional().default('Other'),
  favicon:     z.string().optional().default(''),
  image:       z.string().optional().default(''),
  favorite:    z.boolean().optional().default(false),
})
