'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CopyXIcon } from 'lucide-react'

function NotFound({ title, description }) {
    return (
        <div className='h-full w-full flex flex-col items-center justify-center p-8 text-center'>
            <CopyXIcon size={40} className='text-primary mb-6' />
            <h1 className='font-bold text-2xl mb-1'>{title}</h1>
            <p className='text-muted-foreground text-xs mb-8'>{description}</p>
        </div>
    )
}

export default NotFound