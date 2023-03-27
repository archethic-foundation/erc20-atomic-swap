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
            $("#fromNetworkLabel").text("Polygon Mainnet");
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
            $("#fromNetworkLabel").text("BSC Mainnet");
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
            $("#fromNetworkLabel").text("Ethereum Mainnet");
            $("#toNetworkLabel").text("Archethic");
            break;
    }
    $("#sourceChainImg").attr("src", `assets/images/bc-logos/${sourceChainLogo}`);

    return fromChainName;
}
