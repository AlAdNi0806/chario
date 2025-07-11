'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { useModal } from '@/hooks/use-modal-store'
import { ArrowUpRight, Check, CheckIcon, Copy, CopyCheckIcon, UserCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// Import other necessary modules and components

function useClipboard() {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard');
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 1000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return { copied, copyToClipboard };
}

function DonationActionModal() {
    const { isOpen, onOpen, onClose, type, data } = useModal();
    const { copied, copyToClipboard } = useClipboard();
    const router = useRouter();
    const params = useParams();
    const isModalOpen = isOpen && type === 'donationAction';
    const { donation } = data || {};

    const handleClose = () => {
        onClose();
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default behavior of the Enter key
        }
    };

    const handleCopy = (text) => {
        copyToClipboard(text);
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent
                className="overflow-hidden w-[30rem] p-4 bg-card ring-1 ring-muted"
                onKeyDown={handleKeyDown}
            >
                {/* <p className='text-muted-foreground text-lg'>
                    Choose what you want to do with this donation
                </p> */}
                <div className='mb-4'>
                    <div className='text-muted-foreground text-sm cursor-pointer' onClick={() => handleCopy(donation?.txHash)}>
                        <span className='text-md text-accent-foreground font-semibold'>Transaction hash:</span>  {`${donation?.txHash.substring(0, 8)}...${donation?.txHash.substring(donation?.txHash.length - 6, donation?.txHash.length)}`}
                        <button className='ml-2 text-xs text-muted-foreground cursor-pointer focus-visible:ring-0 focus-visible:outline-none outline-non focus:outline-none'>
                            {copied ? (
                                <CheckIcon size={14}/>
                            ) : (
                                <Copy size={14}/>
                            )}
                        </button>
                    </div>
                    <div className='text-muted-foreground text-sm'>
                        <span className='text-md text-accent-foreground font-semibold'>Donators name:</span>  {donation?.donorUser?.name}
                    </div>
                </div>
                <div className="flex gap-4 items-center w-full">
                    <Link
                        href={`/home/users/${donation?.donorUser?.id}`}
                         className="flex-1 flex items-center cursor-pointer"
                    >
                        <Button variant="outline" className="flex-1 flex items-center focus-visible:ring-0 cursor-pointer">
                            <span className="text-muted-foreground text-sm font-semibold">
                                View profile
                            </span>
                            <UserCircleIcon />
                        </Button>
                    </Link>
                    <Link
                        href={`https://sepolia.etherscan.io/tx/${donation?.txHash}#internal`}
                        target="_blank"
                        className="flex-1 flex items-center cursor-pointer"
                    >
                        <Button className="flex-1 flex items-center cursor-pointer">
                            <span className=" text-sm font-semibold cursor-pointer">
                                Go to Donation
                            </span>
                            <ArrowUpRight />
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default DonationActionModal;
