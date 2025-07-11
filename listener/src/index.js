// src/index.js
import { Hono } from 'hono'
import { ethers } from 'ethers'
import { streamSSE } from 'hono/streaming'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { prisma } from './db.js'
import { donationEmitter, emitNewDonation, emitNewCharity } from './events.js'
import getCurrentEthPrice from './ethPrice.js'
import abi from '../abi/chario.json' with { type: 'json' };

const app = new Hono()

// Apply CORS globally to all routes
app.use('*', cors({
    origin: ['http://localhost:3000'], // Or '*' for all origins (not recommended for private APIs)
    allowMethods: ['GET'],
    allowHeaders: ['Content-Type'],
    maxAge: 600,
}))



async function setupBlockchainListeners() {
    const provider = new ethers.WebSocketProvider(process.env.JSON_RPC_URL);
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, abi, provider)

    // contract.on('*', (event) => {
    //     console.log('--- Received ANY contract event ---');
    //     console.log('Event Name:', event.eventName);
    //     console.log('Event Args:', event.args.toObject());
    //     console.log('Transaction Hash:', event.log.transactionHash);
    //     console.log('Block Number:', event.log.blockNumber);
    //     console.log('---------------------------------');
    // });

    contract.on('DonationReceived', async (charityId, donor, amount, userId, event) => {
        console.log("DONATION RECEIVED EVENT TRIGGERED!");
        try {
            const ethPrice = await getCurrentEthPrice();
            if (ethPrice === null) {
                console.warn("Could not fetch ETH price. USD calculation for donation skipped.");
            }

            const amountEth = ethers.formatEther(amount);
            const amountUsd = ethPrice ? (parseFloat(amountEth) * ethPrice).toString() : '0';

            console.log("Donation data:", {
                senderWallet: donor.toLowerCase(),
                amountEth: amountEth,
                amountUsd: amountUsd,
                txHash: event.log.transactionHash,
                charityId: charityId.toString(),
                userId: userId
            });


            const user = await prisma.user.findFirst({
                where: { id: userId }
            });
            let donationData = {
                senderWallet: donor.toLowerCase(),
                amountEth: amountEth,
                amountUsd: amountUsd,
                txHash: event.log.transactionHash,
                charityId: charityId.toString(),
                donorUserId: user.id,
            };

            const currentAmount = user.amountSentInDollars || '0';
            const newUserSentAmount = parseFloat(currentAmount) + parseFloat(amountUsd);
            await prisma.user.update({
                where: { id: user.id },
                data: { amountSentInDollars: newUserSentAmount.toString() }
            });

            const charity = await prisma.charity.findFirst({
                where: { id: charityId.toString() },
            });
            const newAmount = addEthAmounts(amountEth, charity.amountCollected.toString());
            await prisma.charity.update({
                where: { id: charity.id },
                data: {
                    amountCollected: newAmount.toString()
                }
            })

            const donation = await prisma.donation.create({
                data: donationData,
                include: {
                    charity: true,
                    donorUser: true,
                }
            });

            emitNewDonation({
                charityId: charityId.toString(),
                donation
            });

            console.log(`Processed donation: ${amountEth} ETH from ${donor}`);
        } catch (error) {
            console.error('Error processing DonationReceived event:', error);
        }
    });

    contract.on('CharityCreated', async (charityId, ownerAddress, title, description, target, deadline, image, userId, event) => {
        console.log("CHARITY CREATED EVENT TRIGGERED!");
        try {
            const deadlineDate = deadline === 0n ? null : new Date(Number(deadline) * 1000);
            const targetAmount = target === 0n ? null : target.toString();

            const charity = await prisma.charity.create({
                data: {
                    id: charityId.toString(),
                    ownerWallet: ownerAddress,
                    title: title,
                    description: description,
                    target: targetAmount,
                    deadline: deadlineDate,
                    amountCollected: '0',
                    image: image,
                    status: 'ACTIVE',
                    owner: {
                        connect: {
                            id: userId
                        }
                    }
                },
                include: {
                    owner: true
                }
            });

            emitNewCharity({
                charityId: charityId.toString(),
                charity
            });

            console.log(`Processed charity creation: ${title}`);
        } catch (error) {
            console.error('Error processing CharityCreated event:', error);
        }
    });

    console.log('Blockchain event listeners registered.');
}

