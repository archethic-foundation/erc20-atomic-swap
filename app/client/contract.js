
import { handleResponse } from "./utils.js";

export async function getERC20Contract(unirisTokenAddress, provider) {
    const unirisTokenABI = await getUnirisTokenABI();
    return new ethers.Contract(unirisTokenAddress, unirisTokenABI, provider);
}

export async function getHTLC_Contract(HTLC_Address, provider) {
    const { abi: HTLCABI } = await getHTLC();
    return new ethers.Contract(HTLC_Address, HTLCABI, provider)
}

export async function deployHTLC(
    recipientEthereum,
    unirisTokenAddress,
    amount,
    hash,
    signer,
    lockTime
) {
    const { abi: HTLCABI, bytecode: HTLCByteCode } = await getHTLC();
    const factory = new ethers.ContractFactory(HTLCABI, HTLCByteCode, signer);

    const contract = await factory.deploy(
        recipientEthereum,
        unirisTokenAddress,
        ethers.utils.parseUnits(amount, 18),
        hash,
        lockTime,
        { gasLimit: 1000000 }
    );

    const tx = await contract.deployTransaction.wait();
    console.log(tx);
    console.log("HTLC contract deployed at " + contract.address);

    return { contract: contract, transaction: tx }
}

async function transferTokensToHTLC(
    amount,
    HTLCAddress,
    unirisContract,
    signer
) {
    const unirisWithSigner = unirisContract.connect(signer);

    const tx = await unirisWithSigner.transfer(
        HTLCAddress,
        ethers.utils.parseUnits(amount, 18)
    );

    return await tx.wait()
}


export async function transferERC20(state) {
    const { HTLC_Contract, amount, unirisContract, signer, sourceChainExplorer } = state

    $("#ethTransferStep").addClass("is-active")
    const transferTokenTx = await transferTokensToHTLC(amount, HTLC_Contract.address, unirisContract, signer);
    localStorage.setItem("transferStep", "transferedERC20")

    // Update the pending transfer state
    const pendingTransferJSON = localStorage.getItem("pendingTransfer")
    let pendingTransfer = JSON.parse(pendingTransferJSON)
    pendingTransfer.erc20transferAddress = transferTokenTx.transactionHash
    localStorage.setItem("pendingTransfer", JSON.stringify(pendingTransfer))

    console.log(`${amount} UCO transfered`);

    $("#txSummary2Label").html(`Provision UCOs: <a href="${sourceChainExplorer}/tx/${transferTokenTx.transactionHash}" target="_blank">${transferTokenTx.transactionHash}</a>`)
    $("#txSummary2").show();
    $("#ethTransferStep").removeClass("is-active")

    state.erc20transferAddress = transferTokenTx.transactionHash
    return state
}

export async function deployArchethic(state) {
    const { HTLC_Contract, amount, secretDigestHex, recipientArchethic, ethChainId, toChainExplorer, HTLC_transaction } = state

    $("#archethicDeploymentStep").addClass("is-active");
    step = 3;

    const contractAddress = await sendDeployRequest(
        secretDigestHex,
        recipientArchethic,
        amount,
        HTLC_Contract.address,
        HTLC_transaction.transactionHash,
        ethChainId
    );
    localStorage.setItem("transferStep", "deployedArchethicContract")

    // Update the pending transfer state
    const pendingTransferJSON = localStorage.getItem("pendingTransfer")
    let pendingTransfer = JSON.parse(pendingTransferJSON)
    pendingTransfer.archethicContractAddress = contractAddress
    localStorage.setItem("pendingTransfer", JSON.stringify(pendingTransfer))

    console.log("Contract address on Archethic", contractAddress);
    $("#txSummary3Label").html(`Contract address on Archethic: <a href="${toChainExplorer}/${contractAddress}" target="_blank">${contractAddress}</a>`)
    $("#txSummary3").show();

    $("#archethicDeploymentStep").removeClass("is-active");

    state.archethicContractAddress = contractAddress
    return state
}


