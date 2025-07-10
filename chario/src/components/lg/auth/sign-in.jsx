"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import CardWrapper from '@/components/md/card-wrapper';
import { FormError, FormSuccess } from "@/components/sm/form-status";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import SocialButton from "./social-button";
import { useAuthState } from "@/hooks/useAuthState";
import { signIn } from "@/lib/auth-client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import the schemas (adjusted to match likely export)
import SignInSchema from "@/helpers/zod/login-schema";
import { Mail, Mailbox } from "lucide-react";
import { requestOTP } from "@/helpers/auth/request-otp";
import { oneTapCall } from "./one-tap";

const SignIn = () => {
    const [signInMethod, setSignInMethod] = useState('traditional');
    const router = useRouter();
    const {
        error,
        success,
        loading,
        setSuccess,
        setError,
        setLoading,
        resetState
    } = useAuthState();

    useEffect(() => {
        oneTapCall()
    }, [])

    // Infer schemas from the union
    const TraditionalSignInSchema = SignInSchema.options[0];
    const MagicLinkSignInSchema = SignInSchema.options[1];

    // Dynamically select schema based on sign-in method
    const currentSchema = signInMethod === 'traditional'
        ? TraditionalSignInSchema
        : MagicLinkSignInSchema;

    const form = useForm({
        resolver: zodResolver(currentSchema),
        defaultValues: {
            email: "",
            ...(signInMethod === 'traditional' ? { password: "" } : {}),
        },
    });

    const onSubmit = async (values) => {
        resetState();
        setLoading(true);

        try {
            if (signInMethod === 'magicLink') {
                // Magic Link sign-in
                await signIn.magicLink(
                    // redirect
                    { email: values.email, callbackURL: "/home/charities" },
                    {
                        onRequest: () => setLoading(true),
                        onResponse: () => setLoading(false),
                        onSuccess: () => {
                            setSuccess("A magic link has been sent to your email.");
                        },
                        onError: (ctx) => {
                            setError(ctx.error.message || "Failed to send magic link.");
                        },
                    }
                );
            } else {
                // Traditional sign-in
                const signInValues = values;

                // Determine if input is email or username
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInValues.email);

                if (isEmail) {
                    await signIn.email(
                        {
                            email: signInValues.email,
                            password: signInValues.password
                        },
                        {
                            onRequest: () => setLoading(true),
                            onResponse: () => setLoading(false),
                            onSuccess: async (ctx) => {
                                if (ctx.data.twoFactorRedirect) {
                                    const response = await requestOTP()
                                    if (response?.data) {
                                        setSuccess("OTP has been sent to your email")
                                        router.push("/two-factor")
                                    } else if (response?.error) {
                                        setError(response.error.message)
                                    }
                                } else {
                                    setSuccess("Logged in successfully.");
                                    // redirect
                                    router.replace("/home/charities");
                                }
                            },
                            onError: (ctx) => {
                                setError(
                                    ctx.error.message || "Email login failed. Please try again."
                                );
                            },
                        }
                    );
                } else {
                    setError("Something went wrong. Please try again.");
                }
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CardWrapper
            cardTitle="Sign in to Chario"
            cardDescription="Donate to charities you can trust"
            cardFooterDescription="Don't have an account?"
            cardFooterLink="/signup"
            cardFooterLinkTitle="Sign up"
        >
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Email or Username Field */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {signInMethod === 'magicLink' ? 'Email' : 'Email'}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        type="text"
                                        placeholder={
                                            signInMethod === 'magicLink'
                                                ? "Enter your email"
                                                : "Enter email"
                                        }
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password Field (only for traditional sign-in) */}
                    {signInMethod === 'traditional' && (
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            type="password"
                                            placeholder="********"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs underline whitespace-nowrap w-min"
                                    >
                                        Forgot Password?
                                    </Link>
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Error & Success Messages */}
                    <FormError message={error} />
                    <FormSuccess message={success} />

                    {/* Submit Button */}
                    <Button disabled={loading} type="submit" className="w-full cursor-pointer">
                        {signInMethod === 'magicLink' ? "Send Magic Link" : "Login"}
                    </Button>

                    <div className="flex items-center gap-2 mb-6 mt-2">
                        <span className="flex-1 h-px bg-muted-foreground" />
                        <span className="text-muted-foreground text-sm">Or authorize with</span>
                        <span className="flex-1 h-px bg-muted-foreground" />
                    </div>

                    {/* Social Buttons */}
                    <div className="flex mt-4 gap-2">
                        {/* redirect */}
                        <SocialButton provider="google" icon={<FcGoogle />} label=" Google" className="flex-1" callbackURL="/home/charities" />
                        <Button
                            variant={"outline"}
                            type="button"
                            className="flex-1 cursor-pointer"
                            onClick={() => setSignInMethod(
                                signInMethod === 'traditional' ? 'magicLink' : 'traditional'
                            )}
                        >
                            {signInMethod === 'traditional'
                                ? (
                                    <Mailbox />
                                )
                                : (
                                    <Mail />
                                )}
                            <span className=''>
                                {signInMethod === 'traditional'
                                    ? (
                                        'Magic Link'
                                    )
                                    : (
                                        'Traditional'
                                    )}
                            </span>
                        </Button>
                    </div>
                </form>
            </Form>
        </CardWrapper>
    );
};

export default SignIn;