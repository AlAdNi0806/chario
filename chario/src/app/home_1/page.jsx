'use client'

import { useCharities } from "@/hooks/use-chario";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { useState } from "react";
import ConnectWalletButton from "@/components/md/ConnectWalletButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Target, CircleDollarSign } from 'lucide-react';

export default function Home() {
    const { address, isConnected } = useAccount();
    const { charities, getCharitiesLoading, donateCharity, donateLoading } = useCharities();
    const [donationAmounts, setDonationAmounts] = useState({});
    const [expandedCharity, setExpandedCharity] = useState(null);

    const handleDonate = async (charityId) => {
        if (!isConnected) {
            alert("Please connect your wallet first");
            return;
        }

        const amount = donationAmounts[charityId] || "0";
        if (amount === "0") {
            alert("Please enter a valid amount");
            return;
        }
        try {
            await donateCharity(
                charityId,
                ethers.parseEther(amount.toString())
            );
            // alert("Donation successful!");
            setDonationAmounts(prev => ({ ...prev, [charityId]: "" }));
        } catch (error) {
            console.error("Donation failed:", error);
            alert("Donation failed: " + error.message);
        }
    };

    const handleAmountChange = (charityId, value) => {
        setDonationAmounts(prev => ({
            ...prev,
            [charityId]: value
        }));
    };

    const toggleDonationHistory = (charityId) => {
        setExpandedCharity(expandedCharity === charityId ? null : charityId);
    };

    if (getCharitiesLoading) {
        return (
            <div className="min-h-screen bg-neutral-900 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="bg-zinc-800 border-zinc-700 animate-pulse">
                            <CardHeader>
                                <div className="h-6 w-3/4 bg-zinc-700 rounded mb-2"></div>
                                <div className="h-4 w-1/2 bg-zinc-700 rounded"></div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="h-4 w-full bg-zinc-700 rounded"></div>
                                <div className="h-4 w-2/3 bg-zinc-700 rounded"></div>
                                <div className="h-10 w-full bg-zinc-700 rounded mt-4"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Charity Campaigns</h1>
                        <p className="text-zinc-400 mt-1">Support causes that matter to you</p>
                    </div>
                    <ConnectWalletButton />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {charities?.map((charity, index) => {
                        const progress = charity.target > 0
                            ? Math.min(100, (Number(charity.amountCollected) / Number(charity.target) * 100))
                            : 0;

                        const daysLeft = Math.floor((Number(charity.deadline) - Date.now() / 1000) / 86400);

                        return (
                            <Card key={index} className="bg-zinc-800 border-zinc-700 hover:border-zinc-600 transition-colors py-0">
                                <div className="relative">
                                    <img
                                        src={charity.image || '/default-charity.jpg'}
                                        alt={charity.title}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                        onError={(e) => e.target.src = '/default-charity.jpg'}
                                    />
                                    {daysLeft > 0 && (
                                        <Badge className="absolute top-2 right-2 bg-emerald-900 text-white font-semibold px-2 ring ring-emerald-600 shadow-xl">
                                            {daysLeft}d left
                                        </Badge>
                                    )}
                                </div>

                                <CardHeader>
                                    <CardTitle className="text-xl line-clamp-1">{charity.title}</CardTitle>
                                    <CardDescription className="text-zinc-400 line-clamp-2">
                                        {charity.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Raised</span>
                                            <span className="font-medium">
                                                {ethers.formatEther(charity.amountCollected)} ETH
                                            </span>
                                        </div>
                                        <Progress value={progress} className="h-2 bg-zinc-700" />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Target</span>
                                            <span className="font-medium">
                                                {ethers.formatEther(charity.target)} ETH
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-zinc-400" />
                                            <div>
                                                <p className="text-zinc-400">Deadline</p>
                                                <p>{new Date(Number(charity.deadline) * 1000).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-zinc-400" />
                                            <div>
                                                <p className="text-zinc-400">Donors</p>
                                                <p>{charity.donators?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {isConnected && (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <CircleDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <input
                                                    type="number"
                                                    placeholder="ETH amount"
                                                    className="w-full pl-10 pr-4 py-2 rounded bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                    value={donationAmounts[index] || ""}
                                                    onChange={(e) => handleAmountChange(index, e.target.value)}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <Button
                                                className="w-full bg-emerald-900 hover:bg-emerald-800 h-10 text-md text-white cursor-pointer"
                                                onClick={() => handleDonate(index)}
                                                disabled={donateLoading}
                                            >
                                                {donateLoading ? "Processing..." : "Donate Now"}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="p-0 border-t border-zinc-700 flex-col pt-0 [.border-t]:pt-0">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-zinc-400 hover:text-white rounded-t-none p-0 mb-0 cursor-pointer"
                                        onClick={() => toggleDonationHistory(index)}
                                    >
                                        {expandedCharity === index ? 'Hide donations' : 'Show donation history'}
                                    </Button>

                                    {expandedCharity === index && (
                                        <div className="w-full border-t border-zinc-700">
                                            <ScrollArea className="w-full max-h-60 p-4">
                                                <h4 className="text-sm font-medium mb-3 text-zinc-400">Donation History</h4>
                                                {charity.donators?.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {charity.donators.map((donator, i) => (
                                                            <div key={i} className="flex justify-between items-center text-sm">
                                                                <span className={`${donator === address ? 'text-blue-400' : 'text-zinc-300'}`}>
                                                                    {donator === address ? 'You' : `${donator.substring(0, 16)}...${donator.substring(38)}`}
                                                                </span>
                                                                <span className="font-medium">
                                                                    {ethers.formatEther(charity.donations[i] || '0')} ETH
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-zinc-500">No donations yet</p>
                                                )}
                                            </ScrollArea>
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {charities?.length === 0 && (
                    <div className="text-center py-16 border border-zinc-700 rounded-lg">
                        <div className="max-w-md mx-auto">
                            <Target className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-white mb-2">No campaigns found</h3>
                            <p className="text-zinc-400 mb-6">Be the first to create a charity campaign</p>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => window.location.href = '/create'}
                            >
                                Create Campaign
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}