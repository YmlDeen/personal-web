import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6)
})

export const registerSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6)
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
})
