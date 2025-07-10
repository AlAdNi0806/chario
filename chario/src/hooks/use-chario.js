// "use client";

// import { useState, useCallback, useEffect } from 'react';
// import {
//     useAccount,
//     useReadContract,
//     useWriteContract,
//     useWaitForTransactionReceipt,
// } from "wagmi";
// import abi from "@/abi/chario.json"; // Update to your contract's ABI
// import { parseEther, formatEther } from 'viem';
// import { toast } from "sonner";

// const CHARIO_ABI = abi
// const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

// export const useChario = () => {
//     const { address, isConnected } = useAccount();
//     const [isLoading, setIsLoading] = useState(false);
//     const [pendingTxHash, setPendingTxHash] = useState(null);

//     // Write contract hook
//     const { writeContract, data: txHash, error: writeError, isPending: isWritePending } = useWriteContract();

//     // Wait for transaction receipt
//     const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
//         hash: txHash,
//     });

//     // Handle transaction completion
//     useEffect(() => {
//         if (txHash) {
//             console.log('Transaction Hash:', txHash);
//         }
//         if (isConfirmed && pendingTxHash) {
//             toast.success('Transaction confirmed!');
//             setIsLoading(false);
//             setPendingTxHash(null);
//         }
//     }, [isConfirmed, pendingTxHash, txHash]); // Add txHash to dependency array

//     useEffect(() => {
//         if (writeError) {
//             console.error('Wagmi Write Error:', writeError);
//             toast.error('Transaction failed: ' + writeError.message);
//             setIsLoading(false);
//             setPendingTxHash(null);
//         }
//     }, [writeError]);

//     // Read contract data
//     const { data: numberOfCharities, refetch: refetchCharityCount } = useReadContract({
//         address: CONTRACT_ADDRESS,
//         abi: CHARIO_ABI,
//         functionName: 'numberOfCharities',
//     });

//     const { data: userData, refetch: refetchUserData } = useReadContract({
//         address: CONTRACT_ADDRESS,
//         abi: CHARIO_ABI,
//         functionName: 'getUserByWallet',
//         args: [address],
//         query: {
//             enabled: !!address,
//         },
//     });

//     // Helper function to execute contract writes
//     const executeWrite = useCallback(async (functionName, args, value, successMessage) => {
//         if (!isConnected) {
//             toast.error('Please connect your wallet');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             const hash = await writeContract({
//                 address: CONTRACT_ADDRESS,
//                 abi: CHARIO_ABI,
//                 functionName: functionName,
//                 args: args,
//                 value: value,
//             });

//             setPendingTxHash(hash);
//             toast.success(successMessage || 'Transaction submitted');
//         } catch (error) {
//             console.error(`Error executing ${functionName}:`, error);
//             toast.error(error.message || 'Transaction failed');
//             setIsLoading(false);
//         }
//     }, [writeContract, isConnected]);

//     // Create Charity
//     const createCharity = useCallback(async (params) => {
//         const { owner, title, description, target, deadline, image } = params;

//         try {
//             const targetInWei = parseEther(target.toString());
//             await executeWrite(
//                 'createCharity',
//                 [owner, title, description, targetInWei, deadline, image],
//                 undefined,
//                 'Creating charity...'
//             );
//         } catch (error) {
//             console.error('Error creating charity:', error);
//             toast.error('Failed to create charity');
//         }
//     }, [executeWrite]);

//     // Donate to Charity
//     const donateToCharity = useCallback(async (charityId, amount) => {
//         try {
//             const amountInWei = parseEther(amount.toString());
//             await executeWrite(
//                 'donateToCharity',
//                 [charityId],
//                 amountInWei,
//                 'Processing donation...'
//             );
//         } catch (error) {
//             console.error('Error donating:', error);
//             toast.error('Failed to donate');
//         }
//     }, [executeWrite]);

