import { z } from "zod";

export const createCharitySchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    target: z.string().min(1).max(100),
    deadline: z.string().min(1).max(100),
    image: z.object({
        file: z.instanceof(File),
        id: z.string(),
        file_name: z.string(),
        file_cid: z.string(),
    }),
})