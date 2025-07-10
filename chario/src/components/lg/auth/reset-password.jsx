"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import CardWrapper from '@/components/md/card-wrapper'
import { FormError, FormSuccess } from "@/components/sm/form-status";
import { ResetPasswordSchema } from '@/helpers/zod/reset-password-schema'
import { authClient } from '@/lib/auth-client'
import { useAuthState } from '@/hooks/useAuthState'


const ResetPassword = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { error, success, loading, setError, setLoading, setSuccess, resetState } = useAuthState()

    const form = useForm({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    })

    const onSubmit = async (values) => {
        try {
            await authClient.resetPassword({
                newPassword: values.password,
                token: searchParams.get('token'),
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    resetState()
                    setLoading(true)
                },
                onSuccess: () => {
                    setSuccess("New password has been created")
                    router.replace('/signin')
                },
                onError: (ctx) => {
                    setError(ctx.error.message);
                },
            });
        } catch (error) {
            console.log(error)
            setError("Something went wrong")
        }

    }


    return (
        <CardWrapper
            cardTitle='Reset Password'
            // cardDescription='Create a new password'
            cardFooterLink='/signin'
            cardFooterDescription='Remember your password?'
            cardFooterLinkTitle='Signin'
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                        placeholder='************'
                                        {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        type="password"
                                        placeholder='*************'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button type="submit" className="w-full cursor-pointer" disabled={loading}>Submit</Button>
                </form>
            </Form>
        </CardWrapper>
    )
}

export default ResetPassword