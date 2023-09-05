import fs from "fs";
import path from "path"
import { fileURLToPath } from 'url';

import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname)

const contractJSON = fs.readFileSync(path.join(__dirname, "../../public/HTLC.json"), "utf8")
const UCOContractJSON = fs.readFileSync(path.join(__dirname, "../../public/uco_abi.json"), "utf8")

const contractABI = JSON.parse(contractJSON).abi
const UCOContractABI = JSON.parse(UCOContractJSON)

import { Crypto, Utils } from "archethic";
import { createHmac } from "crypto";
const { originPrivateKey } = Utils;

import { archethicConnection, ethConfig, baseSeedContract, bridgeAddress, bridgeSeed, getUCOPrice, getLastTransaction, getStandardDeviation, getTransactionChain, maxSwapDollar } from "../utils.js";
import { toBigInt } from "archethic/lib/utils.js";

export default { deployContract, withdraw }

async function deployContract(req, res, next) {
  try {

    const { providerEndpoint, unirisTokenAddress, recipientEthereum, sourceChainExplorer } = ethConfig[req.body.ethereumChainId]
    const provider = new ethers.providers.JsonRpcProvider(providerEndpoint)

    const ercContractEndTime = await checkEthereumContract(req.body.ethereumContractAddress, req.body.amount, req.body.secretHash, recipientEthereum, unirisTokenAddress, provider)
    console.log("Ethereum contract checked");

    const { blockNumber } = await provider.getTransaction(req.body.ethereumContractTransaction)
    const { timestamp } = await provider.getBlock(blockNumber)

    const ucoPrice = await getUCOPrice(timestamp)
    const maxSwap = (maxSwapDollar / ucoPrice) * 1e8
    if (req.body.amount > maxSwap) {
      const deviationInUCO = getStandardDeviation([req.body.amount, maxSwap])
      if (((deviationInUCO / 1e8) * ucoPrice) > 0.1) {
        return res.status(400).json({ message: `You cannot swap more than $${maxSwapDollar}` })
      }
    }

    const contractSeed = createHmac("sha512", baseSeedContract)
      .update(`${req.body.ethereumContractAddress}${req.body.secretHash}`)
      .digest();

    const contractChainAddress = Crypto.deriveAddress(contractSeed, 0);
    const contractTxAddress = Crypto.deriveAddress(contractSeed, 1);
    const contractTxAddressHex = Utils.uint8ArrayToHex(contractTxAddress);

    const archethic = await archethicConnection();
    console.log("Connected to Archethic");
    const chainSize = await archethic.transaction.getTransactionIndex(
      contractChainAddress
    );
    switch (chainSize) {
      case 0:
        const fundingTx = await fundContract(
          archethic,
          contractSeed,
          req.body.amount,
          ucoPrice
        );
        console.log(`Funding tx ${Utils.uint8ArrayToHex(fundingTx.address)}`);
        await sendTransaction(fundingTx);
        console.log(
          `Contract ${Utils.uint8ArrayToHex(contractChainAddress)} funded`
        );

        const explorerEthereumContractURL = `${sourceChainExplorer}/address/${req.body.ethereumContractAddress}`;

        console.log("Create contract");
        const contractTx = await createContract(
          archethic,
          contractSeed,
          req.body.recipientAddress,
          req.body.amount,
          ercContractEndTime,
          req.body.secretHash,
          explorerEthereumContractURL
        );
        await sendTransaction(contractTx);
        console.log(`Contract transaction created - ${contractTxAddressHex}`);

        return res.json({
          status: "ok",
          contractAddress: contractTxAddressHex,
        });
      case 1:
        return res.json({
          status: "ok",
          contractAddress: contractTxAddressHex,
        });
      case 2:
        console.log(req.body.ethereumContractAddress);
        return res.status(400).json({ message: "Contract already deployed" });
    }
  } catch (error) {
    next(error.message || error);
  }
}

