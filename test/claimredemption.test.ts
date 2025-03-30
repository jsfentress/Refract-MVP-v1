import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("ClaimRedemption", function () {
  let claimRedemption: Contract;
  let mockScheduleManager: Contract;
  let mockVault: Contract;
  let mockClaimToken: Contract;

  let owner: any, depositor: any, user: any;

  const depositAmount = ethers.utils.parseEther("10");
  const tokenId = 1;
  const scheduleId = 42;

  beforeEach(async () => {
    [owner, depositor, user] = await ethers.getSigners();

    // Mock Schedule Manager
    const ScheduleManager = await ethers.getContractFactory("MockScheduleManager");
    mockScheduleManager = await ScheduleManager.deploy();
    await mockScheduleManager.deployed();

    // Mock Vault
    const Vault = await ethers.getContractFactory("MockVault");
    mockVault = await Vault.deploy(depositAmount, scheduleId, depositor.address);
    await mockVault.deployed();

    // Mock ClaimToken (ERC-721)
    const ClaimToken = await ethers.getContractFactory("MockClaimToken");
    mockClaimToken = await ClaimToken.deploy(tokenId, user.address);
    await mockClaimToken.deployed();

    // Deploy ClaimRedemption
    const ClaimRedemption = await ethers.getContractFactory("ClaimRedemption");
    claimRedemption = await ClaimRedemption.deploy(
      mockScheduleManager.address,
      mockVault.address,
      mockClaimToken.address
    );
    await claimRedemption.deployed();

    // Fund contract with ETH to simulate vault transfer
    await owner.sendTransaction({
      to: claimRedemption.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  it("should allow partial claims based on unlock %", async () => {
    await mockScheduleManager.setUnlockPercentage(scheduleId, 50); // 50%

    await claimRedemption.connect(user).redeem(tokenId);

    const claimed = await claimRedemption.claimedAmount(tokenId);
    expect(claimed).to.equal(depositAmount.div(2)); // 5 ETH

    const remaining = await claimRedemption.getClaimable(tokenId);
    expect(remaining).to.equal(0);
  });

  it("should not allow over-claiming", async () => {
    await mockScheduleManager.setUnlockPercentage(scheduleId, 50);
    await claimRedemption.connect(user).redeem(tokenId);

    await expect(claimRedemption.connect(user).redeem(tokenId)).to.be.revertedWith(
      "Already fully claimed"
    );
  });

  it("should block unauthorized users", async () => {
    await mockScheduleManager.setUnlockPercentage(scheduleId, 50);
    await expect(claimRedemption.connect(depositor).redeem(tokenId)).to.be.revertedWith(
      "Not token owner"
    );
  });

  it("should allow full claim at 100%", async () => {
    await mockScheduleManager.setUnlockPercentage(scheduleId, 100);

    await claimRedemption.connect(user).redeem(tokenId);

    const claimed = await claimRedemption.claimedAmount(tokenId);
    expect(claimed).to.equal(depositAmount);
  });

  it("should return accurate claimable amount", async () => {
    await mockScheduleManager.setUnlockPercentage(scheduleId, 25);
    const claimable = await claimRedemption.getClaimable(tokenId);
    expect(claimable).to.equal(depositAmount.div(4)); // 2.5 ETH
  });
});
