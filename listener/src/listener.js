import { ethers } from 'ethers'
import { emitNewDonation } from './events'
import abi from '../abi/chario.json'
import { prisma } from './db'

// Connect to local Hardhat node
const provider = new ethers.JsonRpcProvider('http://localhost:8545')
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const contract = new ethers.Contract(contractAddress, abi, provider)

contract.on('DonationReceived', async (charityId, donor, amount, userId, event) => {
    try {

        const ethPrice = await getCurrentEthPrice() // Returns USD price of 1 ETH

        const amountEth = ethers.formatEther(amount.toString())
        const amountUsd = (parseFloat(amountEth) * ethPrice).toString()

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        const anonymousUser = await prisma.anonymousUser.findUnique({
            where: { id: userId }
        })

        // 4. Create donation record
        let donationData = {
            senderWallet: donor.toLowerCase(),
            amountEth: amountEth,
            amountUsd: amountUsd,
            txHash: event.transactionHash,
            charityId: charityId.toString(),
        };

        // Conditionally add properties to donationData
        if (user) {
            donationData.donorUser = {
                connect: {
                    id: user.id
                }
            };
            const newAmount = parseFloat(amountUsd) + parseFloat(user.amountSentInDollars);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    amountSentInDollars: newAmount.toString()
                }
            })
        } else if (anonymousUser) {
            donationData.donorAnonymousUser = {
                connect: {
                    id: anonymousUser.id
                }
            };
            const newAmount = parseFloat(amountUsd) + parseFloat(anonymousUser.amountSentInDollars);
            await prisma.anonymousUser.update({
                where: { id: anonymousUser.id },
                data: {
                    amountSentInDollars: newAmount.toString()
                }
            })
        } else {
            donationData.donorAnonymousUser = {
                create: {
                    amountSentInDollars: amountUsd
                }
            };
        }

        // Create the donation
        const donation = await prisma.donation.create({
            data: donationData,
            include: {
                charity: true,
                donorUser: true,
                donorAnonymousUser: true
            }
        })

        emitNewDonation({
            charityId: charityId.toString(),
            donation
        })

        console.log(`Processed donation: ${amountEth} ETH from ${donor}`)
    } catch (error) {
        console.error('Error processing donation event:', error)
        // Consider adding retry logic here
    }
})

contract.on('CharityCreated', async (charityId, owner, title, description, target, deadline, image, userId, event) => {
    console.log("GOGOGOGOGOGOOG")
    try {
        const charity = await prisma.charity.create({
            data: {
                owner: owner,
                title: title,
                description: description,
                target: target,
                deadline: deadline,
                image: image,
                status: CharityStatus.ACTIVE,
                userId: userId
            }
        })

        emitNewCharity({
            charityId: charityId.toString(),
            charity
        })

        console.log(`Processed charity creation: ${title}`)
    } catch (error) {
        console.error('Error processing charity creation event:', error)
        // Consider adding retry logic here
    }
})

contract.on('*', (event) => {
    console.log('Received ANY contract event!');
    console.log('Event Name:', event.eventName);
    console.log('Event Args:', event.args.toObject()); // Convert event.args to a plain object
    console.log('Transaction Hash:', event.log.transactionHash);
    console.log('Block Number:', event.log.blockNumber);
    console.log('---');
});

while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Tick');
}

// Helper function to get ETH price (mock implementation)
async function getCurrentEthPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.ethereum.usd;
    } catch (error) {
        console.error('Error fetching ETH price:', error);
        return null; // Or throw, depending on desired error handling
    }
}