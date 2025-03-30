import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with: ${deployer.address}`);

  // Deploy ClaimToken
  const ClaimToken = await ethers.getContractFactory("ClaimToken");
  const claimToken = await ClaimToken.deploy(deployer.address);
  await claimToken.waitForDeployment();
  console.log(`ClaimToken deployed at: ${await claimToken.getAddress()}`);

  // Deploy ClaimScheduleManager
  const ScheduleManager = await ethers.getContractFactory("ClaimScheduleManager");
  const scheduleManager = await ScheduleManager.deploy();
  await scheduleManager.waitForDeployment();
  console.log(`ScheduleManager deployed at: ${await scheduleManager.getAddress()}`);

  // Deploy Vault with both addresses
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(
    await claimToken.getAddress(),
    await scheduleManager.getAddress()
  );
  await vault.waitForDeployment();
  console.log(`Vault deployed at: ${await vault.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
