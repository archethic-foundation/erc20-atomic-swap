import express from "express";
import swapRoutes from "./swap.js";
import { archethicEndpoint, bridgeAddress, recipientEthereum, unirisTokenAddress } from "../utils.js"

const router = express.Router();

router.get("/status", (_req, res) =>
  res.json({
    status: "ok",
    archethicEndpoint: archethicEndpoint,
    bridgeAddress: bridgeAddress,
    recipientEthereum: recipientEthereum,
    unirisTokenAddress: unirisTokenAddress
  })
);

router.use("/swap", swapRoutes);

export default router;
