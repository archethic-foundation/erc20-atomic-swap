import { initPageBridge, initTransfer, changeBtnToTransferInProgress, displayConnectionError, initReConnectionScreen, showConfirmationDialog, showRefundDialog } from "./ui.js";
import { initChainContext } from "./chain.js";
import { uint8ArrayToHex, handleError, exportLocalStorage, clearLocalStorage, getTimeRemaining } from "./utils.js";
import { getERC20Contract, getHTLC_Contract, deployHTLC, transferERC20, deployArchethic, withdrawEthereum, withdrawArchethic, refundERC, getHTLCLockTime } from "./contract";
import { getArchethicBalance, getConfig } from "./service.js";

let provider;
let interval;

window.onload = async function () {
  try {
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!");
      // Check if metamask is alredy connected
      if (localStorage.getItem("walletInjected?")) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        // Already connected, start app
        $("#connectMetamaskBtn").hide();
        $("#connectMetamaskBtnSpinner").show();
        handleNetworkChange()
        await provider.send("eth_requestAccounts", []);
        await startApp()
      }
    } else {
      throw "No ethereum provider is installed"
    }
  } catch (e) {
    localStorage.setItem("walletInjected?", false)
    displayConnectionError(e.message || e)
  }
};

$("#connectMetamaskBtn").on("click", async () => {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  try {
    $("#connectMetamaskBtn").hide();
    $("#connectMetamaskBtnSpinner").show();
    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    localStorage.setItem("walletInjected?", true)
    handleNetworkChange()
    await startApp();
  }
  catch (e) {
    displayConnectionError(e.message || e)
  }
});

$('#clearLocalStorage').click(function () {
  showConfirmationDialog("WARNING", "Are you sure you want to clear the local data about the bridge?<br/><br/>If you have a transfer in progress, it will be lost and cannot be completed or refunded.", function (result) {
    if (result) {
      clearLocalStorage();
      $("#recipientAddress").val('');
      $("#nbTokensToSwap").val('');
      location.reload();
    }
  });
  return false;
});


$('#exportLocalStorage').click(function () {
  exportLocalStorage();
});

$('#exportLocalStorageModal').click(function () {
  exportLocalStorage();
});

$('#exportLocalStorageModalRefund').click(function () {
  exportLocalStorage();
});

$('#refund').click(function () {
  showRefundDialog("Refund", `Please, fill your ${fromChainName} contract address to refund`, async function (isOk, contractAddress) {
    if (isOk) {
      var dots = window.setInterval(function () {
        var wait = $('#loading-dots');
        if (wait.html().length > 2)
          wait.html("");
        else
          wait.append(".");
      }, 500);

      var endDate = 0;
      try {
        $("#errorRefund").text("")
        $("#refundFinished").hide();
        $("#infoRefund").show();
        $("#refundInProgress").show();

        console.log("Refund contract", contractAddress)
        const contract = await getHTLC_Contract(contractAddress, provider)
        endDate = await getHTLCLockTime(contract);
        console.log('endDate' + endDate);
        const tx = await refundERC(contract, signer)
        $("#refundInProgress").hide();
        $("#refundFinished").show();
        clearLocalStorage();
        console.log("Refund tx", tx.transactionHash)
      }
      catch (e) {
        $("#refundInProgress").hide();

        let errorMsg = e
        if (e.data && e.data.message) {
          errorMsg = e.data.message
        } else if (e.message) {
          errorMsg = e.message
        }
        if (errorMsg.includes("Response has no error or result for request")) {
          $("#errorRefund")
            .text(`Please, connect to the internet.`)
            .show();
        }
        else {
          if (errorMsg.includes("Too early")) {
            var t = getTimeRemaining(endDate);
            $("#errorRefund")
              .text(`You can retrieve your funds in ${('0' + t.hours).slice(-2) + 'h' + ('0' + t.minutes).slice(-2) + 'm' + ('0' + t.seconds).slice(-2)}.`)
              .show();
          }
          else {
            $("#errorRefund")
              .text(`${errorMsg}`)
              .show();
          }
        }


      }
      clearInterval(dots);
    }
  });
  return false;
});

function handleNetworkChange() {
  // Handle chain changement
  provider.provider.on("chainChanged", _chainId => {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    initReConnectionScreen()
    clearInterval(interval)
    startApp().catch(e => displayConnectionError(e.message || e))
  })
}

let toChainExplorer;
let step;
let ucoPrice;
let signer;

