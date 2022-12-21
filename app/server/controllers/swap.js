import fs from "fs";
import { ethers } from "ethers";

const contractJSON = fs.readFileSync("../truffle/build/contracts/HTLC.json", "utf8")

const contractABI = JSON.parse(contractJSON).abi

let WEB3_PROVIDER, WEB3_PRIVATE_KEY;

switch (process.env["ETHEREUM_ENDPOINT"]) {
  case "LOCAL":
    WEB3_PROVIDER = "http://localhost:7545";
    WEB3_PRIVATE_KEY = "91478b9ed07e05d331f3eb12be41541d61ffaefee8ccaec3249897c597814bf8" // account #9
    break;
  case "TESTNET":
    WEB3_PROVIDER = "https://goerli.infura.io/v3/3a7a2dbdbec046a4961550ddf8c7d78a"
    WEB3_PRIVATE_KEY = ""
    break;
  default:
    WEB3_PROVIDER = "https://mainnet.infura.io/v3/3a7a2dbdbec046a4961550ddf8c7d78a"
    WEB3_PRIVATE_KEY = ""
}

const provider = new ethers.providers.JsonRpcProvider(WEB3_PROVIDER)
const ethWallet = new ethers.Wallet(WEB3_PRIVATE_KEY, provider)
const balance = ethers.utils.formatUnits(await ethWallet.getBalance(), 18)
if (balance <= 0) {
  throw "Ethereum's account has not found"
}

console.log(`Connected to Ethereum on ${WEB3_PROVIDER}`)

import Archethic, { Crypto, Utils } from "archethic";
import { createHmac } from "crypto";
const { originPrivateKey } = Utils;

import { archethicEndpoint, baseSeedContract, bridgeAddress, bridgeSeed, recipientEthereum, unirisTokenAddress } from "../utils.js";

const archethic = new Archethic(archethicEndpoint)

archethic.connect()
  .then(() => {
    console.log(`Connected to ${archethicEndpoint}`)
  })
  .catch((e) => {
    console.error("Cannot connect to Archethic endpoint")
    console.error(e.message)
    process.exit()
  })

export default { deployContract, withdraw }

async function deployContract(req, res, next) {

  await checkEthereumContract(req.body.ethereumContractAddress, req.body.amount, req.body.secretHash)

  const contractSeed = createHmac("sha512", baseSeedContract)
    .update(req.body.ethereumContractAddress)
    .digest();

  const contractAddress = Crypto.deriveAddress(contractSeed, 0);
  const contractAddressHex = Utils.uint8ArrayToHex(contractAddress);

  try {
    await fundContract(contractSeed, req.body.amount);
    console.log(`Contract ${contractAddressHex} funded`);
    const tx = await createContract(contractSeed, req.body.recipientAddress, req.body.amount, req.body.endTime, req.body.secretHash);
    await sendTransaction(tx);
    console.log("Contract transaction created");

    res.json({ status: "ok", contractAddress: contractAddressHex });
  }
  catch (error) {
    next(error)
  }
}

async function withdraw(req, res, next) {
  const archethicContractAddress = req.body.archethicContractAddress
  const ethereumContractAddress = req.body.ethereumContractAddress
  const secret = req.body.secret

  const ethContractInstance = getEthereumContract(ethereumContractAddress)
  if (ethContractInstance === undefined) {
    throw "Invalid ethereum contract's address"
  }

  try {
    const tx = await createRevealSecretTransaction(archethicContractAddress, secret)
    await sendTransaction(tx)
    await withdrawEthereumContract(ethContractInstance, secret)

    res.json({ status: "ok" })
  }
  catch (error) {
    next(error)
  }
}

function checkEthereumContract(ethereumContractAddress, amount, hash) {
  return new Promise(async (resolve, reject) => {

    const contractInstance = getEthereumContract(ethereumContractAddress)
    if (contractInstance === undefined) {
      return reject("Invalid ethereum contract's address")
    }

    const contractAmount = await contractInstance.amount()
    const contractToken = await contractInstance.token()
    const contractHash = await contractInstance.hash()
    const contractRecipient = await contractInstance.recipient()

    if (contractToken == unirisTokenAddress && contractHash == `0x${hash}` && contractAmount == (amount * 1e10) && contractRecipient == recipientEthereum) {
      return resolve()
    }
    return reject("invalid contract")
  })
}

function getEthereumContract(ethereumContractAddress) {
  return new ethers.Contract(ethereumContractAddress, contractABI, ethWallet)
}

async function withdrawEthereumContract(contractInstance, secret) {
  const contractSigner = contractInstance.connect(ethWallet)
  const nonce = await ethWallet.getTransactionCount()
  await contractSigner.withdraw(`0x${secret}`, { gasLimit: 100000, nonce: nonce || undefined })
}

function fundContract(contractSeed, amount) {
  return new Promise(async (resolve, reject) => {
    try {
      const index = await archethic.transaction.getTransactionIndex(bridgeAddress);

      const contractAddress = Crypto.deriveAddress(contractSeed, 0);
      archethic.transaction
        .new()
        .setType("transfer")
        .addUCOTransfer(contractAddress, amount + 50_000_000) // Send 0.5 UCO to the contract to pay the fees
        .build(bridgeSeed, index)
        .originSign(originPrivateKey)
        .on("requiredConfirmation", () => {
          resolve();
        })
        .on("error", (_context, reason) => {
          reject(reason);
        })
        .send();
    } catch (e) {
      return reject(e);
    }
  });
}

async function createContract(contractSeed, recipientAddress, amount, endTime, secretHash) {
  const storageNoncePublicKey = await archethic.network.getStorageNoncePublicKey();

  const secretKey = Crypto.randomSecretKey();
  const cipher = Crypto.aesEncrypt(contractSeed, secretKey);
  const encryptedSecretKey = Crypto.ecEncrypt(secretKey, storageNoncePublicKey);

  const authorizedKeys = [
    {
      publicKey: storageNoncePublicKey,
      encryptedSecretKey: encryptedSecretKey,
    }
  ];

  return archethic.transaction
    .new()
    .setType("transfer")
    .addOwnership(cipher, authorizedKeys)
    .setCode(`
      condition inherit: [
        code: "condition inherit: []",
        type: transfer,
        uco_transfers: if timestamp() >= ${endTime} do
          %{ "${bridgeAddress}" => ${amount} }
        else
          %{ "${recipientAddress}" => ${amount} }
        end
      ]

      # Automate the refunding after the given timestamp
      actions triggered_by: datetime, at: ${endTime} do
        set_type transfer
        # Send back the token to the bridge pool
        add_uco_transfer to: "${bridgeAddress}", amount: ${amount}
        set_code "condition inherit: []"
      end

      condition transaction: [
        content: if transaction.timestamp() < ${endTime} do
          hash() == "${secretHash}"
        else
          false
        end
      ]

      actions triggered_by: transaction do
        set_type transfer
        add_uco_transfer to: "${recipientAddress}", amount: ${amount}
        set_code "condition inherit: []"
      end
    `)
    .build(contractSeed, 0)
    .originSign(originPrivateKey);
}

function sendTransaction(tx) {
  return new Promise((resolve, reject) => {
    tx
      .on("requiredConfirmation", () => resolve())
      .on("error", (_context, reason) => reject(reason))
      .send()
  })
}

async function createRevealSecretTransaction(contractAddress, secret) {
  const index = await archethic.transaction.getTransactionIndex(bridgeAddress);

  return archethic.transaction
    .new()
    .setType("transfer")
    .setContent(secret)
    .addRecipient(contractAddress)
    .build(bridgeSeed, index)
    .originSign(originPrivateKey)
}
