// auth.ts
import { prisma } from "@/db";
import { resend } from "@/helpers/email/resend";
import { ForgotPasswordSchema } from "@/helpers/zod/forgot-password-schema";
import SignInSchema from "@/helpers/zod/login-schema";
import { PasswordSchema, SignupSchema } from "@/helpers/zod/signup-schema";
import { twoFactorSchema } from "@/helpers/zod/two-factor-schema";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import {
  magicLink,
  oneTap,
  twoFactor,
  anonymous,
} from "better-auth/plugins";
import { validator } from "validation-better-auth";

export const auth = betterAuth({
  appName: "docu-auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Acme <onboarding@unio.aansl.com>",
        to: user.email,
        subject: "Reset your password",
        html: `Click the link to reset your password: ${url} \n\n This link will expire in 10 minutes`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "Acme <onboarding@unio.aansl.com>",
        to: user.email,
        subject: "Email Verification",
        html: `Click the link to verify your email: ${url} \n\n This link will expire in 10 minutes`,
      });
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: process.env.BETTER_AUTH_URL + "/api/auth/callback/google",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60 * 24,
  },
  plugins: [
    nextCookies(),
    anonymous(),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await resend.emails.send({
            from: "Acme <onboarding@unio.aansl.com>",
            to: user.email,
            subject: "Two Factor",
            html: `Your OTP is ${otp} \n\n This OTP will expire in 10 minutes`,
          });
        },
      },
      skipVerificationOnEnable: true,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "Acme <onboarding@unio.aansl.com>",
          to: email,
          subject: "Magic Link",
          html: `Click the link to login into your account: ${url} \n\n This link will expire in 10 minutes`,
        });
      },
    }),
    validator([
      { path: "/sign-up/email", schema: SignupSchema },
      { path: "/sign-in/email", schema: SignInSchema },
      { path: "/two-factor/enable", schema: PasswordSchema },
      { path: "/two-factor/disable", schema: PasswordSchema },
      { path: "/two-factor/verify-otp", schema: twoFactorSchema },
      { path: "/forgot-password", schema: ForgotPasswordSchema },
    ]),
    oneTap(),
  ],
});
