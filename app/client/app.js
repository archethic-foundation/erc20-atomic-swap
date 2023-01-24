import { initProgressBar, initPageBridge, initTransfer } from "./ui.js";
import { initChainContext } from "./chain.js";
import { uint8ArrayToHex, handleError } from "./utils.js";
import { getERC20Contract, getHTLC_Contract, deployHTLC, transferERC20, deployArchethic, withdrawEthereum, withdrawArchethic } from "./contract";
import { getArchethicBalance, getConfig } from "./service.js";

window.onload = async function () {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
  } else {
    throw "No ethereum provider is installed";
  }
};

$("#connectMetamaskBtn").on("click", async () => {
  try {
    $("#connectMetamaskBtn").hide();
    $("#connectMetamaskBtnSpinner").show();
    provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    await startApp(provider);
  }
  catch (e) {
    $("#connectMetamaskBtnSpinner").hide();
    $("#connectMetamaskBtn").show();
    $("#error")
      .text(`${e.message || e}`)
      .show();
  }
});

let toChainExplorer;
let fromChainName;
let step;

async function startApp(provider) {

  const { chainId: ethChainId } = await provider.getNetwork();
  const signer = provider.getSigner();

  let fromChainName = initChainContext(ethChainId);
  console.log(fromChainName);

  const {
    archethicEndpoint,
    unirisTokenAddress,
    recipientEthereum,
    sufficientFunds,
    UCOPrice,
    sourceChainExplorer,
    bridgeAddress
  } = await getConfig(ethChainId);

  initPageBridge();

  let maxSwap = (20 / UCOPrice).toFixed(5);
  $("#nbTokensToSwap").attr("max", maxSwap);

  toChainExplorer = `${archethicEndpoint}/explorer/transaction`;

  $("#ucoPrice").text(`1 UCO = ${UCOPrice.toFixed(5)}$`).show();
  $("#swapBalanceUSD").text(0);

  if (!sufficientFunds) {
    $("#error").text(
      "Bridge has insuffficient funds. Please retry later..."
    );
    return;
  }

  console.log("Archethic endpoint: ", archethicEndpoint);

  const account = await signer.getAddress();
  const unirisContract = await getERC20Contract(unirisTokenAddress, provider);

  const balance = await unirisContract.balanceOf(account);
  const erc20Amount = ethers.utils.formatUnits(balance, 18);
  $("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(erc20Amount).toFixed(8)));
  $("#maxUCOValue").attr("value", Math.min(erc20Amount, maxSwap).toFixed(5));
  $("#fromBalanceUSD").text(new Intl.NumberFormat().format((erc20Amount * UCOPrice).toFixed(5)));

  $("#recipientAddress").on("change", async (e) => {
    const archethicBalance = await getArchethicBalance($(e.target).val());

    const ucoAmount = archethicBalance / 1e8

    $("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(ucoAmount).toFixed(8)));
    $("#toBalanceUSD").text(new Intl.NumberFormat().format((UCOPrice * ucoAmount).toFixed(5)));
    $('#btnSwap').prop('disabled', false);
  });

  $("#recipientAddress").focus();

  $("#nbTokensToSwap").on("input", (e) => {
    const amount = $(e.target).val();
    $("#swapBalanceUSD").text((amount * UCOPrice).toFixed(5));
  })


  $("#maxButton").on("click", () => {
    const amount = $("#maxUCOValue").val();
    $("#nbTokensToSwap").val(amount);
    $("#swapBalanceUSD").text((amount * UCOPrice).toFixed(5));
  });

  let pendingTransferJSON = localStorage.getItem("pendingTransfer");
  if (pendingTransferJSON) {

    initProgressBar();

    $("#btnSwapSpinnerText").text("Loading previous transfer");
    $("#btnSwapSpinner").show();
    $("#btnSwap").hide();

    const pendingTransfer = JSON.parse(pendingTransferJSON);
    const state = {
      HTLC_Contract: await getHTLC_Contract(pendingTransfer.HTLC_Address, provider),
      HTLC_transaction: pendingTransfer.HTLC_transaction,
      secretHex: pendingTransfer.secretHex,
      secretDigestHex: pendingTransfer.secretDigestHex,
      amount: pendingTransfer.amount,
      UCOPrice: UCOPrice,
      ethChainId: ethChainId,
      recipientEthereum: recipientEthereum,
      recipientArchethic: pendingTransfer.recipientArchethic,
      unirisContract: unirisContract,
      signer: signer,
      erc20transferAddress: pendingTransfer.erc20transferAddress,
      archethicContractAddress: pendingTransfer.archethicContractAddress,
      withdrawEthereumAddress: pendingTransfer.withdrawEthereumAddress,
      sourceChainExplorer: sourceChainExplorer,
      toChainExplorer: toChainExplorer
    }

    $("#recipientAddress").val(pendingTransfer.recipientArchethic);
    $("#nbTokensToSwap").val(pendingTransfer.amount);
    const archethicBalance = await getArchethicBalance(pendingTransfer.recipientArchethic);

    const ucoAmount = archethicBalance / 1e8

    $("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(ucoAmount).toFixed(8)));
    $("#toBalanceUSD").text(new Intl.NumberFormat().format((UCOPrice * ucoAmount).toFixed(5)));
    $("#swapBalanceUSD").text((pendingTransfer.amount * UCOPrice).toFixed(5));

    $("#steps").show();

    $("#ethDeploymentStep").removeClass("is-active");
    $("#txSummary1Label").html(`Contract address on ${fromChainName}: <a href="${sourceChainExplorer}/address/${pendingTransfer.HTLC_Address}" target="_blank">${pendingTransfer.HTLC_Address}</a>`)
    $("#txSummary1").show();
    $("#ethTransferStep").addClass("is-active");

    step = 2

    if (pendingTransfer.erc20transferAddress) {
      step = 3
      $("#txSummary2Label").html(`Provision UCO: <a href="${sourceChainExplorer}/tx/${pendingTransfer.erc20transferAddress}" target="_blank">${pendingTransfer.erc20transferAddress}</a>`)
      $("#txSummary2").show();
      $("#ethTransferStep").removeClass("is-active");
      $("#archethicDeploymentStep").addClass("is-active");
    }

    if (pendingTransfer.archethicContractAddress) {
      step = 4
      $("#txSummary3Label").html(`Contract address on Archethic: <a href="${toChainExplorer}/${pendingTransfer.archethicContractAddress}" target="_blank">${pendingTransfer.archethicContractAddress}</a>`)
      $("#txSummary3").show();
      $("#archethicDeploymentStep").removeClass("is-active");
      $("#swapStep").addClass("is-active");
    }

    if (pendingTransfer.withdrawEthereumAddress) {
      $("#txSummary4Label").html(`${fromChainName} swap: <a href="${sourceChainExplorer}/tx/${pendingTransfer.withdrawEthereumAddress}" target="_blank">${pendingTransfer.withdrawEthereumAddress}</a>`)
      $("#txSummary4").show();
      $("#swapStep").removeClass("is-active");
    }

    $("#btnSwapSpinner").hide();
    $("#btnSwap").show();
    $("#btnSwap").prop("disabled", false);

    $("#swapForm").off();
    $("#swapForm").on("submit", async (e) => {
      e.preventDefault();
      changeBtnToTransferInProgress();
      try {
        await goto(localStorage.getItem("transferStep"), state, UCOPrice);
      }
      catch (e) {
        handleError(e, step);
      }
    })
    return
  }

  $("#swapForm").on("submit", async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      return;
    }


    const recipientAddress = $("#recipientAddress").val();
    await handleFormSubmit(
      signer,
      unirisContract,
      recipientEthereum,
      recipientAddress,
      ethChainId,
      UCOPrice,
      sourceChainExplorer,
      bridgeAddress,
      fromChainName,
      erc20Amount
    );
  });

}

async function handleFormSubmit(
  signer,
  unirisContract,
  recipientEthereum,
  recipientArchethic,
  ethChainId,
  UCOPrice,
  sourceChainExplorer,
  bridgeAddress,
  fromChainName,
  erc20Amount
) {

  initTransfer();

  var step = 0;

  const amount = $("#nbTokensToSwap").val();
  if (erc20Amount < amount) {
    $("#btnSwapSpinner").hide();
    $("#btnSwap").show();
    $("#btnSwap").prop("disabled", false);

    $("#error").text(`Insufficient UCO on ${fromChainName}`)
    return
  }

  const bridgeBalance = await getArchethicBalance(bridgeAddress)
  if (bridgeBalance <= amount * 10e8) {
    $("#error").text(
      "Bridge has insuffficient funds. Please retry later..."
    );
    return;
  }

  $("#steps").show();

  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);

  const secretHex = uint8ArrayToHex(secret);

  let secretDigest = await crypto.subtle.digest("SHA-256", secret);
  secretDigest = new Uint8Array(secretDigest);

  const secretDigestHex = uint8ArrayToHex(secretDigest);

  $("#ethDeploymentStep").addClass("is-active");
  step = 1;

  try {
    const { contract: HTLC_Contract, transaction: HTLC_tx } = await deployHTLC(
      recipientEthereum,
      unirisContract.address,
      amount,
      secretDigest,
      signer,
      7200 // 2 hours of locktime
    );
    localStorage.setItem("pendingTransfer", JSON.stringify({
      HTLC_Address: HTLC_Contract.address,
      secretHex: secretHex,
      secretDigestHex: secretDigestHex,
      amount: amount,
      recipientArchethic: recipientArchethic,
      HTLC_transaction: HTLC_tx
    }))
    localStorage.setItem("transferStep", "deployedEthContract")

    $("#ethDeploymentStep").removeClass("is-active");

    const HTLCAddress = HTLC_Contract.address

    $("#txSummary1Label").html(`Contract address on ${fromChainName}: <a href="${sourceChainExplorer}/address/${HTLC_Contract.address}" target="_blank">${HTLC_Contract.address}</a>`)
    $("#txSummary1").show();

    let state = {
      HTLC_Contract: HTLC_Contract,
      secretHex: secretHex,
      secretDigestHex: secretDigestHex,
      amount: amount,
      UCOPrice: UCOPrice,
      ethChainId: ethChainId,
      recipientEthereum: recipientEthereum,
      recipientArchethic: recipientArchethic,
      unirisContract: unirisContract,
      signer: signer,
      sourceChainExplorer: sourceChainExplorer,
      toChainExplorer: toChainExplorer,
      HTLC_transaction: HTLC_tx
    }
    await goto("deployedEthContract", state, UCOPrice)

  } catch (e) {
    handleError(e, step)
  }
}