app.get('/sse/new-charities', async (c) => {
    return streamSSE(c, async (stream) => {

        const charityListener = (data) => {
            console.log("asdiofj pasodifjpo asidjf")
            stream.writeSSE({
                data: JSON.stringify({
                    type: 'new-charity',
                    charity: formatCharityForClient(data.charity)
                }),
                event: 'new-charity'
            });
        };

        donationEmitter.on('new-charity', charityListener);

        stream.onAbort(() => {
            donationEmitter.off('new-charity', charityListener);
            console.log('Disconnected from SSE')
        })

        while (true) {
            const message = `It is ${new Date().toISOString()}`
            await stream.writeSSE({
                data: message,
                event: 'time-update',
            })
            await stream.sleep(1000)
        }
    })
})

// Fixed SSE endpoint for charity donations
app.get('/sse/charities/:charityId/donations', async (c) => {
    const charityId = c.req.param('charityId');
    console.log("SSE for charity donations:", charityId)
    return streamSSE(c, async (stream) => {
        const donationListener = (data) => {
            console.log("asdiofj pasodifjpo asidjf")
            stream.writeSSE({
                data: JSON.stringify({
                    type: 'new-donation',
                    donation: data.donation
                }),
                event: 'new-donation'
            });
        };
        donationEmitter.on(`donation:${charityId}`, donationListener);
        stream.onAbort(() => {
            donationEmitter.off(`donation:${charityId}`, donationListener);
            console.log('Disconnected from SSE')
        })
        while (true) {
            const message = `It is ${new Date().toISOString()}`
            await stream.writeSSE({
                data: message,
                event: 'time-update',
            })
            await stream.sleep(1000)
        }
    })
})

function formatDonationForClient(donation) {
    return {
        id: donation.id,
        amountEth: donation.amountEth,
        amountUsd: donation.amountUsd,
        txHash: donation.txHash,
        createdAt: donation.createdAt,
        senderWallet: donation.senderWallet,
        donor: donation.donorUser
            ? {
                type: 'user',
                id: donation.donorUser.id,
                name: donation.donorUser.name,
                image: donation.donorUser.image
            }
            : {
                type: 'anonymous',
                id: donation.donorAnonymousUser?.id || donation.senderWallet
            }
    }
}

export function addEthAmounts(ethAmount1, ethAmount2) {
    // Convert ETH strings to bigint wei values
    const wei1 = ethers.parseEther(ethAmount1);
    const wei2 = ethers.parseEther(ethAmount2);

    // Add the bigint wei amounts using native +
    const sumWei = wei1 + wei2;

    // Convert back to ETH string
    return ethers.formatEther(sumWei);
}


function formatCharityForClient(charity) {
    return {
        id: charity.id,
        ownerWallet: charity.ownerWallet,
        title: charity.title,
        description: charity.description,
        target: charity.target,
        deadline: charity.deadline,
        amountCollected: charity.amountCollected,
        image: charity.image,
        status: charity.status,
        createdAt: charity.createdAt,
        updatedAt: charity.updatedAt,
        owner: charity.owner ? {
            id: charity.owner.id,
            name: charity.owner.name,
            email: charity.owner.email,
            image: charity.owner.image
        } : null
    }
}

async function startApp() {
    await setupBlockchainListeners()

    // const port = 3001
    // Bun.serve({
    //     fetch: app.fetch,
    //     port,
    // })

    serve({
        fetch: app.fetch,
        port: 3001,
    })

    console.log(`Hono server running on http://localhost:${3001}`)
}

startApp().catch(console.error)