async function startApp() {
  const { chainId: ethChainId } = await provider.getNetwork();
  signer = provider.getSigner();

  let fromChainName = initChainContext(ethChainId);

  const {
    archethicEndpoint,
    unirisTokenAddress,
    recipientEthereum,
    sufficientFunds,
    UCOPrice,
    sourceChainExplorer,
    bridgeAddress,
    maxSwapDollar
  } = await getConfig(ethChainId);

  ucoPrice = UCOPrice

  initPageBridge();

  const maxSwap = (maxSwapDollar / UCOPrice).toFixed(5);
  $("#maxSwap").text(maxSwapDollar);
  $("#nbTokensToSwap").attr("max", maxSwap);

  toChainExplorer = `${archethicEndpoint}/explorer/transaction`;

  $("#ucoPrice").text(`1 UCO = ${UCOPrice.toFixed(5)}$`).show();
  $("#swapBalanceUSD").text(0);

  if (!sufficientFunds) {
    $("#error").text(
      "Bridge has insufficient funds. Please retry later..."
    );
    $("#workflow").show()
    $("#close").css({ visibility: 'hidden' })
    return;
  }

  console.log("Archethic endpoint: ", archethicEndpoint);

  const unirisContract = await getERC20Contract(unirisTokenAddress, provider);

  // Display signer account
  const account = await signer.getAddress();
  let erc20Amount = await setupEthAccount(account, unirisContract, sourceChainExplorer, ucoPrice, maxSwapDollar)

  // Handle account change
  provider.provider.on('accountsChanged', async (accounts) => {
    const account = accounts[0]
    erc20Amount = await setupEthAccount(account, unirisContract, sourceChainExplorer, ucoPrice, maxSwapDollar)
  })

  // Update the UCO price
  interval = setInterval(async () => {
    const { UCOPrice } = await getConfig(ethChainId)
    if (UCOPrice != ucoPrice) {
      $("#ucoPrice").text(`1 UCO = ${UCOPrice.toFixed(5)}$`).show();
      const maxSwap = (maxSwapDollar / UCOPrice).toFixed(5);
      $("#nbTokensToSwap").attr("max", maxSwap);

      const erc20Amount = parseFloat($("#fromBalanceUCO").text())
      const usd = (erc20Amount * UCOPrice).toFixed(5)

      $("#fromBalanceUSD").text(new Intl.NumberFormat(usd));
      $("#maxUCOValue").attr("value", Math.min(erc20Amount, maxSwap).toFixed(5));

      ucoPrice = UCOPrice
    }
  }, 5000)

  $("#recipientAddress").on("change", async (e) => {
    const archethicBalance = await getArchethicBalance($(e.target).val());

    const ucoAmount = archethicBalance / 1e8

    $("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(ucoAmount).toFixed(8)));
    $("#toBalanceUSD").text(new Intl.NumberFormat().format((ucoPrice * ucoAmount).toFixed(5)));
    $('#btnSwap').prop('disabled', false);
  });

  $("#recipientAddress").focus();

  $("#nbTokensToSwap").on("input", (e) => {
    const amount = $(e.target).val();
    $("#swapBalanceUSD").text((amount * ucoPrice).toFixed(5));
  })


  $("#maxButton").on("click", () => {
    const amount = $("#maxUCOValue").val();
    $("#nbTokensToSwap").val(amount);
    $("#swapBalanceUSD").text((amount * ucoPrice).toFixed(5));
  });

  $("#close").on("click", () => {
    $("#workflow").hide();
  });

  $("#closeInfoRefund").on("click", () => {
    $("#infoRefund").hide();
  });

  let pendingTransferJSON = localStorage.getItem("pendingTransfer");
  let state
  if (pendingTransferJSON) {
    state = await initState(pendingTransferJSON, ethChainId, unirisContract, toChainExplorer, recipientEthereum, signer)
  }

  $("#swapForm").on("submit", async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      return;
    }

    $("#error").text("")

    if (state) {
      changeBtnToTransferInProgress();
      try {
        await goto(localStorage.getItem("transferStep"), state);
      }
      catch (e) {
        handleError(e, step, JSON.parse(pendingTransferJSON, ethChainId));
      }
      return
    }

    const recipientAddress = $("#recipientAddress").val();
    await handleFormSubmit(
      signer,
      unirisContract,
      recipientEthereum,
      recipientAddress,
      ethChainId,
      sourceChainExplorer,
      bridgeAddress,
      fromChainName,
      erc20Amount
    );
  });

}

async function setupEthAccount(account, unirisContract, sourceChainExplorer, ucoPrice, maxSwapDollar) {
  let accountStr = account
  if (account.length > 4) {
    accountStr = account.substring(0, 5) + "..." + account.substring(account.length - 3);
  }
  $("#accountName").html(`Account<br><a href="${sourceChainExplorer}/address/${account}" target="_blank">${accountStr}</a>`)

  const maxSwap = (maxSwapDollar / ucoPrice).toFixed(5);

  const erc20Amount = await setERC20Amount(account, unirisContract, ucoPrice)
  $("#maxUCOValue").attr("value", Math.min(erc20Amount, maxSwap).toFixed(5));
  return erc20Amount;
}

