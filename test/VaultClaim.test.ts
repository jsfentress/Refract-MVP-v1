import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";

describe("Vault Claim Flow", function () {
  it("should allow partial and full claims based on schedule", async function () {
    const [deployer, recipient] = await ethers.getSigners();
    const now = Math.floor(Date.now() / 1000);

    // Deploy ClaimToken
    const ClaimToken = await ethers.getContractFactory("ClaimToken");
    const claimToken = await ClaimToken.deploy(deployer.address);
    await claimToken.waitForDeployment();

    // Deploy ScheduleManager
    const ScheduleManager = await ethers.getContractFactory("ClaimScheduleManager");
    const schedule = await ScheduleManager.deploy();
    await schedule.waitForDeployment();

    // Deploy Vault
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(await claimToken.getAddress(), await schedule.getAddress());
    await vault.waitForDeployment();

    // Transfer ownership so Vault can mint
    await claimToken.transferOwnership(await vault.getAddress());

    // Deposit ETH and mint token
    const tokenURI = "ipfs://claim-schedule-eth";
    await vault.connect(deployer).deposit(recipient.address, tokenURI, { value: parseEther("1.0") });

    // Set unlock schedule: 50% now, 50% later
    const tokenId = 0;
    const timestamps = [now, now + 999999]; // 50% unlocked now
    const percents = [50, 50];
    await schedule.setSchedule(tokenId, timestamps, percents);

    // Claim first 50%
    const before = await ethers.provider.getBalance(recipient.address);
    const tx = await vault.connect(recipient).claim(tokenId);
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const after = await ethers.provider.getBalance(recipient.address);
    const diff = after - before + gasUsed;

    expect(diff).to.equal(parseEther("0.5"));

    // Try to claim again immediately — should revert
    await expect(vault.connect(recipient).claim(tokenId)).to.be.revertedWith("Nothing new to claim");
  });
});
