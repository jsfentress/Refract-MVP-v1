import { ethers } from "hardhat";
import { expect } from "chai";

const { parseEther, isAddress } = ethers;

describe("ClaimRedemption", function () {
  let redemption: any;
  let mockVault: any;
  let mockToken: any;
  let mockSchedule: any;

  let deployer: any, depositor: any, user: any;
  const tokenId = 0;
  const scheduleId = 0;
  const depositAmount = ethers.parseEther("10"); // ✅ BigInt

  beforeEach(async () => {
    [deployer, depositor, user] = await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockClaimToken");
    mockToken = await MockToken.deploy(tokenId, user.address);
    await mockToken.waitForDeployment();

    const MockVault = await ethers.getContractFactory("MockVault");
    mockVault = await MockVault.deploy(depositAmount, scheduleId, depositor.address);
    await mockVault.waitForDeployment();

    const MockSchedule = await ethers.getContractFactory("MockScheduleManager");
    mockSchedule = await MockSchedule.deploy();
    await mockSchedule.waitForDeployment();
    await mockSchedule.setUnlockPercentage(scheduleId, 50);

    const Redemption = await ethers.getContractFactory("ClaimRedemption");
    redemption = await Redemption.deploy(
      await mockSchedule.getAddress(),
      await mockVault.getAddress(),
      await mockToken.getAddress()
    );
    await redemption.waitForDeployment();

    await deployer.sendTransaction({
      to: await redemption.getAddress(),
      value: depositAmount,
    });
  });

  it("should allow partial claim based on unlock %", async () => {
    const before = await ethers.provider.getBalance(user.address);

    const tx = await redemption.connect(user).redeem(tokenId);
    const receipt = await tx.wait();
    const gas = receipt.gasUsed * receipt.gasPrice;

    const after = await ethers.provider.getBalance(user.address);
    const expected = depositAmount / 2n; // ✅ BigInt division

    expect(after - before + gas).to.be.closeTo(expected, ethers.parseEther("0.01"));
  });

  it("should block non-owners from claiming", async () => {
    await expect(redemption.connect(deployer).redeem(tokenId)).to.be.revertedWith("Not token owner");
  });

  it("should prevent double claiming", async () => {
    await redemption.connect(user).redeem(tokenId);
    await expect(redemption.connect(user).redeem(tokenId)).to.be.revertedWith("Already fully claimed");
  });

  it("should return accurate claimable amount", async () => {
    const claimable = await redemption.getClaimable(tokenId);
    expect(claimable).to.equal(depositAmount / 2n); // ✅ BigInt division
  });

  it("should emit Claimed event with correct values", async () => {
    await expect(redemption.connect(user).redeem(tokenId))
      .to.emit(redemption, "Claimed")
      .withArgs(tokenId, depositAmount / 2n, user.address);
  });
});