async function setERC20Amount(account, unirisContract, ucoPrice) {
  const balance = await unirisContract.balanceOf(account);
  const erc20Amount = ethers.utils.formatUnits(balance, 18);
  $("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(erc20Amount).toFixed(8)));
  $("#fromBalanceUSD").text(new Intl.NumberFormat().format((erc20Amount * ucoPrice).toFixed(5)));
  return erc20Amount
}

async function handleFormSubmit(
  signer,
  unirisContract,
  recipientEthereum,
  recipientArchethic,
  ethChainId,
  sourceChainExplorer,
  bridgeAddress,
  fromChainName,
  erc20Amount
) {

  await new Promise((resolve, reject) => {
    showConfirmationDialog("DISCLAIMER", "I understand that the transferred UCOs can only be used on the Archethic Public Blockchain and can't be withdrawn or transferred back until a two-way bridge is launched.", function (result) {
      if (result == false) {
        reject("User declined disclaimer");
      } else {
        resolve();
      }
    });
  });

  initTransfer();

  step = 0;

  const amount = $("#nbTokensToSwap").val();
  //console.log(erc20Amount)
  //console.log(amount)
  //console.log(erc20Amount < amount)


  if (erc20Amount * 1e18 < amount * 1e18) {
    $("#btnSwapSpinner").hide();
    $("#btnSwap").show();
    $("#btnSwap").prop("disabled", false);

    $("#error").text(`Insufficient UCO on ${fromChainName}`);
    $("#close").show();
    return
  }

  const bridgeBalance = await getArchethicBalance(bridgeAddress)
  if (bridgeBalance <= amount * 1e8) {
    $("#error").text(
      "Bridge has insuffficient funds. Please retry later..."
    );
    $("#close").show();
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
      HTLC_transaction: HTLC_tx,
      sourceChainName: fromChainName,
      sourceChainExplorer: sourceChainExplorer
    }))
    localStorage.setItem("transferStep", "deployedEthContract")

    $("#ethDeploymentStep").removeClass("is-active");

    $("#txSummary1Label").html(`Contract address on ${fromChainName}: <a href="${sourceChainExplorer}/address/${HTLC_Contract.address}" target="_blank">${HTLC_Contract.address}</a>`)
    $("#txSummary1").show();

    let state = {
      HTLC_Contract: HTLC_Contract,
      secretHex: secretHex,
      secretDigestHex: secretDigestHex,
      amount: amount,
      ethChainId: ethChainId,
      recipientEthereum: recipientEthereum,
      recipientArchethic: recipientArchethic,
      unirisContract: unirisContract,
      signer: signer,
      sourceChainExplorer: sourceChainExplorer,
      toChainExplorer: toChainExplorer,
      HTLC_transaction: HTLC_tx,
      sourceChainName: fromChainName
    }
    await goto("deployedEthContract", state)

  } catch (e) {
    let pendingTransferJSON = localStorage.getItem("pendingTransfer");
    let state = JSON.parse(pendingTransferJSON)
    handleError(e, step, state, ethChainId)
  }
}

async function goto(step, state) {
  switch (step) {
    case "deployedEthContract":
      step = 2
      state = await transferERC20(state)
      setERC20Amount(await state.signer.getAddress(), state.unirisContract, ucoPrice)
      return await goto("transferedERC20", state)
    case "transferedERC20":
      step = 3
      state = await deployArchethic(state)
      return await goto("deployedArchethicContract", state)
    case "deployedArchethicContract":
      step = 4
      $("#swapStep").addClass("is-active");
      state = await withdrawEthereum(state)
      return await goto("withdrawEthContract", state)
    case "withdrawEthContract":
      await withdrawArchethic(state)

      $("#swapStep").removeClass("is-active");
      $("#btnSwapSpinner").hide()
      $('#btnSwap').prop('disabled', false);
      $('#btnSwap').show()
      $('#nbTokensToSwap').prop('disabled', false);
      $('#recipientAddress').prop('disabled', false);
      $("#close").show();

      console.log("Token swap finish");
      localStorage.removeItem("transferStep")
      localStorage.removeItem("pendingTransfer")
      $("#recipientAddress").prop('disabled', false)
      $("#nbTokensToSwap").prop('disabled', false)

      setERC20Amount(await state.signer.getAddress(), state.unirisContract, ucoPrice)

      setTimeout(async () => {
        const archethicBalance = await getArchethicBalance(state.recipientArchethic);

        const newUCOBalance = archethicBalance / 1e8

        $("#toBalanceUCO").text(parseFloat(newUCOBalance).toFixed(2));
        $("#toBalanceUSD").text((ucoPrice * newUCOBalance).toFixed(5));

      }, 2000)
      break
  }
}

