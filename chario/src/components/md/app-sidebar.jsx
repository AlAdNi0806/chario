'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'
import { HandHelping, HandHelpingIcon, HeartHandshakeIcon, HeartIcon, LifeBuoyIcon, Plus, PlusIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import Settings from '../lg/auth/settings'
import SignOut from '../lg/auth/sign-out'
import { useSession } from '@/lib/auth-client'
import { Button } from '../ui/button'

export default function AppSidebar() {

    const { data } = useSession();
    // Да, можно лучше это сделать
    return (
        <Sidebar className={'flex flex-col'}>
            <div>
                <div className='p-4 py-3 border-b mb-4 flex gap-3 items-center'>
                    <LifeBuoyIcon size={28} className='text-primary' />
                    <p className="text-xl font-bold text-primary">
                        Chario
                    </p>
                </div>
                <Link href='/home/charities'>
                    <SidebarItem
                        label='All charities'
                        icon={<HandHelpingIcon size={20} />}
                    />
                </Link>
                <Link href={`/home/charities/${''}`}>
                    <SidebarItem
                        label='My charities'
                        icon={<HeartHandshakeIcon size={20} />}
                    />
                </Link>
                <Link href={`/home/charities/me/donations`}>
                    <SidebarItem
                        label='My donations'
                        icon={<HeartIcon size={20} />}
                    />
                </Link>
                <Link href={`/home/profile`}>
                    <SidebarItem
                        label='My profile'
                        icon={<UserIcon size={20} />}
                    />
                </Link>
                <Link href='/home/charities/new'>
                    <SidebarItem
                        label='New charity'
                        icon={<PlusIcon size={20} />}
                    />
                </Link>
            </div>
            <div className='mt-auto flex w-full'>
                {data === null ? (
                    <Link href='/signin' className='w-full m-3'>
                        <Button variant="outline" className='w-full cursor-pointer'>
                            Sign In
                        </Button>
                    </Link>
                ) : (
                    <div className='w-full'>
                        <Settings />
                        <SignOut />
                        <div className='flex flex-row border-t border-input p-2  items-center w-full mt-3 '>
                            {!data?.user?.email?.startsWith('temp-') && (
                                <div className='overflow-hidden w-8 h-8 max-h-8 max-w-8 rounded-md'>
                                    <img src={data?.user?.image} alt={data?.user?.name} className='w-full h-full object-cover' />
                                </div>
                            )}
                            <div className='flex flex-col ml-3'>
                                <p className='text-sm font-semi'>{data?.user?.name}</p>
                                {!data?.user?.email?.startsWith('temp-') && (
                                    <p className='text-xs text-muted-foreground/75 line-clamp-1'>{data?.user?.email}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Sidebar>
    )
}

const SidebarItem = ({ label, icon }) => {
    return (
        <div className='flex items-center gap-3 py-1.5 px-2 hover:bg-accent mx-2 rounded-md'>
            <div className='text-primary'>
                {icon}
            </div>
            <p>
                {label}
            </p>
        </div>
    )
}