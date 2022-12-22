import express from "express";

import swapRoutes from "./swap.js";
import { archethicEndpoint, bridgeAddress, ethConfig, hasSufficientFunds } from "../utils.js"
const router = express.Router();

router.post("/status", async (req, res) => {

  const ethChainId = req.body.ethereumChainId
  const { recipientEthereum, unirisTokenAddress } = ethConfig[ethChainId]

  res.json({
    status: "ok",
    archethicEndpoint: archethicEndpoint,
    bridgeAddress: bridgeAddress,
    recipientEthereum: recipientEthereum,
    unirisTokenAddress: unirisTokenAddress,
    sufficientFunds: await hasSufficientFunds(ethChainId)
  })
});

router.use("/swap", swapRoutes);

export default router;

