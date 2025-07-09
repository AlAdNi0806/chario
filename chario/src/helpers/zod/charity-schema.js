import { z } from "zod";

export const createCharitySchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    target: z.string().max(100).optional(),
    deadline: z.string().max(100).optional(),
    image: z.object({
        file_name: z.string(),
        file_cid: z.string(),
        file_path: z.string(),
    }),
})