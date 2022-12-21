import express from "express";
import Archethic from "archethic"
import fetch from "node-fetch"

import swapRoutes from "./swap.js";
import { archethicEndpoint, bridgeAddress, recipientEthereum, unirisTokenAddress } from "../utils.js"

const router = express.Router();

router.get("/status", async (_req, res) => {

  const balance = await getBridgeBalance()

  res.json({
    status: "ok",
    archethicEndpoint: archethicEndpoint,
    bridgeAddress: bridgeAddress,
    recipientEthereum: recipientEthereum,
    unirisTokenAddress: unirisTokenAddress,
    sufficientFunds: balance > 1e8 // Should have at least 1 UCO
  })
});

router.use("/swap", swapRoutes);

export default router;

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

