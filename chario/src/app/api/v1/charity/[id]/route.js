// This file runs on the server, so we can use server-side libraries and sensitive info
import { NextResponse } from 'next/server';
import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { hardhat } from 'viem/chains'; // Or your specific chain, e.g., sepolia, arbitrumSepolia
import abi from '@/abi/chario.json'; // Adjust path based on your project structure
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { editCharitySchema } from '@/helpers/zod/charity-schema';

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

export async function POST(request, { params }) {
    const { id } = await params; // Extract the dynamic 'id' from the URL

    const { session } = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!id) {
        return NextResponse.json({ error: 'Invalid charity ID' }, { status: 400 });
    }

    const data = await request.json();
    console.log("Data:", data);
    const { title, description, target, deadline, image } = data;
    const errors = editCharitySchema.safeParse({
        title: title,
        description: description,
        target: target,
        deadline: deadline,
        image: image,
    });

    console.log("great", JSON.stringify(errors));
    if (!errors.success) {
        return NextResponse.json({ error: errors.error.format() }, { status: 400 });
    }

    try {

        let newImage = image.file_path;
        if (!newImage.includes(process.env.NEXT_PUBLIC_IPFS_GATEWAY)) {
            newImage = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${image.file_cid}`
        }

        let deadlineDate = null
        if (deadline?.length > 0) {
            deadlineDate = new Date(deadline);
        }

        const charity = await prisma.charity.update({
            where: { id: id },
            data: {
                title: title,
                description: description,
                target: parseFloat(target),
                deadline: deadlineDate,
                image: newImage,
            },
        });

        console.log('Charity updated:', charity);
        if (!charity) {
            return NextResponse.json({ error: 'Failed to update charity' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Error editing charity:', error);
        return NextResponse.json({ error: 'Failed to edit charity' }, { status: 500 });
    }
}