async function initState(pendingTransferJSON, ethChainId, unirisContract, toChainExplorer, recipientEthereum, signer) {

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
    ethChainId: ethChainId,
    recipientEthereum: recipientEthereum,
    recipientArchethic: pendingTransfer.recipientArchethic,
    unirisContract: unirisContract,
    signer: signer,
    erc20transferAddress: pendingTransfer.erc20transferAddress,
    archethicContractAddress: pendingTransfer.archethicContractAddress,
    withdrawEthereumAddress: pendingTransfer.withdrawEthereumAddress,
    sourceChainExplorer: pendingTransfer.sourceChainExplorer,
    toChainExplorer: toChainExplorer,
    sourceChainName: pendingTransfer.sourceChainName
  }

  $("#recipientAddress").val(pendingTransfer.recipientArchethic);
  $("#recipientAddress").prop('disabled', true)
  $("#nbTokensToSwap").val(pendingTransfer.amount);
  $("#nbTokensToSwap").prop('disabled', true)

  const archethicBalance = await getArchethicBalance(pendingTransfer.recipientArchethic);

  const ucoAmount = archethicBalance / 1e8

  $("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(ucoAmount).toFixed(8)));
  $("#toBalanceUSD").text(new Intl.NumberFormat().format((ucoPrice * ucoAmount).toFixed(5)));
  $("#swapBalanceUSD").text((pendingTransfer.amount * ucoPrice).toFixed(5));

  $("#ethDeploymentStep").removeClass("is-active is-failed");
  $("#txSummary1Label").html(`Contract address on ${pendingTransfer.sourceChainName}: <a href="${pendingTransfer.sourceChainExplorer}/address/${pendingTransfer.HTLC_Address}" target="_blank">${pendingTransfer.HTLC_Address}</a>`)
  $("#txSummary1").show();
  $("#ethTransferStep").addClass("is-active");

  step = 2

  if (pendingTransfer.erc20transferAddress) {
    step = 3
    $("#txSummary2Label").html(`Provision UCOs: <a href="${pendingTransfer.sourceChainExplorer}/tx/${pendingTransfer.erc20transferAddress}" target="_blank">${pendingTransfer.erc20transferAddress}</a>`)
    $("#txSummary2").show();
  }

  if (pendingTransfer.archethicContractAddress) {
    step = 4
    $("#txSummary3Label").html(`Contract address on Archethic: <a href="${toChainExplorer}/${pendingTransfer.archethicContractAddress}" target="_blank">${pendingTransfer.archethicContractAddress}</a>`)
    $("#txSummary3").show();
  }

  if (pendingTransfer.withdrawEthereumAddress) {
    $("#txSummary4Label").html(`${fromChainName} swap: <a href="${pendingTransfer.sourceChainExplorer}/tx/${pendingTransfer.withdrawEthereumAddress}" target="_blank">${pendingTransfer.withdrawEthereumAddress}</a>`)
    $("#txSummary4").show();
  }

  $("#btnSwapSpinner").hide();
  $("#btnSwap").show();
  $("#btnSwap").prop("disabled", false);

  // Reset error steps
  switch (step) {
    case 2:
      $("#ethTransferStep").addClass("is-active");
      $("#ethTransferStep").removeClass("is-failed");
      $("#ethDeploymentStep").removeClass("is-active is-failed");
      break;
    case 3:
      $("#archethicDeploymentStep").addClass("is-active");
      $("#archethicDeploymentStep").removeClass("is-failed");
      $("#ethDeploymentStep").removeClass("is-failed is-active");
      $("#ethTransferStep").removeClass("is-failed is-active");
      break;
    case 4:
      $("#swapStep").addClass("is-active");
      $("#swapStep").removeClass("is-failed");
      $("#archethicDeploymentStep").removeClass("is-active is-failed");
      $("#ethTransferStep").removeClass("is-active is-failed");
      $("#ethDeploymentStep").removeClass("is-active is-failed");
      break;
    default:
      break;
  }

  $("#steps").show();
  changeBtnToTransferInProgress()
  try {
    await goto(localStorage.getItem("transferStep"), state);
  }
  catch (e) {
    handleError(e, step, JSON.parse(pendingTransferJSON, ethChainId));
  }

  return state
}
