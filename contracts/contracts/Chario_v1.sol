// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Chario_v1 is ReentrancyGuard {
    enum CharityStatus {
        ACTIVE,
        INACTIVE,
        COMPLETED,
        CANCELLED
    }

    struct Charity {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        CharityStatus status;
        bool fundsWithdrawn;
    }

    struct User {
        uint8 verifiedLevel;
        uint256[] badgeTokenIds;
        address[] linkedWallets;
    }

    mapping(uint256 => Charity) public charities;
    mapping(string => User) public users;
    mapping(address => string) public walletToUserId;
    mapping(uint256 => mapping(address => uint256)) public donorContributions;

    // Escrow mapping to track total funds held for each charity
    mapping(uint256 => uint256) public escrowBalance;

    uint256 public numberOfCharities = 0;
    address public owner;

    // Events for off-chain tracking
    event CharityCreated(
        uint256 indexed charityId,
        address indexed owner,
        string title
    );
    event WalletLinked(string indexed userId, address indexed wallet);
    event DonationReceived(
        uint256 indexed charityId,
        address indexed donor,
        uint256 amount
    );
    event RefundProcessed(
        uint256 indexed charityId,
        address indexed donor,
        uint256 amount
    );
    event FundsWithdrawn(
        uint256 indexed charityId,
        address indexed owner,
        uint256 amount
    );
    event CharityStatusUpdated(
        uint256 indexed charityId,
        CharityStatus newStatus
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can call this function"
        );
        _;
    }

    modifier onlyCharityOwner(uint256 _id) {
        require(
            charities[_id].owner == msg.sender,
            "Only charity owner can call this function"
        );
        _;
    }

    function createCharity(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(
            _deadline > block.timestamp + 1 hours,
            "Deadline must be at least 1 hour in the future"
        );
        require(_target > 0, "Target amount must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_image).length > 0, "Image URL cannot be empty");

        console.log("Deadline provided:", _deadline);
        console.log("Current block timestamp:", block.timestamp);
        console.log("Calculated minimum deadline:", block.timestamp + 1 hours);

        Charity storage charity = charities[numberOfCharities];

        charity.owner = _owner;
        charity.title = _title;
        charity.description = _description;
        charity.target = _target;
        charity.deadline = _deadline;
        charity.amountCollected = 0;
        charity.image = _image;
        charity.status = CharityStatus.ACTIVE;
        charity.fundsWithdrawn = false;

        emit CharityCreated(numberOfCharities, _owner, _title);

        numberOfCharities++;
        return numberOfCharities - 1;
    }

    function linkWalletToUser(
        string memory userId,
        address wallet
    ) public onlyOwner {
        users[userId].linkedWallets.push(wallet);
        walletToUserId[wallet] = userId;
        emit WalletLinked(userId, wallet);
    }

    function setUserVerifiedLevel(
        string memory userId,
        uint8 level
    ) public onlyOwner {
        users[userId].verifiedLevel = level;
    }

    function getUserByWallet(address wallet) public view returns (User memory) {
        string memory userId = walletToUserId[wallet];
        require(bytes(userId).length != 0, "Wallet not linked to any user");
        return users[userId];
    }

    function updateCharityStatus(uint256 _id) public {
        require(_id < numberOfCharities, "Charity does not exist");

        Charity storage charity = charities[_id];

        if (
            charity.status != CharityStatus.COMPLETED &&
            charity.status != CharityStatus.CANCELLED
        ) {
            if (block.timestamp > charity.deadline) {
                charity.status = CharityStatus.INACTIVE;
                emit CharityStatusUpdated(_id, CharityStatus.INACTIVE);
            } else if (charity.amountCollected >= charity.target) {
                charity.status = CharityStatus.COMPLETED;
                emit CharityStatusUpdated(_id, CharityStatus.COMPLETED);
            }
        }
    }

    function cancelCharity(uint256 _id) public onlyCharityOwner(_id) {
        Charity storage charity = charities[_id];
        require(
            charity.status == CharityStatus.ACTIVE,
            "Charity is not active"
        );
        require(!charity.fundsWithdrawn, "Funds already withdrawn");

        charity.status = CharityStatus.CANCELLED;
        emit CharityStatusUpdated(_id, CharityStatus.CANCELLED);
    }

    function donateToCharity(uint256 _id) public payable nonReentrant {
        require(_id < numberOfCharities, "Charity does not exist");
        require(msg.value > 0, "Donation must be greater than 0");

        Charity storage charity = charities[_id];
        require(
            charity.status == CharityStatus.ACTIVE,
            "Charity is not active"
        );
        require(
            block.timestamp < charity.deadline,
            "Charity deadline has passed"
        );

        // Update charity amount and donor contributions
        charity.amountCollected += msg.value;
        donorContributions[_id][msg.sender] += msg.value;

        // Add to escrow balance (funds stay in contract)
        escrowBalance[_id] += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);

        // Auto-update status if target is reached
        if (charity.amountCollected >= charity.target) {
            charity.status = CharityStatus.COMPLETED;
            emit CharityStatusUpdated(_id, CharityStatus.COMPLETED);
        }
    }

    function withdrawFunds(
        uint256 _id
    ) public onlyCharityOwner(_id) nonReentrant {
        Charity storage charity = charities[_id];

        require(
            charity.status == CharityStatus.COMPLETED ||
                (charity.status == CharityStatus.INACTIVE &&
                    block.timestamp > charity.deadline),
            "Cannot withdraw funds yet"
        );
        require(!charity.fundsWithdrawn, "Funds already withdrawn");
        require(escrowBalance[_id] > 0, "No funds to withdraw");

        uint256 amount = escrowBalance[_id];
        charity.fundsWithdrawn = true;
        escrowBalance[_id] = 0;

        (bool sent, ) = payable(charity.owner).call{value: amount}("");
        require(sent, "Failed to send Ether");

        emit FundsWithdrawn(_id, charity.owner, amount);
    }

    function refundDonation(uint256 _id) public nonReentrant {
        require(_id < numberOfCharities, "Charity does not exist");

        Charity storage charity = charities[_id];
        require(
            charity.status == CharityStatus.CANCELLED ||
                (charity.status == CharityStatus.INACTIVE &&
                    block.timestamp > charity.deadline),
            "Refund not available"
        );
        require(!charity.fundsWithdrawn, "Funds already withdrawn");

        uint256 donatedAmount = donorContributions[_id][msg.sender];
        require(donatedAmount > 0, "No donations to refund");

        // Reset donor contribution and update balances
        donorContributions[_id][msg.sender] = 0;
        charity.amountCollected -= donatedAmount;
        escrowBalance[_id] -= donatedAmount;

        (bool sent, ) = payable(msg.sender).call{value: donatedAmount}("");
        require(sent, "Failed to send refund");

        emit RefundProcessed(_id, msg.sender, donatedAmount);
    }

    function getCharity(uint256 _id) public view returns (Charity memory) {
        require(_id < numberOfCharities, "Charity does not exist");
        return charities[_id];
    }

    function getDonorContribution(
        uint256 _id,
        address donor
    ) public view returns (uint256) {
        return donorContributions[_id][donor];
    }

    function getEscrowBalance(uint256 _id) public view returns (uint256) {
        return escrowBalance[_id];
    }

    // Emergency function - only contract owner can use in extreme cases
    function emergencyWithdraw(uint256 _id) public onlyOwner nonReentrant {
        require(_id < numberOfCharities, "Charity does not exist");

        uint256 amount = escrowBalance[_id];
        require(amount > 0, "No funds to withdraw");

        escrowBalance[_id] = 0;

        (bool sent, ) = payable(owner).call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
}
