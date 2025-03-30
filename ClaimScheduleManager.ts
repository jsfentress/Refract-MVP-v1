import { expect } from "chai";
import { ethers } from "hardhat";

describe("ClaimScheduleManager", function () {
  it("should correctly return unlocked percentages over time", async function () {
    const [owner] = await ethers.getSigners();
    const now = Math.floor(Date.now() / 1000); // current UNIX timestamp

    const ClaimScheduleManager = await ethers.getContractFactory("ClaimScheduleManager");
    const manager = await ClaimScheduleManager.deploy();
    await manager.waitForDeployment();

    const tokenId = 1;
    const timestamps = [now + 100, now + 200, now + 300];
    const percents = [30, 30, 40];

    await manager.setSchedule(tokenId, timestamps, percents);

    // Before any unlock
    expect(await manager.getUnlockedPercent(tokenId, now + 50)).to.equal(0);

    // After first unlock
    expect(await manager.getUnlockedPercent(tokenId, now + 150)).to.equal(30);

    // After second unlock
    expect(await manager.getUnlockedPercent(tokenId, now + 250)).to.equal(60);

    // After all unlocks
    expect(await manager.getUnlockedPercent(tokenId, now + 400)).to.equal(100);
  });

  it("should revert if unlock percentages do not sum to 100", async function () {
    const ClaimScheduleManager = await ethers.getContractFactory("ClaimScheduleManager");
    const manager = await ClaimScheduleManager.deploy();
    await manager.waitForDeployment();

    const badPercents = [50, 30]; // totals 80
    const timestamps = [1000, 2000];

    await expect(
      manager.setSchedule(1, timestamps, badPercents)
    ).to.be.revertedWith("Total unlock percent must equal 100");
  });
});