//     // Withdraw Funds
//     const withdrawFunds = useCallback(async (charityId) => {
//         await executeWrite(
//             'withdrawFunds',
//             [charityId],
//             undefined,
//             'Withdrawing funds...'
//         );
//     }, [executeWrite]);

//     // Refund Donation
//     const refundDonation = useCallback(async (charityId) => {
//         await executeWrite(
//             'refundDonation',
//             [charityId],
//             undefined,
//             'Processing refund...'
//         );
//     }, [executeWrite]);

//     // Cancel Charity
//     const cancelCharity = useCallback(async (charityId) => {
//         await executeWrite(
//             'cancelCharity',
//             [charityId],
//             undefined,
//             'Cancelling charity...'
//         );
//     }, [executeWrite]);

//     // Update Charity Status
//     const updateCharityStatus = useCallback(async (charityId) => {
//         await executeWrite(
//             'updateCharityStatus',
//             [charityId],
//             undefined,
//             'Updating status...'
//         );
//     }, [executeWrite]);

//     const loading = isLoading || isWritePending || isConfirming;

//     return {
//         // Data
//         numberOfCharities,
//         userData,

//         // Actions
//         createCharity,
//         donateToCharity,
//         withdrawFunds,
//         refundDonation,
//         cancelCharity,
//         updateCharityStatus,

//         // Refetch functions
//         refetchCharityCount,
//         refetchUserData,

//         // State
//         loading,
//         isConnected,
//         address,
//         txHash,

//         // Utilities
//         formatEther,
//         parseEther,
//     };
// };

// // Hook for fetching multiple charities
// export const useCharities = (limit) => {
//     const [charities, setCharities] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);

//     const { data: numberOfCharities } = useReadContract({
//         address: CONTRACT_ADDRESS,
//         abi: CHARIO_ABI,
//         functionName: 'numberOfCharities',
//     });

//     const totalCharities = numberOfCharities ? Number(numberOfCharities) : 0;
//     const charityLimit = limit ? Math.min(limit, totalCharities) : totalCharities;

//     // Fetch all charities
//     useEffect(() => {
//         if (totalCharities > 0) {
//             setIsLoading(true);
//             const fetchCharities = async () => {
//                 const charityPromises = [];

//                 for (let i = 0; i < charityLimit; i++) {
//                     charityPromises.push(
//                         fetch(`/api/v1/charity/${i}`).then(res => res.json()) // You'll need to implement this API endpoint
//                     );
//                 }

//                 try {
//                     const results = await Promise.all(charityPromises);
//                     setCharities(results.map((charity, index) => ({ ...charity, id: index })));
//                 } catch (error) {
//                     console.error('Error fetching charities:', error);
//                 } finally {
//                     setIsLoading(false);
//                 }
//             };

//             fetchCharities();
//         }
//     }, [totalCharities, charityLimit]);

//     return {
//         charities,
//         isLoading,
//         totalCharities,
//     };
// };

// // Hook for a single charity
// export const useCharity = (charityId) => {
//     const { address } = useAccount();

//     const { data: charity, isLoading: isLoadingCharity, refetch: refetchCharity } = useReadContract({
//         address: CONTRACT_ADDRESS,
//         abi: CHARIO_ABI,
//         functionName: 'getCharity',
//         args: [charityId],
//     });

//     const { data: donorContribution, isLoading: isLoadingContribution, refetch: refetchContribution } = useReadContract({
//         address: CONTRACT_ADDRESS,
//         abi: CHARIO_ABI,
//         functionName: 'getDonorContribution',
//         args: [charityId, address],
//         query: {
//             enabled: !!address,
//         },
//     });

//     const { data: escrowBalance, isLoading: isLoadingEscrow, refetch: refetchEscrow } = useReadContract({
//         address: CONTRACT_ADDRESS,
//         abi: CHARIO_ABI,
//         functionName: 'getEscrowBalance',
//         args: [charityId],
//     });

