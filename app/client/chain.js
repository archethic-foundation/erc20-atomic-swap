import { handleResponse } from "./utils.js";

export function initChainContext(ethChainId) {

    switch (ethChainId) {
        case 80001:
            sourceChainLogo = "Polygon-logo.svg";
            fromChainName = "Polygon";

            $("#fromChain").text(fromChainName)
            $("#fromNetworkLabel").text("Mumbai Polygon Testnet");
            $("#toNetworkLabel").text("Archethic Testnet");
            break;
        case 137:
            sourceChainLogo = "Polygon-logo.svg";
            fromChainName = "Polygon";

            $("#fromChain").text(fromChainName);
            $("#fromNetworkLabel").text("Polygon");
            $("#toNetworkLabel").text("Archethic");
            break;
        case 97:
            sourceChainLogo = "BSC-logo.svg";
            fromChainName = "Binance";

            $("#fromChain").text(fromChainName);
            $("#fromNetworkLabel").text("BSC Testnet");
            $("#toNetworkLabel").text("Archethic Testnet");
            break;
        case 56:
            sourceChainLogo = "BSC-logo.svg";
            fromChainName = "Binance";

            $("#fromChain").text(fromChainName);
            $("#fromNetworkLabel").text("BSC");
            $("#toNetworkLabel").text("Archethic");
            break;
        case 5:
            sourceChainLogo = "Ethereum-logo.svg";
            fromChainName = "Ethereum";

            $("#fromChain").text(fromChainName);
            $("#fromNetworkLabel").text("Goerli Ethereum Testnet");
            $("#toNetworkLabel").text("Archethic Testnet");
            break;
        case 1337:
            sourceChainLogo = "Ethereum-logo.svg";
            fromChainName = "Ethereum";

            $("#fromChain").text(fromChainName);
            $("#fromNetworkLabel").text("Ethereum Devnet");
            $("#toNetworkLabel").text("Archethic Devnet");
            break;
        default:
            sourceChainLogo = "Ethereum-logo.svg";
            fromChainName = "Ethereum";

            $("#fromChain").text(fromChainName);
            $("#fromNetworkLabel").text("Ethereum");
            $("#toNetworkLabel").text("Archethic");
            break;
    }
    $("#sourceChainImg").attr("src", `assets/images/bc-logos/${sourceChainLogo}`);

    return fromChainName;
}

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
                bridgeAddress: r.bridgeAddress
            };
        });
}
