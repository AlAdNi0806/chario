// components/auth/sign-up.tsx
"use client"
import React from 'react'
import CardWrapper from '@/components/md/card-wrapper'
import { FormError, FormSuccess } from "@/components/sm/form-status";
import { FcGoogle } from 'react-icons/fc'
import SocialButton from './social-button'
import { FaGithub } from 'react-icons/fa'
import { useAuthState } from '@/hooks/useAuthState'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SignupSchema } from '@/helpers/zod/signup-schema'
import { signUp } from '@/lib/auth-client'
import { generateUsername } from '@/helpers/auth/generate-username'

const SignUp = () => {
    const { error, success, loading, setLoading, setError, setSuccess, resetState } = useAuthState();

    const form = useForm({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            username: '', // Added username field
        }
    })

    const onSubmit = async (values) => {
        try {
            await signUp.email({
                name: values.name,
                email: values.email,
                password: values.password,
                username: values.username,
                // redirect
                callbackURL: '/home/charities'
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    resetState()
                    setLoading(true)
                },
                onSuccess: () => {
                    setSuccess("Verification link has been sent to your mail")
                },
                onError: (ctx) => {
                    setError(ctx.error.message);
                },
            });
        } catch (error) {
            console.error(error)
            setError("Something went wrong")
        }

    }

    return (
        <CardWrapper
            cardTitle='SignUp'
            cardDescription='Ready to donate or create a charity? Sign up now!'
            cardFooterLink='/signin'
            cardFooterDescription='Already have an account?'
            cardFooterLinkTitle='Signin'
        >
            <Form {...form}>
                <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        type="text"
                                        placeholder='john'
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e); // Update form state
                                            const username = generateUsername(e.target.value);
                                            form.setValue('username', username); // Auto-fill username
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        type="email"
                                        placeholder='example@gmail.com'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                                        placeholder='********'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                        )}
                    />
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button disabled={loading} type="submit" className='w-full cursor-pointer'>Submit</Button>
                    <div className='flex justify-between'>
                        {/* redirect */}
                        <SocialButton provider="google" icon={<FcGoogle />} label="Google" className="flex-1" callbackURL="/home/charities" />
                    </div>
                </form>
            </Form>
        </CardWrapper>
    )
}

export default SignUp