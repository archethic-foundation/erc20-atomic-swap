import express from "express";

import swapRoutes from "./swap.js";
import { archethicEndpoint, bridgeAddress, ethConfig, hasSufficientFunds, getUCOPrice } from "../utils.js"
const router = express.Router();

router.post("/status", async (req, res) => {

  const ethChainId = req.body.ethereumChainId
  const networkConf = ethConfig[ethChainId]
  if (networkConf === undefined) {
    return res.json({
      status: `Network not supported`
    })
  }

  const { recipientEthereum, unirisTokenAddress } = networkConf

  res.json({
    status: "ok",
    archethicEndpoint: archethicEndpoint,
    bridgeAddress: bridgeAddress,
    recipientEthereum: recipientEthereum,
    unirisTokenAddress: unirisTokenAddress,
    sufficientFunds: await hasSufficientFunds(ethChainId),
    UCOPrice: await getUCOPrice()
  })
});

router.use("/swap", swapRoutes);

export default router;

