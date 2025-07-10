import { z } from "zod";

// Schema for traditional sign-in (email/username + password)
const TraditionalSignInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email"),
  password: z.string().nonempty("Password is required"),
});

// Schema for magic link sign-in (email only)
const MagicLinkSignInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email"),
});

// Combined schema for dynamic sign-in
const SignInSchema = z.union([TraditionalSignInSchema, MagicLinkSignInSchema]);

export default SignInSchema;