async function withdraw(req, res, next) {
  try {
    const { providerEndpoint } = ethConfig[req.body.ethereumChainId];
    const provider = new ethers.providers.JsonRpcProvider(providerEndpoint);

    if (
      (await checkEthereumWithdraw(
        req.body.ethereumWithdrawTransaction,
        req.body.ethereumContractAddress,
        req.body.secret,
        provider
      )) == false
    ) {
      console.log(`Cannot withdraw with invalid ETH withdraw transaction - ${req.body.ethereumWithdrawTransaction} at contract: ${req.body.ethereumContractAddress}`)
      throw "Invalid withdraw transaction";
    }

    const archethic = await archethicConnection();
    const chainSize = await archethic.transaction.getTransactionIndex(
      req.body.archethicContractAddress
    );
    if (chainSize == 0) {

      console.log(`Cannot withdraw with a contract not deployed - ${req.body.archethicContractAddress}`)
      
      return res
        .status(400)
        .json({ message: "Archethic's contract not deployed" });
    }

    if (chainSize == 2) {
      const transferTxAddress = await getLastAddressContract(
        archethic,
        req.body.archethicContractAddress
      );
      const chain = await getTransactionChain(archethic, req.body.archethicContractAddress);
      const archethicWithdrawTransaction = chain[1].address;
      
      return res
        .status(200)
        .json({
          status: "ok",
          archethicWithdrawTransaction: archethicWithdrawTransaction,
          archethicTransferTransaction: transferTxAddress,
        });
    }


    console.log(`Creating revel secret transaction for ${req.body.archethicContractAddress}`)
    const revealTx = await createRevealSecretTransaction(
      archethic,
      req.body.archethicContractAddress,
      req.body.secret
    );

    console.log(`Sending withdraw transaction for ${req.body.archethicContractAddress}`)
    await sendTransaction(revealTx);
    console.log(
      `Reveal transaction created - ${Utils.uint8ArrayToHex(revealTx.address)} for contract: ${req.body.archethicContractAddress}`
    );

    console.log(`Getting transfer address for ${req.body.archethicContractAddress}`)
    const transferTxAddress = await getLastAddressContract(
      archethic,
      req.body.archethicContractAddress
    );

    console.log(`Transfer transaction - ${transferTxAddress} for contract ${req.body.archethicContractAddress}`);

    res.json({
      status: "ok",
      archethicWithdrawTransaction: Utils.uint8ArrayToHex(revealTx.address),
      archethicTransferTransaction: transferTxAddress,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

function checkEthereumContract(
  ethereumContractAddress,
  amount,
  hash,
  recipientEthereum,
  unirisTokenAddress,
  provider
) {
  return new Promise(async (resolve, reject) => {
    try {
      const contractInstance = await getEthereumContract(
        ethereumContractAddress,
        provider
      );

      const contractAmount = await contractInstance.amount();
      const contractToken = await contractInstance.token();
      const contractHash = await contractInstance.hash();
      const contractRecipient = await contractInstance.recipient();

      const ucoErc = ethers.utils.formatUnits(contractAmount, 18)
      // We check with the amount * 1e10, because the amount on Archethic will be 1e8, we need to reach Ethereum decimals
      const ucoAPI = ethers.utils.formatUnits(ethers.utils.parseUnits(amount.toString(), 10), 18)

      const UCOContractInstance = new ethers.Contract(unirisTokenAddress, UCOContractABI, provider);
      const balance = await UCOContractInstance.balanceOf(ethereumContractAddress)

      if (
        contractToken.toUpperCase() == unirisTokenAddress.toUpperCase() &&
        contractHash == `0x${hash}` &&
        ucoErc == ucoAPI &&
        // Check the contract have the same balance as expected
        ethers.utils.formatUnits(balance, 18) == ucoErc &&
        contractRecipient == recipientEthereum
      ) {
        // These functions return a BigNumber object
        const startTime = await contractInstance.startTime();
        const lockTime = await contractInstance.lockTime();
        return resolve(startTime.toNumber() + lockTime.toNumber());
      }

      console.log(contractToken.toUpperCase(), `Expected contract address: ${unirisTokenAddress.toUpperCase()}`)
      console.log(contractHash, `Expected contract hash: 0x${hash}`)
      console.log(ethers.utils.formatUnits(balance, 18), `Expected uco transfered: ${ethers.utils.formatUnits(contractAmount, 18)}`)
      console.log(contractRecipient, `Expected contract recipient: ${contractRecipient}`)

      return reject("invalid contract");
    } catch (e) {
      return reject(e);
    }
  });
}

async function checkEthereumWithdraw(
  ethereumWithdrawTransaction,
  contractAddress,
  secret,
  provider
) {
  const tx = await provider.getTransaction(ethereumWithdrawTransaction);
  if (!tx) {
    return false;
  }
  const receipt = await provider.getTransactionReceipt(
    ethereumWithdrawTransaction
  );

  const iface = new ethers.utils.Interface([
    "function withdraw(bytes32 _secret)",
  ]);
  const values = iface.decodeFunctionData("withdraw", tx.data);

  const isValid = (
    receipt.status == 1 &&
    tx.to == contractAddress &&
    values[0] == `0x${secret}`
  );

  if (!isValid) {
    console.log(receipt.status, "Status transaction")
    console.log(tx.to, `Expected recipient: ${contractAddress}`)
    console.log(values[0], `Expected secret: 0x${secret}`)
  }

  return isValid
}

async function getEthereumContract(ethereumContractAddress, provider) {
  try {
    const contractInstance = new ethers.Contract(ethereumContractAddress, contractABI, provider);
    // Try to the call the contract to check its existence
    await contractInstance.startTime()
    return contractInstance
  }
  catch (e) {
    console.log(e)
    throw ("Invalid contract address")
  }
}

async function fundContract(archethic, contractSeed, amount, ucoPrice) {
  const index = await archethic.transaction.getTransactionIndex(bridgeAddress);

  // additional fund = 0.03$ to support 0.015$ fee per transaction
  const additional_fund = toBigInt(ucoPrice / 0.03)

  const contractAddress = Crypto.deriveAddress(contractSeed, 0);
  return archethic.transaction
    .new()
    .setType("transfer")
    .addUCOTransfer(contractAddress, amount + additional_fund)
    .build(bridgeSeed, index)
    .originSign(originPrivateKey)
}

async function createContract(archethic, contractSeed, recipientAddress, amount, endTime, secretHash, explorerEthereumContractURL) {
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
    .setType("contract")
    .setContent(explorerEthereumContractURL)
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
    .originSign(originPrivateKey)
}

function sendTransaction(tx) {
  return new Promise((resolve, reject) => {
    tx
      .on("requiredConfirmation", () => resolve())
      .on("error", (_context, reason) => reject(reason))
      .send(60)
  })
}

async function createRevealSecretTransaction(archethic, contractAddress, secret) {
  const index = await archethic.transaction.getTransactionIndex(bridgeAddress);

  return archethic.transaction
    .new()
    .setType("transfer")
    .setContent(secret)
    .addRecipient(contractAddress)
    .build(bridgeSeed, index)
    .originSign(originPrivateKey)
}

async function getLastAddressContract(archethic, contractAddress) {
  const transferTxAddress = await getLastTransaction(archethic, contractAddress)
  if (transferTxAddress.toUpperCase() == contractAddress.toUpperCase()) {
    await new Promise(r => setTimeout(r, 1000));
    return await getLastAddressContract(archethic, contractAddress)
  }

  return transferTxAddress
}
