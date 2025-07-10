// src/app/(auth)/layout.tsx
import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const AuthLayout = async ({ children }) => {
    // Access cookies using the `cookies` function from 'next/headers'
    const sessionData = await auth.api.getSession({
        headers: await headers()
    });

    if (sessionData?.session) {
        return redirect('/home/charities');
    }

    return (
        <div className='flex items-center justify-center w-screen h-screen bg-muted'>
            {children}
        </div>
    );
};

export default AuthLayout;
