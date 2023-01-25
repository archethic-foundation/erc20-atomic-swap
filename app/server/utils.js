import Archethic, { Crypto, Utils } from "archethic";
import fetch from "node-fetch"

const archethicEndpoint =
  process.env["ARCHETHIC_ENDPOINT"] || "https://mainnet.archethic.net";

const bridgeSeed = process.env["BRIDGE_SEED"] || "6D0270D3DFFC88C63C5D3DD977C18BC2401C088E9AEAEF37C515E8FC2537DBAA";
const bridgeAddress = Utils.uint8ArrayToHex(Crypto.deriveAddress(bridgeSeed, 0));
const baseSeedContract = "197D7B086613BCB8AB991683D39CC489C343662B3DFF7990B567A2D471D941E";

const ethConfig = {
  1337: {
    providerEndpoint: "http://127.0.0.1:7545",
    recipientEthereum: "0xCF026E727C1A5A71058316D223cA5BDb51c962A6", // account #9 (mnemonic: test)
    unirisTokenAddress: process.env["ETHEREUM_UNIRIS_TOKEN"] || "0x6de6baDcC399a836258fa92d91EbA0a02cC40eE2" // (mnemonic: test)
  },
  // Goerli (ETH testnet)
  5: {
    providerEndpoint: "https://goerli.infura.io/v3/3a7a2dbdbec046a4961550ddf8c7d78a",
    recipientEthereum: process.env["ETHEREUM_GOERLY_ADDRESS"] || "0x85864179f21518251DC16Bf5f34831d8Bb73B953", // account #9 (mnemonic: orphan bamboo rabbit depart truth kidney sick slot push board expect marriage)
    unirisTokenAddress: process.env["UNIRIS_TOKEN_ADDRESS"] || "0x51279e98d99AA8D65763a885BEFA5463dCd84Af6", // (mnemonic: orphan bamboo rabbit depart truth kidney sick slot push board expect marriage)
    sourceChainExplorer: "https://goerli.etherscan.io"
  },

  // Mumbai (Polygon testnet)
  80001: {
    providerEndpoint: "https://polygon-mumbai.g.alchemy.com/v2/-8zo2X19AmwNv7AGVIsGF5LWJQLc92Oj",
    recipientEthereum: process.env["POLYGON_MUMBAI_ADDRESS"] || "0x85864179f21518251DC16Bf5f34831d8Bb73B953", // account #9 (mnemonic: orphan bamboo rabbit depart truth kidney sick slot push board expect marriage)
    unirisTokenAddress: process.env["UNIRIS_TOKEN_ADDRESS"] || "0x51279e98d99AA8D65763a885BEFA5463dCd84Af6", // (mnemonic: orphan bamboo rabbit depart truth kidney sick slot push board expect marriage)
    sourceChainExplorer: "https://mumbai.polygonscan.com"
  },

  // BSC (testnet)
  97: {
    providerEndpoint: "https://data-seed-prebsc-2-s3.binance.org:8545",
    recipientEthereum: process.env["BSC_TESTNET_ADDRESS"] || "0x85864179f21518251DC16Bf5f34831d8Bb73B953", // account #9 (mnemonic: orphan bamboo rabbit depart truth kidney sick slot push board expect marriage)
    unirisTokenAddress: process.env["UNIRIS_TOKEN_ADDRESS"] || "0x5e6554593E4fe61276AD09094f16A6D5133461A5", // (mnemonic: orphan bamboo rabbit depart truth kidney sick slot push board expect marriage)
    sourceChainExplorer: "https://testnet.bscscan.com"
  },

  // Polygon(mainnet)
  137: {
    providerEndpoint: "https://polygon-mainnet.g.alchemy.com/v2/DynWKvz6PUFaeZNmlxPXNiV1nK4Ac_2D",
    recipientEthereum: process.env["POLYGON_MAINNET_ADDRESS"],
    unirisTokenAddress: "0x3C720206bFaCB2d16fA3ac0ed87D2048Dbc401Fc",
    sourceChainExplorer: "https://polygonscan.com"
  },

  // BSC (mainnet)
  56: {
    providerEndpoint: "https://bsc-dataseed1.binance.org/",
    recipientEthereum: process.env["BSC_MAINNET_ADDRESS"],
    unirisTokenAddress: "0xb001f1e7c8bda414ac7cf7ecba5469fe8d24b6de",
    sourceChainExplorer: "https://bscscan.com"
  },

  // Ethereum (mainnet)
  1: {
    providerEndpoint: "https://mainnet.infura.io/v3/3a7a2dbdbec046a4961550ddf8c7d78a",
    recipientEthereum: process.env["ETHEREUM_MAINNET_ADDRESS"],
    unirisTokenAddress: "0x8a3d77e9d6968b780564936d15B09805827C21fa",
    sourceChainExplorer: "https://etherscan.io"
  }
}

export {
  bridgeSeed,
  bridgeAddress,
  baseSeedContract,
  ethConfig,
  hasSufficientFunds,
  getUCOPrice,
  archethicConnection,
  archethicEndpoint,
  getLastTransaction
};

let archethic

async function archethicConnection() {
  if (!archethic) {
    archethic = new Archethic(archethicEndpoint)
    await archethic.connect()
    console.log(`Connected to ${archethicEndpoint}`)
    return archethic
  }

  return archethic
}

async function hasSufficientFunds() {
  const archethicBalance = await getBridgeBalance()
  return archethicBalance > 1e8
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

    if (r.status != 200) {
      throw "Node not unavailable. Switch to another"
    }
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
    if (r.status != 200) {
      throw "Node not unavailable. Switch to another"
    }

    const res = await r.json();
    if (res.data.transactionInputs && res.data.transactionInputs.length > 0) {
      return res.data.transactionInputs
        .filter(r => r.type == "UCO")
        .reduce((acc, { amount: amount }) => acc + amount, 0)
    }
    return 0;
  })
}

async function getUCOPrice(timestamp) {
  const archethic = new Archethic(archethicEndpoint)
  await archethic.connect()

  let oracleData
  if (timestamp !== undefined) {
    oracleData = await archethic.network.getOracleData(timestamp)
  }
  else {
    oracleData = await archethic.network.getOracleData()
  }

  return oracleData.services.uco.usd

}

async function getLastTransaction(archethic, address) {
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
              lastTransaction(address: "${address}") {
                 address
              }
            }
          `
      })
    });

    if (r.status != 200) {
      throw "Node not unavailable. Switch to another"
    }
    const res = await r.json();

    if (res.data.lastTransaction && res.data.lastTransaction.address) {
      return res.data.lastTransaction.address;
    }

    throw "Network issue";
  })
}

export function getStandardDeviation(array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}
