//Maciel Norman
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { TokenFarm, DAppToken, LPToken } from "../typechain-types";

describe("TokenFarm", function () {
  let dappToken: DAppToken;
  let lpToken: LPToken;
  let tokenFarm: TokenFarm;
  let owner: any;
  let user1: any;
  let user2: any;

  const initialMint = parseEther("1000");

  beforeEach(async function () {
  [owner, user1, user2] = await ethers.getSigners();

  const DAppTokenFactory = await ethers.getContractFactory("DAppToken");
  dappToken = await DAppTokenFactory.deploy(owner.address);
  await dappToken.waitForDeployment();

  const LPTokenFactory = await ethers.getContractFactory("LPToken");
  lpToken = await LPTokenFactory.deploy(owner.address);
  await lpToken.waitForDeployment();

  const TokenFarmFactory = await ethers.getContractFactory("TokenFarm");
  tokenFarm = await TokenFarmFactory.deploy(
    await dappToken.getAddress(),
    await lpToken.getAddress()
  );
  await tokenFarm.waitForDeployment();

  // ⚠️ IMPORTANTE: Transferir ownership solo después del deployment
  await dappToken.transferOwnership(await tokenFarm.getAddress());

  // Mint LP tokens para usuarios
  await lpToken.mint(user1.address, parseEther("1000"));
  await lpToken.mint(user2.address, parseEther("1000"));
});

  it("permite depositar y registrar staking", async function () {
    await lpToken.connect(user1).approve(tokenFarm.target, initialMint);
    await tokenFarm.connect(user1).deposit(initialMint);

    const staker = await tokenFarm.stakers(user1.address);
    expect(staker.balance).to.equal(initialMint);
    expect(staker.isStaking).to.be.true;
  });

  it("calcula recompensas para multiples usuarios", async function () {
    await lpToken.connect(user1).approve(tokenFarm.target, initialMint);
    await tokenFarm.connect(user1).deposit(initialMint);

    await lpToken.connect(user2).approve(tokenFarm.target, initialMint);
    await tokenFarm.connect(user2).deposit(initialMint);

    // Avanzar algunos bloques simulados
    await ethers.provider.send("evm_mine", []);
    await ethers.provider.send("evm_mine", []);

    await tokenFarm.connect(owner).distributeRewardsAll();

    const rewardsUser1 = await tokenFarm.getPendingRewards(user1.address);
    const rewardsUser2 = await tokenFarm.getPendingRewards(user2.address);

    expect(rewardsUser1 > 0n).to.be.true;
    expect(rewardsUser2 > 0n).to.be.true;
  });

  it("reclama recompensas correctamente descontando la comisión", async function () {
    await lpToken.connect(user1).approve(tokenFarm.target, initialMint);
    await tokenFarm.connect(user1).deposit(initialMint);

    await ethers.provider.send("evm_mine", []);
    await ethers.provider.send("evm_mine", []);
    await tokenFarm.connect(owner).distributeRewardsAll();

    const rewardsBefore = await tokenFarm.getPendingRewards(user1.address);
    const feePercent = await tokenFarm.feePercent();

    await tokenFarm.connect(user1).claimRewards();

    const balance = await dappToken.balanceOf(user1.address);

    // calcular expectedReward con bigint y operadores nativos
    const expectedReward = (rewardsBefore * BigInt(100 - Number(feePercent))) / 100n;
    expect(balance).to.equal(expectedReward);

    const rewardsAfter = await tokenFarm.getPendingRewards(user1.address);
    expect(rewardsAfter).to.equal(0n);
  });

  it("permite retirar staking y mantiene rewards pendientes", async function () {
    await lpToken.connect(user1).approve(tokenFarm.target, initialMint);
    await tokenFarm.connect(user1).deposit(initialMint);

    await ethers.provider.send("evm_mine", []);
    await ethers.provider.send("evm_mine", []);
    await tokenFarm.connect(owner).distributeRewardsAll();

    await tokenFarm.connect(user1).withdraw();

    const staker = await tokenFarm.stakers(user1.address);
    expect(staker.balance).to.equal(0n);
    expect(staker.isStaking).to.be.false;

    const rewards = await tokenFarm.getPendingRewards(user1.address);
    expect(rewards > 0n).to.be.true;

    await tokenFarm.connect(user1).claimRewards();
    const finalBalance = await dappToken.balanceOf(user1.address);
    expect(finalBalance > 0n).to.be.true;
  });

  it("solo owner puede llamar distributeRewardsAll", async function () {
    await expect(tokenFarm.connect(user1).distributeRewardsAll()).to.be.revertedWith("Solo el owner puede ejecutar esto");
  });

  it("permite cambiar la recompensa por bloque", async function () {
    const newReward = parseEther("5");
    await tokenFarm.connect(owner).setRewardPerBlock(newReward);

    const rewardPerBlock = await tokenFarm.rewardPerBlock();
    expect(rewardPerBlock).to.equal(newReward);
  });

  it("permite cambiar la comisión y valida límite", async function () {
    await tokenFarm.connect(owner).setFeePercent(20);
    let fee = await tokenFarm.feePercent();
    expect(fee).to.equal(20);

    await expect(tokenFarm.connect(owner).setFeePercent(60)).to.be.revertedWith("Fee demasiado alto");
  });
});