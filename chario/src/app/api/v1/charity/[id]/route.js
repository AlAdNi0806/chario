// This file runs on the server, so we can use server-side libraries and sensitive info
import { NextResponse } from 'next/server';
import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { hardhat } from 'viem/chains'; // Or your specific chain, e.g., sepolia, arbitrumSepolia
import abi from '@/abi/chario.json'; // Adjust path based on your project structure

// Load environment variables
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'; // Default to Hardhat's default RPC

// Check if environment variables are set
if (!CONTRACT_ADDRESS) {
    console.error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set in .env.local");
    // You might want to throw an error or handle this more gracefully in production
}

// Create a public client to interact with the blockchain
const publicClient = createPublicClient({
    chain: hardhat, // Specify your chain (e.g., hardhat, sepolia, mainnet)
    transport: http(RPC_URL),
});

const CHARIO_ABI = abi;

/**
 * Handles GET requests to /api/v1/charity/[id]
 * Fetches a single charity's data from the smart contract.
 */
export async function GET(request, { params }) {
    const { id } = params; // Extract the dynamic 'id' from the URL

    if (!id || isNaN(Number(id))) {
        return NextResponse.json({ error: 'Invalid charity ID' }, { status: 400 });
    }

    const charityId = BigInt(id); // Convert ID to BigInt for contract interaction

    try {
        // Read the charity data from the smart contract
        const charityData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CHARIO_ABI,
            functionName: 'charities', // Assuming you have a public mapping `charities(uint256)`
            args: [charityId],
        });

        // Destructure and format the data
        const [
            owner,
            title,
            description,
            target,
            deadline,
            amountCollected,
            image,
            status,
            fundsWithdrawn,
        ] = charityData;

        // Convert BigInts to string or number, format Ether values, etc.
        const formattedCharity = {
            id: Number(charityId), // Keep the ID as a number for client-side
            owner: owner,
            title: title,
            description: description,
            target: formatEther(target), // Convert wei to Ether string
            deadline: Number(deadline), // Convert BigInt timestamp to number
            amountCollected: formatEther(amountCollected), // Convert wei to Ether string
            image: image,
            status: status, // This will be the enum index (0, 1, 2, 3)
            fundsWithdrawn: fundsWithdrawn,
        };

        // Optionally, map the status enum index to a readable string
        const statusMap = ["ACTIVE", "INACTIVE", "COMPLETED", "CANCELLED"];
        formattedCharity.statusName = statusMap[formattedCharity.status];

        return NextResponse.json(formattedCharity, { status: 200 });

    } catch (error) {
        console.error(`Error fetching charity ${id}:`, error);
        // You can inspect error.message to provide more specific error feedback
        return NextResponse.json(
            { error: `Failed to fetch charity data: ${error.message}` },
            { status: 500 }
        );
    }
}