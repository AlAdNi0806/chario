'use client'

import { Input } from '@/components/ui/input';
import { ethers } from 'ethers';
import React from 'react'
import { checkIfImage } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCharities } from "@/hooks/use-chario";
import ConnectWalletButton from '@/components/md/ConnectWalletButton';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

function Page() {
    const router = useRouter();
    const { createCharity, createLoading, createError } = useCharities();
    const { address } = useAccount();
    const [form, setForm] = React.useState({
        title: '',
        description: '',
        target: '',
        deadline: '',
        image: '',
    });

    const [error, setError] = React.useState('');
    const [imageError, setImageError] = React.useState(false);

    async function handleSubmit(e) {
        setError('');
        e.preventDefault();

        // Validate form
        if (!form.title || !form.description || !form.target || !form.deadline || !form.image) {
            setError("All fields are required");
            return;
        }

        const minDeadline = Math.floor(Date.now() / 1000) + 3600; // Current time + 1 hour
        const selectedDeadline = Math.floor(new Date(form.deadline).getTime() / 1000);

        if (selectedDeadline <= minDeadline) {
            setError("Deadline must be at least 1 hour in the future");
            throw new Error("Deadline must be at least 1 hour in the future");
        }

        // Check if image URL is valid
        checkIfImage(form.image, async (exists) => {
            if (!exists) {
                setError("Invalid image URL");
                return;
            }

            console.log("Image exists. Proceeding with contract call...");

            try {
                await createCharity({
                    owner: address, // Replace with dynamic address if available
                    title: form.title,
                    description: form.description,
                    // target: parseInt(form.target),
                    // deadline: parseInt(form.deadline),
                    target: ethers.parseEther(form.target),
                    deadline: Math.floor(new Date(form.deadline).getTime() / 1000),
                    image: form.image,
                });
                console.log("Contract call success");

                // Redirect on success
            } catch (err) {
                console.error("Failed to create charity:", err);
                setError("Failed to create charity");
            }
        });
    }

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className='min-h-screen bg-neutral-900 p-4 md:p-8'>
            <div className='max-w-6xl mx-auto'>
                <div className='flex justify-between items-center mb-8'>
                    <h1 className='text-3xl md:text-4xl font-bold text-white'>Create New Charity</h1>
                    <ConnectWalletButton />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {/* Form Section */}
                    <div className='bg-zinc-800 p-6 rounded-lg'>
                        <h2 className='text-2xl font-semibold text-white mb-6'>Campaign Details</h2>

                        {error && (
                            <div className='mb-4 p-3 bg-red-900/50 text-red-200 rounded-md'>
                                {error}
                            </div>
                        )}

                        <form className='space-y-6' onSubmit={handleSubmit}>
                            <div>
                                <label className='block text-zinc-300 mb-2'>Title*</label>
                                <Input
                                    className='w-full bg-zinc-700 border-zinc-600 text-white'
                                    placeholder='Campaign title'
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className='block text-zinc-300 mb-2'>Description*</label>
                                <textarea
                                    className='w-full p-3 bg-zinc-700 border border-zinc-600 text-white rounded-md min-h-[120px]'
                                    placeholder='Describe your charity campaign'
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-zinc-300 mb-2'>Target Amount (ETH)*</label>
                                    <Input
                                        type='number'
                                        className='w-full bg-zinc-700 border-zinc-600 text-white'
                                        placeholder='10'
                                        min="0.01"
                                        step="0.01"
                                        value={form.target}
                                        onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className='block text-zinc-300 mb-2'>Deadline*</label>
                                    <Input
                                        type='date'
                                        className='w-full bg-zinc-700 border-zinc-600 text-white'
                                        value={form.deadline}
                                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                        min={new Date(Date.now() + 3600000).toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-zinc-300 mb-2'>Image URL*</label>
                                <Input
                                    className='w-full bg-zinc-700 border-zinc-600 text-white'
                                    placeholder='https://example.com/image.jpg'
                                    value={form.image}
                                    onChange={(e) => {
                                        setImageError(false);
                                        setForm({ ...form, image: e.target.value });
                                    }}
                                />
                                {imageError && (
                                    <p className='mt-1 text-sm text-red-400'>Please enter a valid image URL</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={createLoading}
                                className='w-full bg-emerald-800 hover:bg-emerald-700 h-12 text-lg text-white font-semibold cursor-pointer'
                            >
                                {createLoading ? "Creating Campaign..." : "Create Charity Campaign"}
                            </Button>
                        </form>
                    </div>

                    {/* Preview Section */}
                    <div className='bg-zinc-800 p-6 rounded-lg'>
                        <h2 className='text-2xl font-semibold text-white mb-6'>Campaign Preview</h2>

                        <Card className='bg-zinc-700 border-zinc-600 text-white pt-0'>
                            {form.image && !imageError ? (
                                <img
                                    src={form.image}
                                    alt="Campaign preview"
                                    className='w-full h-48 object-cover rounded-t-lg'
                                    onError={handleImageError}
                                />
                            ) : (
                                <div className='w-full h-48 bg-zinc-600 rounded-t-lg flex items-center justify-center'>
                                    <span className='text-zinc-400'>Image preview</span>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle>{form.title || "Your Campaign Title"}</CardTitle>
                                <CardDescription className='text-zinc-300'>
                                    {form.description || "Brief description of your campaign"}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className='space-y-4'>
                                <div>
                                    <div className='flex justify-between text-sm mb-1'>
                                        <span className='text-zinc-400'>Raised</span>
                                        <span>0 ETH</span>
                                    </div>
                                    <Progress value={0} className='h-2 bg-zinc-600' />
                                    <div className='flex justify-between text-sm mt-1'>
                                        <span className='text-zinc-400'>Target</span>
                                        <span>{form.target ? `${form.target} ETH` : '0 ETH'}</span>
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4 text-sm'>
                                    <div>
                                        <p className='text-zinc-400'>Donors</p>
                                        <p>0</p>
                                    </div>
                                    <div>
                                        <p className='text-zinc-400'>Deadline</p>
                                        <p>
                                            {form.deadline ?
                                                new Date(form.deadline).toLocaleDateString() :
                                                'Not set'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className='mt-6 text-zinc-400 text-sm'>
                            <h3 className='font-medium text-white mb-2'>Preview Notes:</h3>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>This is how your campaign will appear to donors</li>
                                <li>Image will be cropped to square aspect ratio</li>
                                <li>Target amount is in ETH (1 ETH = 1.000000000000000000 ETH)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page