//     const isLoading = isLoadingCharity || isLoadingContribution || isLoadingEscrow;
//     const isOwner = (charity?.owner === address);
//     const canRefund = donorContribution && donorContribution > 0n;

//     // Refetch all charity data
//     const refetchAll = useCallback(() => {
//         refetchCharity();
//         refetchContribution();
//         refetchEscrow();
//     }, [refetchCharity, refetchContribution, refetchEscrow]);

//     return {
//         charity,
//         donorContribution,
//         escrowBalance,
//         isLoading,
//         isOwner,
//         canRefund,
//         refetchAll,
//     };
// };

// // Utility hook for charity status
// export const useCharityStatus = (status) => {
//     const statusMap = {
//         0: 'Active',
//         1: 'Inactive',
//         2: 'Completed',
//         3: 'Cancelled'
//     };

//     const statusColors = {
//         0: 'green',
//         1: 'yellow',
//         2: 'blue',
//         3: 'red'
//     };

//     return {
//         statusText: statusMap[status] || 'Unknown',
//         statusColor: statusColors[status] || 'gray',
//         isActive: status === 0,
//         isCompleted: status === 2,
//         isCancelled: status === 3,
//         isInactive: status === 1,
//     };
// };

// // Utility hook for formatting dates
// export const useCharityDates = (deadline) => {
//     const deadlineDate = new Date(deadline * 1000);
//     const now = new Date();
//     const timeLeft = deadlineDate - now;

//     const isExpired = timeLeft <= 0;
//     const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

//     return {
//         deadlineDate,
//         isExpired,
//         daysLeft: isExpired ? 0 : daysLeft,
//         formattedDeadline: deadlineDate.toLocaleDateString(),
//         timeLeftText: isExpired ? 'Expired' : `${daysLeft} days left`,
//     };
// };


"use client";

import { useState, useCallback, useEffect } from 'react';
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import abi from "@/abi/chario.json"; // Make sure this ABI is from your LATEST compiled contract
import { parseEther, formatEther } from 'viem';
import { toast } from "sonner";

// --- Configuration ---
const CHARIO_ABI = abi;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// --- Main Hook for Contract Interactions ---
export const useChario = () => {
    const { address, isConnected } = useAccount();
    const [isLoading, setIsLoading] = useState(false);

    // Wagmi hooks for writing transactions
    const { data: txHash, writeContractAsync, error: writeError, isPending: isWritePending } = useWriteContract();

    // Wagmi hook to wait for transaction confirmation
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

    // Effect for handling transaction success
    useEffect(() => {
        if (isConfirmed) {
            toast.success('Transaction confirmed!');
            setIsLoading(false);
        }
    }, [isConfirmed]);

    // Effect for handling transaction errors
    useEffect(() => {
        if (writeError) {
            toast.error(writeError.shortMessage || 'Transaction failed.');
            console.error('Wagmi Write Error:', writeError);
            setIsLoading(false);
        }
    }, [writeError]);

    // Read contract data
    const { data: numberOfCharities, refetch: refetchCharityCount } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CHARIO_ABI,
        functionName: 'numberOfCharities',
    });

    // Helper function to execute contract writes
    const executeWrite = useCallback(async (functionName, args, value, loadingMessage) => {
        if (!isConnected) {
            // toast.error('Please connect your wallet first.');
            return {
                error: 'Please connect your wallet first.'
            };
        }
        setIsLoading(true);
        toast.info(loadingMessage || 'Submitting transaction...');

        try {
            await writeContractAsync({
                address: CONTRACT_ADDRESS,
                abi: CHARIO_ABI,
                functionName,
                args,
                value,
            });
        } catch (error) {
            // Error is handled by the useEffect hook for writeError
            console.error(`Error submitting ${functionName}:`, error);
            return {
                error: error.message
            };
        }
    }, [isConnected, writeContractAsync]);

    /**
     * Creates a new charity campaign.
     */
    const createCharity = useCallback(async (params) => {
        const { owner, title, description, target, deadline, image, userId } = params;
        // const targetInWei = parseEther(target.toString());
        const result = await executeWrite(
            'createCharity',
            // [owner, title, description, targetInWei || 0, deadline || 0, image],
            [owner, title, description, target, 0, image, userId],
            undefined,
            'Creating your charity...'
        );

        return result;
    }, [executeWrite]);

    /**
     * Donates a specified amount to a charity.
     */
    const donateToCharity = useCallback(async (charityId, amount, userId) => {
        const amountInWei = parseEther(amount.toString());
        await executeWrite(
            'donateToCharity',
            [charityId, userId],
            amountInWei,
            'Processing your donation...'
        );
    }, [executeWrite]);

    /**
     * Sets the status of a charity (callable only by the charity owner).
     * @param {number} charityId The ID of the charity.
     * @param {number} newStatus The new status (0 for ACTIVE, 1 for INACTIVE).
     */
    const setCharityStatus = useCallback(async (charityId, newStatus) => {
        await executeWrite(
            'setCharityStatus',
            [charityId, newStatus],
            undefined,
            'Updating charity status...'
        );
    }, [executeWrite]);

    return {
        // Data
        numberOfCharities,

        // Actions
        createCharity,
        donateToCharity,
        setCharityStatus, // <-- New function

        // Refetch functions
        refetchCharityCount,

        // State
        loading: isLoading || isWritePending || isConfirming,
        isConnected,
        address,
        txHash,

        // Utilities
        formatEther,
    };
};

