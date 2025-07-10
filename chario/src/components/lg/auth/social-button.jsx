"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';
import { useAuthState } from '@/hooks/useAuthState';
import { cn } from '@/lib/utils';


const SocialButton = ({
    provider,
    icon,
    label,
    callbackURL = '/',
    className = '',
}) => {
    const { setError, setSuccess, loading, setLoading, resetState } =
        useAuthState();

    const handleSignIn = async () => {
        try {
            await signIn.social(
                { provider, callbackURL },
                {
                    onResponse: () => setLoading(false),
                    onRequest: () => {
                        resetState();
                        setLoading(true);
                    },
                    onSuccess: () => {
                        setSuccess('You are logged in successfully');
                    },
                    onError: (ctx) => setError(ctx.error.message),
                }
            );
        } catch (error) {
            console.error(error);
            setError('Something went wrong');
        }
    };

    return (
        <>
            <Button variant="outline" onClick={handleSignIn} disabled={loading} className={cn('w-20 cursor-pointer', className)}>
                {icon}
                <span className=''>
                    {label}
                </span>
            </Button>
        </>
    );
};

export default SocialButton;