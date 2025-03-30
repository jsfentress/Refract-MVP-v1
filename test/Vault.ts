import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "ethers";
const { ZeroAddress } = ethers;

describe("Vault", function () {
  it("should accept ETH and track balance", async function () {
    const [owner, recipient] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy();

    const tx = await vault.deposit(recipient.address, {
      value: parseEther("1.0"),
    });

    await expect(tx)
      .to.emit(vault, "DepositMade")
      .withArgs(owner.address, recipient.address, parseEther("1.0"));

    const balance = await vault.balances(recipient.address);
    expect(balance).to.equal(parseEther("1.0"));
  });

  it("should revert with zero ETH", async function () {
    const [_, recipient] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy();

    await expect(
      vault.deposit(recipient.address, { value: 0 })
    ).to.be.revertedWith("No ETH sent");
  });

  it("should revert with zero address", async function () {
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy();

    await expect(
      vault.deposit(ZeroAddress, {
        value: parseEther("1.0"),
      })
    ).to.be.revertedWith("Invalid recipient");
  });
});