async function goto(step, state, UCOPrice) {
  switch (step) {
    case "deployedEthContract":
      step = 2
      state = await transferERC20(state)
      return await goto("transferedERC20", state, UCOPrice)
    case "transferedERC20":
      step = 3
      state = await deployArchethic(state)
      return await goto("deployedArchethicContract", state, UCOPrice)
    case "deployedArchethicContract":
      step = 4
      $("#swapStep").addClass("is-active");
      state = await withdrawEthereum(state)
      return await goto("withdrawEthContract", state, UCOPrice)
    case "withdrawEthContract":
      await withdrawArchethic(state)

      $("#swapStep").removeClass("is-active");
      $("#btnSwapSpinner").hide()
      $('#btnSwap').prop('disabled', false);
      $('#btnSwap').show()
      $('#nbTokensToSwap').prop('disabled', false);
      $('#recipientAddress').prop('disabled', false);

      console.log("Token swap finish");
      localStorage.removeItem("transferStep")
      localStorage.removeItem("pendingTransfer")

      setTimeout(async () => {
        const archethicBalance = await getArchethicBalance(state.recipientArchethic);

        const newUCOBalance = archethicBalance / 1e8

        $("#toBalanceUCO").text(parseFloat(newUCOBalance).toFixed(2));
        $("#toBalanceUSD").text(UCOPrice * newUCOBalance)

      }, 2000)
      break
  }
}
