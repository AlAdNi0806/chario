"use client"
import React from 'react'
import { authClient, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut } from 'lucide-react'
import { toast } from 'sonner'

const SignOut = () => {
    const router = useRouter()

    return (
        // <button
        //     onClick={async () => {
        //         await signOut({
        //             fetchOptions: {
        //                 onSuccess: () => {
        //                     router.push("/signin")
        //                 }
        //             }
        //         })
        //     }}
        //     className='ring-1 ring-primary bg-primary hover:bg-primary/90 transition-all cursor-pointer aspect-square w-10 h-10 rounded-lg flex items-center justify-center'
        // >
        //     <LogIn size={20} className='text-primary-foreground rotate-180' />
        // </button>
        <button
            className='w-full flex items-center hover:bg-accent cursor-pointer p-3 py-2 gap-3'
            onClick={async () => {
                await signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            // router.push("/signin")
                            router.refresh()
                            toast.success('You have been logged out')
                        }
                    }
                })
            }}
        >
            <div className='p-1 rounded-full bg-secondary flex'>
                <LogIn size={18} className='text-primary rotate-180' />
            </div>
            Logout
        </button>
        // <Button
        //     onClick={async () => {
        //         await signOut({
        //             fetchOptions: {
        //                 onSuccess: () => {
        //                     router.push("/signin")
        //                 }
        //             }
        //         })
        //     }}
        //     className="cursor-pointer aspect-square"
        // >
        //     <LogOut />
        // </Button>
    )
}

export default SignOut