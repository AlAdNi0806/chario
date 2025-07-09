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
import { HandHelping, HandHelpingIcon, HeartHandshakeIcon, HeartIcon, LifeBuoyIcon, Plus, PlusIcon } from 'lucide-react'
import Link from 'next/link'

export default function AppSidebar() {
    return (
        <Sidebar>
            <div className='p-4 py-3 border-b mb-4 flex gap-3 items-center'>
                <LifeBuoyIcon size={28} className='text-primary' />
                <p className="text-xl font-bold text-primary">
                    Chario
                </p>
            </div>
            <Link href='/home/charities/new'>
                <SidebarItem
                    label='New charity'
                    icon={<PlusIcon size={20}/>}
                />
            </Link>
            <Link href='/home/charities'>
                <SidebarItem
                    label='All charities'
                    icon={<HandHelpingIcon size={20}/>}
                />
            </Link>
            <Link href={`/home/charities/${''}`}>
                <SidebarItem
                    label='My charities'
                    icon={<HeartHandshakeIcon size={20}/>}
                />
            </Link>
            <Link href={`/home/donations/${''}`}>
                <SidebarItem
                    label='My donations'
                    icon={<HeartIcon size={20}/>}
                />
            </Link>
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