// Hook for fetching multiple charities
export const useCharities = (limit) => {
    const [charities, setCharities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { data: numberOfCharities } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CHARIO_ABI,
        functionName: 'numberOfCharities',
    });

    const totalCharities = numberOfCharities ? Number(numberOfCharities) : 0;
    const charityLimit = limit ? Math.min(limit, totalCharities) : totalCharities;

    // Fetch all charities
    useEffect(() => {
        if (totalCharities > 0) {
            setIsLoading(true);
            const fetchCharities = async () => {
                const charityPromises = [];

                for (let i = 0; i < charityLimit; i++) {
                    charityPromises.push(
                        fetch(`/api/v1/charity/${i}`).then(res => res.json()) // You'll need to implement this API endpoint
                    );
                }

                try {
                    const results = await Promise.all(charityPromises);
                    setCharities(results.map((charity, index) => ({ ...charity, id: index })));
                } catch (error) {
                    console.error('Error fetching charities:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchCharities();
        }
    }, [totalCharities, charityLimit]);

    return {
        charities,
        isLoading,
        totalCharities,
    };
};


// --- Hook for a Single Charity's Data ---
export const useCharity = (charityId) => {
    const { address } = useAccount();

    const { data: charity, isLoading: isLoadingCharity, refetch: refetchCharity } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CHARIO_ABI,
        functionName: 'getCharity',
        args: [charityId],
    });

    const { data: donorContribution, isLoading: isLoadingContribution, refetch: refetchContribution } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CHARIO_ABI,
        functionName: 'getDonorContribution',
        args: [charityId, address],
        query: { enabled: !!address },
    });

    // Refetch all charity data
    const refetchAll = useCallback(() => {
        refetchCharity();
        refetchContribution();
    }, [refetchCharity, refetchContribution]);

    return {
        charity,
        donorContribution,
        isLoading: isLoadingCharity || isLoadingContribution,
        isOwner: charity?.owner === address,
        refetchAll,
    };
};

// --- Utility Hook for Displaying Charity Status ---
export const useCharityStatus = (status) => {
    const statusMap = {
        0: 'Active',
        1: 'Inactive',
    };

    const statusColors = {
        0: 'green',
        1: 'gray',
    };

    return {
        statusText: statusMap[status] ?? 'Unknown',
        statusColor: statusColors[status] ?? 'gray',
        isActive: status === 0,
        isInactive: status === 1,
    };
};