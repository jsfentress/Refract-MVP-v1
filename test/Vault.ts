import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "ethers";

describe("Vault", function () {
  let vault: any;
  let mockClaimToken: any;
  let mockScheduleManager: any;
  let deployer: any, recipient: any;

  const depositAmount = parseEther("1.0");
  const tokenId = 0;

  beforeEach(async () => {
    [deployer, recipient] = await ethers.getSigners();

    const ClaimToken = await ethers.getContractFactory("MockClaimToken");
    mockClaimToken = await ClaimToken.deploy(tokenId, recipient.address);
    await mockClaimToken.waitForDeployment();

    const ScheduleManager = await ethers.getContractFactory("MockScheduleManager");
    mockScheduleManager = await ScheduleManager.deploy();
    await mockScheduleManager.waitForDeployment();

    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(
      await mockClaimToken.getAddress(),
      await mockScheduleManager.getAddress()
    );
    await vault.waitForDeployment();
  });

  it("should accept ETH and mint ClaimToken", async () => {
    const tx = await vault.connect(deployer).deposit(recipient.address, "fake-uri", {
      value: depositAmount,
    });
    await tx.wait();

    const storedAmount = await vault.depositedAmount(tokenId);
    const depositorAddr = await vault.depositor(tokenId);

    expect(storedAmount).to.equal(depositAmount);
    expect(depositorAddr).to.equal(deployer.address);
  });

  it("should revert on zero ETH", async () => {
    await expect(
      vault.connect(deployer).deposit(recipient.address, "uri", { value: 0 })
    ).to.be.revertedWith("No ETH sent");
  });

  it("should revert on zero address", async () => {
    const ZeroAddress = ethers.ZeroAddress;
    await expect(
      vault.connect(deployer).deposit(ZeroAddress, "uri", { value: depositAmount })
    ).to.be.revertedWith("Invalid recipient");
  });

  it("should return correct claim data for a token", async () => {
    await vault.connect(deployer).deposit(recipient.address, "http://fake.uri", {
      value: depositAmount,
    });

    const [amount, schedule, depositorAddr] = await vault.getClaimData(tokenId);

    expect(amount).to.equal(depositAmount);
    expect(schedule).to.equal(0);
    expect(depositorAddr).to.equal(deployer.address);
  });
});
