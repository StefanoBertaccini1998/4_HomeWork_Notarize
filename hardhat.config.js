require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("solidity-docgen");

const { SEPOLIA_URL, METAMASK_PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [METAMASK_PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    env: "./env",
  },
  mocha: {
    timeout: 40000,
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: true,
  },
};
