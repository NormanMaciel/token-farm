// SPDX-License-Identifier: MIT
// Maciel Norman
pragma solidity ^0.8.22;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


import "./DappToken.sol";
import "./LPToken.sol";

/**
 * @title Proportional Token Farm
 * @notice Una granja de staking donde las recompensas se distribuyen proporcionalmente al total stakeado.
 */
contract TokenFarm is ReentrancyGuard {
    using SafeERC20 for IERC20;

    string public name = "Proportional Token Farm";
    address public owner;
    DAppToken public dappToken;
    LPToken public lpToken;

    uint256 public rewardPerBlock = 1e18;
    uint256 public totalStakingBalance;
    uint256 private _feePercent = 10;

    struct Staker {
        uint256 balance;
        uint256 checkpoint;
        uint256 pendingRewards;
        bool hasStaked;
        bool isStaking;
    }

    mapping(address => Staker) public stakers;
    address[] public stakerList;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed();
    event FeePercentUpdated(uint256 newFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede ejecutar esto");
        _;
    }

    modifier onlyStaker() {
        require(stakers[msg.sender].isStaking, "No estas haciendo staking");
        _;
    }

    constructor(DAppToken _dappToken, LPToken _lpToken) {
        dappToken = _dappToken;
        lpToken = _lpToken;
        owner = msg.sender;
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "El monto debe ser mayor a 0");
        distributeRewards(msg.sender);

        IERC20(address(lpToken)).safeTransferFrom(msg.sender, address(this), _amount);
        stakers[msg.sender].balance += _amount;
        totalStakingBalance += _amount;

        if (stakers[msg.sender].checkpoint == 0) {
            stakers[msg.sender].checkpoint = block.number;
        }
        if (!stakers[msg.sender].hasStaked) {
            stakers[msg.sender].hasStaked = true;
            stakerList.push(msg.sender);
        }
        stakers[msg.sender].isStaking = true;

        emit Deposit(msg.sender, _amount);
    }

    function withdraw() external onlyStaker nonReentrant {
        uint256 balance = stakers[msg.sender].balance;
        require(balance > 0, "No hay balance para retirar");

        distributeRewards(msg.sender);

        stakers[msg.sender].balance = 0;
        stakers[msg.sender].isStaking = false;
        totalStakingBalance -= balance;

        IERC20(address(lpToken)).safeTransfer(msg.sender, balance);

        emit Withdraw(msg.sender, balance);
    }

    function claimRewards() external nonReentrant {
        uint256 reward = stakers[msg.sender].pendingRewards;
        require(reward > 0, "No hay recompensas para reclamar");

        stakers[msg.sender].pendingRewards = 0;

        uint256 fee = (reward * _feePercent) / 100;
        uint256 finalReward = reward - fee;

        dappToken.mint(msg.sender, finalReward);
        dappToken.mint(owner, fee);

        emit RewardsClaimed(msg.sender, finalReward);
    }

    function distributeRewardsAll() external onlyOwner {
        uint256 length = stakerList.length;
        require(length <= 1000, "Demasiados stakers, procesar en batches");

        for (uint i = 0; i < length; i++) {
            address user = stakerList[i];
            if (stakers[user].isStaking) {
                distributeRewards(user);
            }
        }

        emit RewardsDistributed();
    }

    function distributeRewards(address beneficiary) private {
        uint256 lastCheckpoint = stakers[beneficiary].checkpoint;
        uint256 userBalance = stakers[beneficiary].balance;

        if (block.number > lastCheckpoint && totalStakingBalance > 0 && userBalance > 0) {
            uint256 blocksPassed = block.number - lastCheckpoint;
            uint256 userShare = (userBalance * 1e18) / totalStakingBalance;
            uint256 reward = (rewardPerBlock * blocksPassed * userShare) / 1e18;

            stakers[beneficiary].pendingRewards += reward;
        }

        stakers[beneficiary].checkpoint = block.number;
    }

    function getPendingRewards(address user) external view returns (uint256) {
        return stakers[user].pendingRewards;
    }

    function feePercent() external view returns (uint256) {
        return _feePercent;
    }

    function setRewardPerBlock(uint256 newReward) external onlyOwner {
        rewardPerBlock = newReward;
    }

    function setFeePercent(uint256 newFee) external onlyOwner {
        require(newFee <= 50, "Fee demasiado alto");
        _feePercent = newFee;
        emit FeePercentUpdated(newFee);
    }
}
