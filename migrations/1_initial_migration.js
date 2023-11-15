const Notarize = artifacts.require("Notarize");

module.exports = async function (deployer) {
  await deployer.deploy(Notarize);
  const noteAddress = await Notarize.deployed();
  console.log("Notarize contract @: " + noteAddress.address);
};
