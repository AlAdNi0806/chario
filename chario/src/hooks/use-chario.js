"use client";

import { useEffect, useState } from "react";
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import abi from "../abi/chario.json"; // Update to your contract's ABI

const useCharities = () => {
    const { address } = useAccount();

    // Read all charities
    const {
        data: charities,
        isLoading: getCharitiesLoading,
        isError: getCharitiesError,
        refetch: refetchCharities,
    } = useReadContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        abi,
        functionName: "getCharities",
    });

    // Write contract for createCharity
    const {
        writeContract: writeCreateCharity,
        data: createHash,
        isPending: createPending,
        isError: createError,
    } = useWriteContract();

    // Write contract for donateCharity
    const {
        writeContract: writeDonateCharity,
        data: donateHash,
        isPending: donatePending,
        isError: donateError,
    } = useWriteContract();

    // Transaction receipt for createCharity
    const {
        isSuccess: createSuccess,
        isLoading: createTxLoading,
    } = useWaitForTransactionReceipt({
        hash: createHash,
        query: { enabled: Boolean(createHash) },
    });

    // Transaction receipt for donateCharity
    const {
        isSuccess: donateSuccess,
        isLoading: donateTxLoading,
    } = useWaitForTransactionReceipt({
        hash: donateHash,
        query: { enabled: Boolean(donateHash) },
    });

    // Create a charity
    const createCharity = async (params) => {
        try {
            await writeCreateCharity({
                address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                abi,
                functionName: "createCharity", // TYPO HERE? Should match exactly
                args: [
                    params.owner,
                    params.title,
                    params.description,
                    BigInt(params.target), // Convert to BigInt
                    BigInt(params.deadline), // Convert to BigInt
                    params.image,
                ],
            });
        } catch (err) {
            console.error("Failed to create charity", err);
            throw err;
        }
    };

    // Donate to a charity
    const donateCharity = async (id, amount) => {
        try {
            await writeDonateCharity({
                address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                abi,
                functionName: "donateToCharity",
                args: [id],
                value: amount,
            });
        } catch (err) {
            console.error("Failed to donate", err);
        }
    };

    // Refetch charities after successful transactions
    useEffect(() => {
        if (createSuccess || donateSuccess) {
            refetchCharities();
        }
    }, [createSuccess, donateSuccess]);

    return {
        address,
        charities,
        getCharitiesLoading,
        getCharitiesError,
        createCharity,
        donateCharity,
        createLoading: createPending || createTxLoading,
        donateLoading: donatePending || donateTxLoading,
        createError,
        donateError,
    };
};

export { useCharities };