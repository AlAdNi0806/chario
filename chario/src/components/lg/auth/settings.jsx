"use client"
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { authClient, useSession } from '@/lib/auth-client'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { PasswordSchema } from '@/helpers/zod/signup-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormError, FormSuccess } from "@/components/sm/form-status";
import { useAuthState } from '@/hooks/useAuthState'
import { Settings as UserSettings } from "lucide-react"
import { PassKeyFormSchema } from '@/helpers/zod/passkey-form-schema'
import ThemeToggle from '@/components/md/theme-toggle'

const Settings = () => {
    const { data } = useSession();
    const [open, setOpen] = useState(false);
    const [openPasskey, setOpenPasskey] = useState(false)
    const { error, success, loading, setLoading, setSuccess, setError, resetState } = useAuthState()

    const form = useForm({
        resolver: zodResolver(PasswordSchema),
        defaultValues: {
            password: '',
        }
    })


    if (data?.user?.twoFactorEnabled === null) {
        return;
    }


    const onSubmit = async (values) => {
        if (data?.user.twoFactorEnabled === false) {
            await authClient.twoFactor.enable({
                password: values.password
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    resetState()
                    setLoading(true)
                },
                onSuccess: () => {
                    setSuccess("Enabled two-factor authentication");
                    setTimeout(() => {
                        setOpen(false);
                        resetState();
                        form.reset();
                    }, 1000);
                },
                onError: (ctx) => {
                    setError(ctx.error.message)
                }
            })
        }
        if (data?.user.twoFactorEnabled === true) {
            await authClient.twoFactor.disable({
                password: values.password
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    resetState()
                    setLoading(true)
                },
                onSuccess: () => {
                    setSuccess("Disabled two-factor authentication");
                    setTimeout(() => {
                        setOpen(false);
                        resetState();
                        form.reset();
                    }, 1000);
                },
                onError: (ctx) => {
                    setError(ctx.error.message)
                }
            })
        }
    }

    return (
        <>
            <Dialog open={open}
                onOpenChange={() => {
                    setOpen(false)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm selection</DialogTitle>
                        <DialogDescription>Please enter your password to confirm selection</DialogDescription>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={loading}
                                                    type='password'
                                                    placeholder='********'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormSuccess message={success} />
                                <FormError message={error} />
                                <Button
                                    type="submit"
                                    className='w-full mt-4'
                                    disabled={loading}
                                >
                                    Submit
                                </Button>
                            </form>
                        </Form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            {data?.session && (
                <Dialog>
                    <DialogTrigger asChild>
                        {/* <button className='ring-1 ring-primary bg-transparent hover:bg-primary/10 transition-all cursor-pointer aspect-square w-10 h-10 rounded-lg flex items-center justify-center'>
                            <UserSettings size={20} />
                        </button> */}

                        <button className='w-full flex items-center hover:bg-accent cursor-pointer p-3 py-2 gap-3'>
                            <div className='p-1 rounded-full bg-secondary flex'>
                                <UserSettings size={18} className='text-primary rotate-180' />
                            </div>
                            Settings
                        </button>

                        {/* <Button variant={"default"}>
                            <UserSettings />
                        </Button> */}
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Settings
                            </DialogTitle>
                            <DialogDescription>
                                Make changes in your settings here
                            </DialogDescription>
                        </DialogHeader>
                        <Card>
                            <CardHeader className='p-4 flex flex-row justify-between'>
                                <div>
                                    <CardTitle className='text-sm'>Enable 2FA</CardTitle>
                                    <CardDescription className='text-xs'>Select option to enable or disable two factor authentication</CardDescription>
                                </div>
                                <Switch
                                    checked={data?.user.twoFactorEnabled}
                                    onCheckedChange={() => { setOpen(true) }}
                                />
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className='p-4 flex flex-col justify-between gap-3'>
                                <div>
                                    <CardTitle className='text-sm'>Choose a theme</CardTitle>
                                    {/* <CardDescription className='text-xs'>Select option to enable or disable two factor authentication</CardDescription> */}
                                </div>
                                <ThemeToggle />
                            </CardHeader>
                        </Card>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

export default Settings