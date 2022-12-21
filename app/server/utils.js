import { Crypto, Utils } from "archethic";
const archethicEndpoint =
  process.env["ARCHETHIC_ENDPOINT"] || "https://mainnet.archethic.net";

const bridgeSeed = "6D0270D3DFFC88C63C5D3DD977C18BC2401C088E9AEAEF37C515E8FC2537DBAA";
const bridgeAddress = Utils.uint8ArrayToHex(Crypto.deriveAddress(bridgeSeed, 0));
const baseSeedContract = "197D7B086613BCB8AB991683D39CC489C343662B3DFF7990B567A2D471D941E";

let recipientEthereum
let unirisTokenAddress

switch (process.env["ETHEREUM_ENDPOINT"]) {
  case "LOCAL":
    recipientEthereum = "0xCF026E727C1A5A71058316D223cA5BDb51c962A6"; // account #9
    unirisTokenAddress = process.env["ETHEREUM_UNIRIS_TOKEN"] || "0x6de6baDcC399a836258fa92d91EbA0a02cC40eE2"; // (mnemonic: test)
    break
  case "TESTNET":
    // TODO: define for testnet
    recipientEthereum = "";
    unirisTokenAddress = "";
  default:
    recipientEthereum = process.env["ETHEREUM_BRIDGE_ADDRESS"];
    unirisTokenAddress = "0x8a3d77e9d6968b780564936d15B09805827C21fa";
}

export {
  archethicEndpoint,
  bridgeSeed,
  bridgeAddress,
  baseSeedContract,
  recipientEthereum,
  unirisTokenAddress
};

