import { expect } from "chai";
import { ethers } from "hardhat";

describe("ScheduleUpdater", function () {
  it("should allow token owner to update schedule and block others", async function () {
    const [owner, recipient, attacker] = await ethers.getSigners();

    // Deploy ClaimToken
    const ClaimToken = await ethers.getContractFactory("ClaimToken");
    const claimToken = await ClaimToken.deploy(owner.address);
    await claimToken.waitForDeployment();

    // Deploy ClaimScheduleManager
    const Manager = await ethers.getContractFactory("ClaimScheduleManager");
    const scheduleManager = await Manager.deploy();
    await scheduleManager.waitForDeployment();

    // Deploy Updater
    const Updater = await ethers.getContractFactory("ScheduleUpdater");
    const updater = await Updater.deploy(
      await scheduleManager.getAddress(),
      await claimToken.getAddress()
    );
    await updater.waitForDeployment();

    // Transfer ownership of token contract to Updater for minting
    await claimToken.transferOwnership(owner.address);

    // Mint token to recipient
    const tx = await claimToken.connect(owner).mint(recipient.address, "ipfs://test-uri");
    const receipt = await tx.wait();
    const tokenId = 0;

    // Valid update by recipient (owner of token)
    const timestamps = [100, 200];
    const percents = [40, 60];

    await updater.connect(recipient).updateSchedule(tokenId, timestamps, percents);
    const [savedTimestamps, savedPercents] = await scheduleManager.getSchedule(tokenId);
    expect(savedPercents[0]).to.equal(40);
    expect(savedPercents[1]).to.equal(60);

    // Try to update from non-owner — should fail
    await expect(
      updater.connect(attacker).updateSchedule(tokenId, timestamps, percents)
    ).to.be.revertedWith("Not token owner");

    // Try to submit invalid schedule (≠ 100%)
    const badPercents = [30, 30]; // total = 60
    await expect(
      updater.connect(recipient).updateSchedule(tokenId, timestamps, badPercents)
    ).to.be.revertedWith("Unlock % must total 100");
  });
});
