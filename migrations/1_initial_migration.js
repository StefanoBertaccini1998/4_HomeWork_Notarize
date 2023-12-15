// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, upgrades } = require("hardhat");

async function main() {

  const UPGRADE = false;
  // Replace with the actual Notarize contract
  const oldNotarize = "";

  if(!UPGRADE){

    const notarize = await ethers.getContractFactory("Notarize");
    // Deploy first time Notarize
    const notarizeDeployed = await upgrades.deployProxy(notarize);
    await notarizeDeployed.deployed();
    console.log(
      "Notarize was deployed to address: " + notarizeDeployed.address()
    );
  }else{

    const VotingContractV2 = await ethers.getContractFactory("VotingContractV2");

    // Deploy the upgraded Notarize contract
    const notarizeDeployed = await upgrades.upgradeProxy(logicContractAddress, VotingContractV2);
    console.log(
      "Notarize was upgraded to address: " + notarizeDeployed.address()
    );
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
