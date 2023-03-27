import express from "express";

import swapRoutes from "./swap.js";
import balanceRoutes from "./balance.js";

import { enabledNetworks, bridgeAddress, ethConfig, hasSufficientFunds, getUCOPrice, archethicEndpoint } from "../utils.js"
const router = express.Router();

router.post("/status", async (req, res) => {

    const ethChainId = req.body.ethereumChainId
    const networkConf = ethConfig[ethChainId]
    if (networkConf === undefined) {
        return res.json({
            status: `Network not supported`
        })
    }

    if (!enabledNetworks.includes(ethChainId)) {
        return res.json({
            status: `Network not supported`
        })
    }

    const { recipientEthereum, unirisTokenAddress, sourceChainExplorer } = networkConf

    res.json({
        status: "ok",
        archethicEndpoint: archethicEndpoint,
        bridgeAddress: bridgeAddress,
        recipientEthereum: recipientEthereum,
        unirisTokenAddress: unirisTokenAddress,
        sufficientFunds: await hasSufficientFunds(),
        UCOPrice: await getUCOPrice(),
        sourceChainExplorer: sourceChainExplorer
    })
});

router.use("/swap", swapRoutes)
router.use("/balances", balanceRoutes)


export default router;

