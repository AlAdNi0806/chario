const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Chario", function () {
    let Chario, chario, owner, addr1, addr2, charityOwner; // Define variables

    beforeEach(async function () {
        [owner, addr1, addr2, charityOwner] = await ethers.getSigners();
        Chario = await ethers.getContractFactory("Chario");
        chario = await Chario.deploy();
        // Assuming you have a way to create a charity and get its ID
        // Let's create a charity for testing
        const createTx = await chario.createCharity(
            charityOwner.address, // Charity owner address
            "Test Charity",
            "Description",
            ethers.parseEther("100"), // Target
            Math.floor(Date.now() / 1000) + 3600, // Deadline (1 hour from now)
            "image.url",
            "user123"
        );
        await createTx.wait();
        // Get the charityId from the event (or if numberOfCharities is public)
        // For simplicity, let's assume it's 0 for the first one created
        const charityId = 0;
    });

    it("Should transfer donation to the charity owner", async function () {
        const donationAmount = ethers.parseEther("10"); // 10 ETH

        // Get initial balances
        const initialCharityOwnerBalance = await ethers.provider.getBalance(charityOwner.address);
        const initialContractBalance = await ethers.provider.getBalance(chario.target); // The contract's own address

        // Make the donation from addr1
        await chario.connect(addr1).donateToCharity(0, "donorUser456", { value: donationAmount });

        // Get balances after donation
        const finalCharityOwnerBalance = await ethers.provider.getBalance(charityOwner.address);
        const finalContractBalance = await ethers.provider.getBalance(chario.target);

        // Assertions
        // The charity owner's balance should increase by the donation amount
        expect(finalCharityOwnerBalance).to.equal(initialCharityOwnerBalance + donationAmount);

        // The contract's balance should be back to its initial state (or close to it,
        // accounting for any gas spent if the contract holds a tiny initial amount)
        // It should not hold the donation amount.
        // In Hardhat Network, unless the contract has a receive/fallback and keeps funds,
        // its balance should not have increased by the donation.
        // If the contract starts with 0 and only transfers, its balance should remain 0 after donation.
        expect(finalContractBalance).to.equal(initialContractBalance); // Or close to initial if starting from 0 and not accumulating
        // You might need a small tolerance for gas if your contract might have a very tiny initial balance
        // or if the simulation accounts for tiny gas remnants differently.
        // For typical `transfer` or `call` patterns, the contract's balance should not increase from donations.
    });
});