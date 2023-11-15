const { BigNumber, constants } = require("ethers");
const { AddressZero, EtherSymbol } = constants;
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const { expect } = require("chai");
const { ethers } = require("hardhat");

const fromWei = (x) => web3.utils.fromWei(BigNumber.from(x).toString());
const toWei = (x) => web3.utils.toWei(BigNumber.from(x).toString());

const HashWriter =
  "0x9bd7b39e404ec8163ddb5278c0044198ca50a2bf864985cbc93f934a5afed5d6";
const AdminRole =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const hash1 =
  "0x8613911112c3d65a9c52f1316fbd18f56eb43b7c0f68f49f6694d9b561bfeaf7";
const hash2 =
  "0x5b5aa7db42b8a6bccffceb0096f32de6dcb30ed454deb514de75c0c5ecc1370c";

require("@nomicfoundation/hardhat-chai-matchers");

describe("Notarization Test", async function (accounts) {
  it("deploy Notarize contract", async function () {
    [creator, firstAccount, secondAccount, newCreator] =
      await ethers.getSigners();

    Admin = creator;
    HashWriter1 = firstAccount;

    Notarize = await ethers.getContractFactory("Notarize");
    notarizeContract = await Notarize.deploy();
    await notarizeContract.deployed();
    expect(notarizeContract.address).to.be.not.equal(AddressZero);
    expect(notarizeContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    await notarizeContract.connect(creator).initialize();
  });

  it("Contract admin assign hash writer role to account", async function () {
    await expect(
      notarizeContract
        .connect(firstAccount)
        .setHashWriterRole(firstAccount.address)
    ).to.be.revertedWith(
      "AccessControl: account " +
        firstAccount.address.toLowerCase() +
        " is missing role " +
        AdminRole
    );
    await notarizeContract
      .connect(creator)
      .setHashWriterRole(firstAccount.address);
    await expect(
      await notarizeContract.hasRole(HashWriter, firstAccount.address)
    ).to.be.equal(true);
  });

  it("A hash writer address cannot assign the same role to another address", async function () {
    await expect(
      notarizeContract
        .connect(firstAccount)
        .setHashWriterRole(firstAccount.address)
    ).to.be.revertedWith(
      "AccessControl: account " +
        firstAccount.address.toLowerCase() +
        " is missing role " +
        AdminRole
    );
  });

  it("A admin address cannot notarize a document", async function () {
    await expect(
      notarizeContract.connect(creator).addNewDocument("Example", hash1)
    ).to.be.revertedWith(
      "AccessControl: account " +
        creator.address.toLowerCase() +
        " is missing role " +
        HashWriter
    );
  });

  it("A hash writer address can notarize a document and get notarized doc back", async function () {
    await notarizeContract
      .connect(firstAccount)
      .addNewDocument("example", hash1);
    tot = await notarizeContract.getDocsCount();
    console.log("Total document registered: " + tot.toString());
    result = await notarizeContract.getDocInfo(tot - 1);
    console.log(result[0].toString() + ":" + result[1]);
  });

  it("A hash writer address cannot notarize a document twice", async function () {
    await expect(
      notarizeContract.connect(firstAccount).addNewDocument("example2", hash1)
    ).to.be.revertedWithCustomError(notarizeContract, "hashAlreadyNotarized");

    tot = await notarizeContract.getDocsCount();
    console.log("Total document registered: " + tot.toString());
  });

  it("A hash writer address can notarize another document and get notarized doc back", async function () {
    await notarizeContract.connect(firstAccount).addNewDocument("test", hash2);
    tot = await notarizeContract.getDocsCount();
    console.log("Total document registered: " + tot.toString());
    result = await notarizeContract.getDocInfo(tot - 1);
    console.log(result[0].toString() + ":" + result[1]);
  });

  it("Is document already registered", async function () {
    await expect(await notarizeContract.getRegisteredHash(hash1)).to.be.true;

    const hash1Corrupted =
      "0xa2cbe6a9b5c75f04196a2d044fd62056a455feb6204af1803456be72c2ce0523";
    await expect(await notarizeContract.getRegisteredHash(hash1Corrupted)).to.be
      .false;
  });
});
