import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "ethers";

describe("Vault + ClaimToken integration", function () {
  it("should mint a ClaimToken on deposit", async function () {
    const [owner, recipient] = await ethers.getSigners();

    // Deploy ClaimToken and Vault
    const ClaimToken = await ethers.getContractFactory("ClaimToken");
    const claimToken = await ClaimToken.deploy(owner.address);
    await claimToken.waitForDeployment();
    
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(await claimToken.getAddress());
    await vault.waitForDeployment();
    
    // 🔐 Transfer ownership so Vault can mint
    await claimToken.transferOwnership(await vault.getAddress());

    // Deposit into Vault with a token URI
    const tokenURI = "ipfs://example-uri";
    const tx = await vault.connect(owner).deposit(
      recipient.address,
      tokenURI,
      { value: parseEther("1.0") }
    );

    await expect(tx).to.emit(vault, "ClaimTokenIssued");

    // Check recipient owns tokenId 0
    const tokenOwner = await claimToken.ownerOf(0);
    expect(tokenOwner).to.equal(recipient.address);

    const storedURI = await claimToken.tokenURI(0);
    expect(storedURI).to.equal(tokenURI);
  });
});

