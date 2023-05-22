import { handleResponse } from "./utils.js";

export async function getConfig(ethChainId) {

    return fetch("/status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            ethereumChainId: ethChainId,
        }),
    })
        .then(handleResponse)
        .then((r) => {
            if (r.status != "ok") {
                throw r.status;
            }

            return {
                archethicEndpoint: r.archethicEndpoint,
                unirisTokenAddress: r.unirisTokenAddress,
                recipientEthereum: r.recipientEthereum,
                sufficientFunds: r.sufficientFunds,
                UCOPrice: r.UCOPrice,
                sourceChainExplorer: r.sourceChainExplorer,
                bridgeAddress: r.bridgeAddress,
                maxSwapDollar: r.maxSwapDollar
            };
        });
}