export async function withdrawEthereum(state) {
    const { HTLC_Contract, signer, secretHex, unirisContract, UCOPrice, sourceChainExplorer } = state

    const withdrawTx = await withdrawERC20Token(HTLC_Contract, signer, secretHex)
    localStorage.setItem("transferStep", "withdrawEthContract")

    // Update the pending transfer state
    const pendingTransferJSON = localStorage.getItem("pendingTransfer")
    let pendingTransfer = JSON.parse(pendingTransferJSON)
    pendingTransfer.withdrawEthereumAddress = withdrawTx.transactionHash
    localStorage.setItem("pendingTransfer", JSON.stringify(pendingTransfer))

    console.log(`Ethereum's withdraw transaction - ${withdrawTx.transactionHash}`);
    $("#txSummary4Label").html(`${fromChainName} swap: <a href="${sourceChainExplorer}/tx/${withdrawTx.transactionHash}" target="_blank">${withdrawTx.transactionHash}</a>`)
    $("#txSummary4").show();

    const ethAccount = await signer.getAddress();
    const erc20Balance = await unirisContract.balanceOf(ethAccount);
    const erc20Amount = ethers.utils.formatUnits(erc20Balance, 18);
    $("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(erc20Amount).toFixed(2)));
    let maxSwap = 20 / UCOPrice
    $("#maxUCOValue").text(Math.min(erc20Amount / UCOPrice, maxSwap).toFixed(5));
    $("#fromBalanceUSD").text((erc20Amount * UCOPrice).toFixed(5));

    state.withdrawEthereumAddress = withdrawTx.transactionHash
    return state
}

export async function withdrawArchethic({ archethicContractAddress, HTLC_Contract, withdrawEthereumAddress, secretHex, ethChainId, toChainExplorer }) {
    console.log(archethicContractAddress)
    const { archethicWithdrawTransaction, archethicTransferTransaction } = await sendWithdrawRequest(
        archethicContractAddress,
        HTLC_Contract.address,
        withdrawEthereumAddress,
        secretHex,
        ethChainId
    );
    localStorage.setItem("transferStep", "withdrawArchethicContract")

    console.log(`Archethic's withdraw transaction ${archethicWithdrawTransaction}`)
    console.log(`Archethic's transfer transaction ${archethicTransferTransaction}`)
    $("#txSummary5Label").html(`Archethic swap: <a href="${toChainExplorer}/${archethicWithdrawTransaction}" target="_blank">${archethicWithdrawTransaction}</a>`)
    $("#txSummary5").show();

    $("#txSummary6Label").html(`Archethic transfer: <a href="${toChainExplorer}/${archethicTransferTransaction}" target="_blank">${archethicTransferTransaction}</a>`)
    $("#txSummary6").show();
    $("#txSummaryFinished").show();
}


async function sendDeployRequest(
    secretDigestHex,
    recipientAddress,
    amount,
    ethereumContractAddress,
    ethereumContractTransaction,
    ethChainId
) {
    const endTime = new Date();
    endTime.setSeconds(endTime.getSeconds() + 10000);
    const endTimeUNIX = Math.floor(endTime / 1000);

    return fetch("/swap/deployContract", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            secretHash: secretDigestHex,
            recipientAddress: recipientAddress,
            amount: amount * 1e8,
            endTime: endTimeUNIX,
            ethereumContractAddress: ethereumContractAddress,
            ethereumContractTransaction,
            ethereumChainId: ethChainId,
        }),
    })
        .then(handleResponse)
        .then((r) => r.contractAddress);
}

async function withdrawERC20Token(HTLC_Contract, signer, secret) {
    const HTLC_ContractSigner = await HTLC_Contract.connect(signer)
    const tx = await HTLC_ContractSigner.withdraw(`0x${secret}`, { gasLimit: 10000000 })
    return await tx.wait()
}

async function sendWithdrawRequest(
    archethicContractAddress,
    ethereumContractAddress,
    ethereumWithdrawTransaction,
    secret,
    ethChainId
) {
    return fetch("/swap/withdraw", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            archethicContractAddress: archethicContractAddress,
            ethereumContractAddress: ethereumContractAddress,
            ethereumWithdrawTransaction: ethereumWithdrawTransaction,
            secret: secret,
            ethereumChainId: ethChainId,
        }),
    }).then(handleResponse)
        .then(r => {
            const { archethicWithdrawTransaction, archethicTransferTransaction } = r
            return { archethicWithdrawTransaction, archethicTransferTransaction }
        })
}

async function getUnirisTokenABI() {
    const r = await fetch("uco_abi.json");
    return await r.json();
}

async function getHTLC() {
    const r = await fetch("HTLC.json");
    const r_1 = await r.json();
    return {
        abi: r_1.abi,
        bytecode: r_1.bytecode,
    };
}
