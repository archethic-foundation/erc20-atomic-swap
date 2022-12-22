import Archethic, { Crypto, Utils } from "archethic";
import fetch from "node-fetch"
import { ethers } from "ethers";

const archethicEndpoint =
  process.env["ARCHETHIC_ENDPOINT"] || "https://mainnet.archethic.net";

const bridgeSeed = "6D0270D3DFFC88C63C5D3DD977C18BC2401C088E9AEAEF37C515E8FC2537DBAA";
const bridgeAddress = Utils.uint8ArrayToHex(Crypto.deriveAddress(bridgeSeed, 0));
const baseSeedContract = "197D7B086613BCB8AB991683D39CC489C343662B3DFF7990B567A2D471D941E";

const ethConfig = {
  1337: {
    providerEndpoint: "http://localhost:7545",
    recipientEthereum: "0xCF026E727C1A5A71058316D223cA5BDb51c962A6", // account #9 (mnemonic: test)
    privateKey: "91478b9ed07e05d331f3eb12be41541d61ffaefee8ccaec3249897c597814bf8", // account #9 (mnemonic: test)
    unirisTokenAddress: process.env["ETHEREUM_UNIRIS_TOKEN"] || "0x6de6baDcC399a836258fa92d91EbA0a02cC40eE2" // (mnemonic: test)
  },
  5: {
    providerEndpoint: "https://goerli.infura.io/v3/3a7a2dbdbec046a4961550ddf8c7d78a",
    recipientEthereum: process.env["ETHEREUM_GOERLY_ADDRESS"] || "0x85864179f21518251DC16Bf5f34831d8Bb73B953", // account #9 (mnemonic: orphan bamboo rabbit depart truth kidney sick slot push board expect marriage)
    privateKey: process.env["ETHEREUM_GOERLI_KEY"] || "0x5f9e832af2e6a12536eac84794812603b2174c7b97d219bbf2404e4ea6703ba1", // account #9 (mnemonic: orphan bamboo rabbit depart truth kidney sick slot push board expect marriage)
    unirisTokenAddress: process.env["UNIRIS_TOKEN_ADDRESS"] || "0x51279e98d99AA8D65763a885BEFA5463dCd84Af6" // (mnemonic: orphan bamboo rabbit depart truth kidney sick slot push board expect marriage)
  },
  1: {
    providerEndpoint: "https://mainnet.infura.io/v3/3a7a2dbdbec046a4961550ddf8c7d78a",
    privateKey: process.env["ETHEREUM_MAINNET_KEY"],
    recipientEthereum: process.env["ETHEREUM_MAINNET_ADDRESS"],
    unirisTokenAddress: "0x8a3d77e9d6968b780564936d15B09805827C21fa"
  }
}

export {
  archethicEndpoint,
  bridgeSeed,
  bridgeAddress,
  baseSeedContract,
  ethConfig,
  hasSufficientFunds
};

async function hasSufficientFunds(ethChainId) {
  const { providerEndpoint, privateKey } = ethConfig[ethChainId]

  const provider = new ethers.providers.JsonRpcProvider(providerEndpoint)

  const archethicBalance = await getBridgeBalance()

  const ethWallet = new ethers.Wallet(privateKey, provider)
  const ethBalance = ethers.utils.formatUnits(await ethWallet.getBalance(), 18)

  return archethicBalance > 1e8 && ethBalance > 0
}

async function getBridgeBalance() {
  const archethic = new Archethic(archethicEndpoint)
  await archethic.connect()
  return await getLastTransactionBalance(archethic)
}

async function getLastTransactionBalance(archethic) {
  return archethic.requestNode(async (endpoint) => {
    const url = new URL("/api", endpoint);
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
            query {
              lastTransaction(address: "${bridgeAddress}") {
                 balance {
                   uco
                 }
              }
            }
          `
      })
    });
    const res = await r.json();

    if (res.errors && res.errors.find(x => x.message == "transaction_not_exists")) {
      return await getBridgeInputs(archethic)
    }

    if (res.data.lastTransaction && res.data.lastTransaction.balance) {
      return res.data.lastTransaction.balance.uco;
    }

    return 0;
  })
}

async function getBridgeInputs(archethic) {
  return archethic.requestNode(async (endpoint) => {
    const url = new URL("/api", endpoint);
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
            query {
              transactionInputs(address: "${bridgeAddress}") {
                 type,
                 amount
              }
            }
          `
      })
    });
    const res = await r.json();
    if (res.data.transactionInputs && res.data.transactionInputs.length > 0) {
      return res.data.transactionInputs
        .filter(r => r.type == "UCO")
        .reduce((acc, { amount: amount }) => acc + amount, 0)
    }
    return 0;
  })
}

