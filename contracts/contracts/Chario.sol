// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";

/**
 * @title CharioDirect
 * @dev This modified version of the Chario contract sends all donations directly
 * to the contract owner immediately. It features a simplified status system
 * (ACTIVE/INACTIVE) that can only be controlled by the charity's owner.
 */
contract Chario is ReentrancyGuard {
    // --- State Variables ---

    // Simplified status for charities
    enum CharityStatus {
        ACTIVE,
        INACTIVE
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

    uint256 public numberOfCharities = 0;
    address public owner;

    // --- Events ---

    event CharityCreated(
        uint256 indexed charityId,
        address indexed owner,
        string title,
        string description,
        uint256 target,
        uint256 deadline,
        string image,
        string userId
    );
    event WalletLinked(string indexed userId, address indexed wallet);
    event DonationReceived(
        uint256 indexed charityId,
        address indexed donor,
        uint256 amount,
        string userId
    );
    event CharityStatusUpdated(
        uint256 indexed charityId,
        CharityStatus newStatus
    );

    // --- Constructor ---

    constructor() {
        owner = msg.sender;
    }

    // --- Modifiers ---

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can call this function"
        );
        _;
    }

    modifier onlyCharityOwner(uint256 _id) {
        require(_id < numberOfCharities, "Charity does not exist");
        require(
            charities[_id].owner == msg.sender,
            "Only the charity owner can call this function"
        );
        _;
    }

    // --- Core Functions ---

    /**
     * @dev Creates a new charity. _target and _deadline are optional.
     * Set _target to 0 if no target amount is desired.
     * Set _deadline to 0 if no deadline is desired.
     * @param _owner The address of the charity owner.
     * @param _title The title of the charity.
     * @param _description The description of the charity.
     * @param _target The target amount for the charity (optional, set to 0 if not applicable).
     * @param _deadline The deadline for the charity (optional, set to 0 if not applicable).
     * @param _image The image URL for the charity.
     * @param _userId The user ID of the charity owner in the database.
     * @return The ID of the newly created charity.
     */
    function createCharity(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target, // 0 means no target
        uint256 _deadline, // 0 means no deadline
        string memory _image,
        string memory _userId
    ) public returns (uint256) {
        // Only check deadline if it's not 0
        if (_deadline != 0) {
            require(
                _deadline > block.timestamp,
                "Deadline must be in the future"
            );
        }

        // Only check target if it's not 0
        if (_target != 0) {
            require(_target > 0, "Target amount must be greater than 0 if set");
        }

        Charity storage charity = charities[numberOfCharities];
        charity.owner = _owner;
        charity.title = _title;
        charity.description = _description;
        charity.target = _target;
        charity.deadline = _deadline;
        charity.amountCollected = 0;
        charity.image = _image;
        charity.status = CharityStatus.ACTIVE; // Charities start as Active

        emit CharityCreated(numberOfCharities, _owner, _title, _description, _target, _deadline, _image, _userId);

        numberOfCharities++;
        return numberOfCharities - 1;
    }

    /**
     * @dev Allows the owner of a charity to manually set its status.
     * @param _id The ID of the charity.
     * @param _newStatus The new status to set (0 for ACTIVE, 1 for INACTIVE).
     */
    function setCharityStatus(
        uint256 _id,
        CharityStatus _newStatus
    ) public onlyCharityOwner(_id) {
        charities[_id].status = _newStatus;
        emit CharityStatusUpdated(_id, _newStatus);
    }

    function donateToCharity(uint256 _id, string memory _userId) public payable nonReentrant {
        require(_id < numberOfCharities, "Charity does not exist");
        require(msg.value > 0, "Donation must be greater than 0");

        Charity storage charity = charities[_id];

        // Donation is only possible if the charity is marked as ACTIVE
        require(
            charity.status == CharityStatus.ACTIVE,
            "Charity is not active and cannot receive donations"
        );

        // Check deadline if it exists and is in the past
        if (charity.deadline != 0) {
            require(
                block.timestamp <= charity.deadline,
                "Charity campaign has ended"
            );
        }

        // Check if target is met if it exists
        if (charity.target != 0) {
            require(
                charity.amountCollected < charity.target,
                "Charity target has been reached"
            );
        }

        // Update tracking data
        charity.amountCollected += msg.value;
        donorContributions[_id][msg.sender] += msg.value;

        // Immediately send funds to the main contract owner
        (bool sent, ) = payable(owner).call{value: msg.value}("");
        require(sent, "Failed to send Ether to the owner");

        emit DonationReceived(_id, msg.sender, msg.value, _userId);
    }

    // --- User Management Functions ---

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

    // --- View Functions ---

    function getCharity(uint256 _id) public view returns (Charity memory) {
        require(_id < numberOfCharities, "Charity does not exist");
        return charities[_id];
    }

    function getUserByWallet(address wallet) public view returns (User memory) {
        string memory userId = walletToUserId[wallet];
        require(bytes(userId).length != 0, "Wallet not linked to any user");
        return users[userId];
    }

    function getDonorContribution(
        uint256 _id,
        address donor
    ) public view returns (uint256) {
        return donorContributions[_id][donor];
    }
}
