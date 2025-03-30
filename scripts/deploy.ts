import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with: ${deployer.address}`);

  const ClaimToken = await ethers.getContractFactory("ClaimToken");
  const claimToken = await ClaimToken.deploy(deployer.address);
  await claimToken.waitForDeployment();
  console.log(`ClaimToken deployed at: ${await claimToken.getAddress()}`);

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy([await claimToken.getAddress()]);
  await vault.waitForDeployment();
  console.log(`Vault deployed at: ${await vault.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
