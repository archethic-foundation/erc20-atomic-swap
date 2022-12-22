import fs from "fs";
import { ethers } from "ethers";

const contractJSON = fs.readFileSync("../truffle/build/contracts/HTLC.json", "utf8")

const contractABI = JSON.parse(contractJSON).abi

import Archethic, { Crypto, Utils } from "archethic";
import { createHmac } from "crypto";
const { originPrivateKey } = Utils;

import { hasSufficientFunds, archethicEndpoint, ethConfig, baseSeedContract, bridgeAddress, bridgeSeed } from "../utils.js";

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
  try {

    if (!await hasSufficientFunds(req.body.ethereumChainId)) {
      return res.status(500).json({ message: "Unsufficient funds" })
    }

    const { providerEndpoint, unirisTokenAddress, recipientEthereum } = ethConfig[req.body.ethereumChainId]
    const provider = new ethers.providers.JsonRpcProvider(providerEndpoint)

    await checkEthereumContract(req.body.ethereumContractAddress, req.body.amount, req.body.secretHash, recipientEthereum, unirisTokenAddress, provider)

    const contractSeed = createHmac("sha512", baseSeedContract)
      .update(req.body.ethereumContractAddress)
      .digest();

    const contractAddress = Crypto.deriveAddress(contractSeed, 0);
    const contractAddressHex = Utils.uint8ArrayToHex(contractAddress);

    await fundContract(contractSeed, req.body.amount);
    console.log(`Contract ${contractAddressHex} funded`);
    const tx = await createContract(contractSeed, req.body.recipientAddress, req.body.amount, req.body.endTime, req.body.secretHash);
    await sendTransaction(tx);
    console.log("Contract transaction created");

    res.json({ status: "ok", contractAddress: contractAddressHex });
  }
  catch (error) {
    next(error.message || error)
  }
}

async function withdraw(req, res, next) {
  try {

    if (!await hasSufficientFunds(req.body.ethereumChainId)) {
      return res.status(500).json({ message: "Unsufficient funds" })
    }

    const { providerEndpoint, privateKey } = ethConfig[req.body.ethereumChainId]
    const provider = new ethers.providers.JsonRpcProvider(providerEndpoint)

    const ethContractInstance = getEthereumContract(req.body.ethereumContractAddress, provider)
    if (ethContractInstance === undefined) {
      throw "Invalid ethereum contract's address"
    }

    const ethWallet = new ethers.Wallet(privateKey, provider)

    const tx = await createRevealSecretTransaction(req.body.archethicContractAddress, req.body.secret)
    await sendTransaction(tx)
    await withdrawEthereumContract(ethWallet, ethContractInstance, req.body.secret)

    res.json({ status: "ok" })
  }
  catch (error) {
    next(error.message || error)
  }
}

function checkEthereumContract(ethereumContractAddress, amount, hash, recipientEthereum, unirisTokenAddress, provider) {
  return new Promise(async (resolve, reject) => {

    const contractInstance = getEthereumContract(ethereumContractAddress, provider)
    if (contractInstance === undefined) {
      return reject("Invalid ethereum contract's address")
    }

    const contractAmount = await contractInstance.amount()
    const contractToken = await contractInstance.token()
    const contractHash = await contractInstance.hash()
    const contractRecipient = await contractInstance.recipient()

    // We check with the amount * 1e10, because the amount on Archethic will be 1e8, we need to reach Ethereum decimals
    if (contractToken == unirisTokenAddress && contractHash == `0x${hash}` && contractAmount == (amount * 1e10) && contractRecipient == recipientEthereum) {
      return resolve()
    }
    return reject("invalid contract")
  })
}

function getEthereumContract(ethereumContractAddress, provider) {
  return new ethers.Contract(ethereumContractAddress, contractABI, provider)
}

async function withdrawEthereumContract(ethWallet, ethContractInstance, secret) {
  const nonce = await ethWallet.getTransactionCount()
  const contractSigner = ethContractInstance.connect(ethWallet)
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
