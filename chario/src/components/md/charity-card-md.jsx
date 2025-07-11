'use client'
import React from 'react'
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

function CharityCardMd({ charity, className }) {
    const [daysLeft, setDaysLeft] = React.useState(0);

    React.useEffect(() => {
        const newDaysLeft = Math.floor((Number(charity.deadline) - Date.now() / 1000) / 86400);
        setDaysLeft(newDaysLeft);
        console.log(charity.deadline, newDaysLeft);
    }, [charity.deadline]);

    return (
        <Link
            href={charity?.link ? charity.link : `/home/charities/${charity.id}`}
            className={cn(
                'overflow-hidden relative min-w-96 max-w-96 min-h-[24rem] bg-muted dark:bg-card rounded-3xl ring-1 ring-card-foreground/10 transition-all duration-200 hover:ring-2 hover:ring-card-foreground/10 cursor-pointer flex flex-col',
                className
            )}
        >
            <div className="relative p-1">
                {charity?.image ? (
                    <Image
                        width={384}
                        height={192}
                        src={charity.image}
                        alt={charity.title}
                        className="w-full h-48 object-cover rounded-t-3xl rounded-b-4xl"
                    />
                ) : (
                    <div className="w-full h-48 bg-accent rounded-t-3xl rounded-b-4xl flex items-center justify-center">
                        <span className="text-zinc-400">Image preview</span>
                    </div>
                )}
                {daysLeft > 0 && (
                    <Badge className="absolute top-4 right-4 bg-primary-foreground text-white font-semibold px-2 ring ring-primary/50 shadow-xl">
                        {daysLeft}d left
                    </Badge>
                )}
            </div>
            <div className="p-4 pt-1 flex flex-col flex-grow">
                <h3 className='text-xl font-semibold text-accent-foreground mb-2 line-clamp-1'>{charity.title}</h3>
                <p className='text-muted-foreground mb-6 line-clamp-4 text-sm'>{charity.description}</p>
                {/* {(charity.target !== '0' || !charity?.id) ? ( */}
                {(charity.target !== '0' && charity.target) ? (
                    <div className="flex flex-col gap-1 mt-auto">
                        <div className='flex justify-between text-xs'>
                            <span className='text-zinc-400'>Target</span>
                            <span className='text-primary font-sm'>
                                {charity.target} ETH
                            </span>
                        </div>
                        <Progress
                            value={(charity.amountCollected / charity.target) * 100}
                            className='h-2 bg-zinc-700'
                        />
                        <div className='flex justify-between text-xs'>
                            <span className='text-zinc-400'>Raised</span>
                            <span className=' font-sm text-emerald-400'>
                                {charity.amountCollected} ETH
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className='flex justify-between text-xs mt-auto'>
                        <span className='text-zinc-400'>Raised</span>
                        <span className='text-emerald-400 font-sm'>
                            {charity.amountCollected} ETH
                        </span>
                    </div>
                )}
            </div>
        </Link>
    )
}

export default CharityCardMd;
