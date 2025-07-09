// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Chario {
    enum CharityStatus {
        ACTIVE
        INACTIVE
        COMPLETED
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
    }

    struct User {
        uint8 verifiedLevel;
        uint256[] badgeTokenIds;
        address[] linkedWallets;
    }

    mapping(uint256 => Charity) public Charities;
    mapping(string => User) public users;
    mapping(address => string) public walletToUserId;
    mapping(uint256 => mapping(address => uint256)) public donorContributions;

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

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only contract owner can call this function");
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
        Charity storage charity = Charities[numberOfCharities];

        require(
            _deadline > block.timestamp + 1 hours,
            "Deadline must be at least 1 hour in the future"
        );
        require(_target > 0, "Target amount must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_image).length > 0, "Image URL cannot be empty");

        charity.owner = _owner;
        charity.title = _title;
        charity.description = _description;
        charity.target = _target;
        charity.deadline = _deadline;
        charity.amountCollected = 0;
        charity.image = _image;
        charity.status = CharityStatus.ACTIVE;

        emit CharityCreated(numberOfCharities, _owner, _title);

        numberOfCharities++;
        return numberOfCharities - 1;
    }

    function linkWalletToUser(
        string memory userId,
        address wallet
    ) public onlyOwner{
        // Add access control as needed (only user or admin can link)
        users[userId].linkedWallets.push(wallet);
        walletToUserId[wallet] = userId;
        emit WalletLinked(userId, wallet);
    }

    function setUserVerifiedLevel(string memory userId, uint8 level) public onlyOwner {
        users[userId].verifiedLevel = level;
    }

    function getUserByWallet(address wallet) public view returns (User memory) {
        string memory userId = walletToUserId[wallet];
        require(bytes(userId).length != 0, "Wallet not linked to any user");
        return users[userId];
    }

    function updateCharityStatus(uint256 _id) public {
        require(charity.owner == msg.sender, "Only charity owner can cancel");
        require(charity.status == CharityStatus.ACTIVE, "Charity is not active");
        Charity storage charity = Charities[_id];
        if (charity.status != CharityStatus.COMPLETED && charity.status != CharityStatus.CANCELLED) {
            if (block.timestamp > charity.deadline) {
                charity.status = CharityStatus.INACTIVE;
            } else if (charity.amountCollected >= charity.target) {
                charity.status = CharityStatus.COMPLETED;
            }
        }
    }

    function cancelCharity(uint256 _id) public {
        Charity storage charity = Charities[_id];
        require(charity.owner == msg.sender, "Only charity owner can cancel");
        require(charity.status == CharityStatus.ACTIVE, "Charity is not active");

        charity.status = CharityStatus.CANCELLED;
    }

    function donateToCharity(uint256 _id) public payable nonReentrant{
        require(_id < numberOfCharities, "Charity does not exist");
        Charity storage charity = Charities[_id];

        require(charity.status == CharityStatus.ACTIVE, "Charity is not active");
        require(block.timestamp < charity.deadline, "Charity deadline has passed");

        charity.amountCollected += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
        donorContributions[_id][msg.sender] += msg.value;

        (bool sent, ) = payable(charity.owner).call{value: msg.value}("");
        require(sent, "Failed to send Ether");

    }

    function getCharity(uint256 _id) public view returns (Charity memory) {
        return Charities[_id];
    }
}
