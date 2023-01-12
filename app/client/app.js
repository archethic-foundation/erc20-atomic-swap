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
    $("#connectMetamaskBtnSpinner").hide();
    $("#connectMetamaskBtn").show();
  }
  catch (e) {
    $("#connectMetamaskBtnSpinner").hide();
    $("#connectMetamaskBtn").show();
    $("#error")
      .text(`An error occured: ${e.message || e}`)
      .show();
  }
});

async function startApp(provider) {

  const { chainId: ethChainId } = await provider.getNetwork();
  const signer = provider.getSigner();

  let sourceChainLogo;
  switch (ethChainId) {
    case 80001:
      sourceChainLogo = "Polygon-logo.svg";
      $("#fromChain").text("Polygon")
      break;
    case 137:
      sourceChainLogo = "Polygon-logo.svg";
      $("#fromChain").text("Polygon")
      break;
    case 97:
      sourceChainLogo = "BSC-logo.svg";
      $("#fromChain").text("Binance")
      break;
    case 56:
      sourceChainLogo = "BSC-logo.svg";
      $("#fromChain").text("Binance")
      break;
    default:
      sourceChainLogo = "Ethereum-logo.svg";
      $("#fromChain").text("Ethereum")
      break;
  }

  const {
    archethicEndpoint,
    unirisTokenAddress,
    recipientEthereum,
    sufficientFunds,
    UCOPrice
  } = await getConfig(ethChainId);

  $("#sourceChainImg").attr("src", `assets/images/bc-logos/${sourceChainLogo}`);
  $("#main").hide();
  $("#swapForm").show();

  $("#ucoPrice").text(`1 UCO = ${UCOPrice}$`).show()
  $("#swapBalanceUSD").text(UCOPrice)

  if (!sufficientFunds) {
    $("#error").text(
      "An error occured: Bridge has insuffficient funds. Please retry later"
    );
    return;
  }

  console.log("Archethic endpoint: ", archethicEndpoint);

  const account = await signer.getAddress();
  const unirisContract = await getERC20Contract(unirisTokenAddress, provider);

  const balance = await unirisContract.balanceOf(account);
  const erc20Amount = ethers.utils.formatUnits(balance, 18)
  $("#fromBalanceUCO").text(parseFloat(erc20Amount).toFixed(2));
  $("#fromBalanceUSD").text(erc20Amount * UCOPrice);

  $("#recipientAddress").on("change", async (e) => {
    const archethicBalance = await getArchethicBalance($(e.target).val());

    const ucoAmount = archethicBalance / 1e8

    $("#toBalanceUCO").text(parseFloat(ucoAmount).toFixed(2));
    $("#toBalanceUSD").text(UCOPrice * ucoAmount);
    $("#btnSwap").show();
  });
  
  $("#recipientAddress").focus()

  $("#nbTokensToSwap").on("change", (e) => {
    const amount = $(e.target).val()
    $("#swapBalanceUSD").text(amount * UCOPrice)
  })
  

  $("#swapForm").on("submit", async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      return;
    }
    
    $("#btnSwap").hide();

    const recipientAddress = $("#recipientAddress").val();
    await handleFormSubmit(
      signer,
      unirisContract,
      recipientEthereum,
      recipientAddress,
      ethChainId,
      archethic,
      UCOPrice
    );
  });
}

async function getERC20Contract(unirisTokenAddress, provider) {
  const unirisTokenABI = await getUnirisTokenABI();
  return new ethers.Contract(unirisTokenAddress, unirisTokenABI, provider);
}

async function handleFormSubmit(
  signer,
  unirisContract,
  recipientEthereum,
  recipientArchethic,
  ethChainId,
  UCOPrice
) {
  $("#steps").show();

  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);

  const secretHex = uint8ArrayToHex(secret);

  let secretDigest = await crypto.subtle.digest("SHA-256", secret);
  secretDigest = new Uint8Array(secretDigest);

  const secretDigestHex = uint8ArrayToHex(secretDigest);

  const amount = $("#nbTokensToSwap").val();
  $("#ethDeploymentStep").addClass("is-active");

  try {
    const HTLC_Contract = await deployHTLC(
      recipientEthereum,
      unirisContract.address,
      amount,
      secretDigest,
      signer,
      7200 // 2 hours of locktime
    );
    $("#ethDeploymentStep").removeClass("is-active");

    const HTLCAddress = HTLC_Contract.address
    
    $("#ethTransferStep").addClass("is-active")
    await transferTokensToHTLC(amount, HTLCAddress, unirisContract, signer);
    $("#ethTransferStep").removeClass("is-active")

    $("#archethicDeploymentStep").addClass("is-active");
    
    const contractAddress = await sendDeployRequest(
     secretDigestHex,
     recipientArchethic,
     amount,
     HTLCAddress,
     ethChainId
    );
    console.log("Contract address on Archethic", contractAddress);
    
    $("#archethicDeploymentStep").removeClass("is-active");

    $("#swapStep").addClass("is-active");
    
    const txReceipt = await withdrawERC20Token(HTLC_Contract, signer, secretHex)
    console.log(`Ethereum's withdraw transaction - ${txReceipt.transactionHash}`);
    
    const ethAccount = await signer.getAddress();
    const erc20Balance = await unirisContract.balanceOf(ethAccount);
    const erc20Amount = ethers.utils.formatUnits(erc20Balance, 18)
    $("#fromBalanceUCO").text(parseFloat(erc20Amount).toFixed(2));
    $("#fromBalanceUSD").text(erc20Amount * UCOPrice);

    await sendWithdrawRequest(
     contractAddress,
     HTLCAddress,
     txReceipt.transactionHash,
     secretHex,
     ethChainId
    );
    console.log("Token swap finish");

    $("#swapStep").removeClass("is-active");
    
    const archethicBalance = await getArchethicBalance(recipientArchethic);

    const newUCOBalance = archethicBalance / 1e8

    $("#toBalanceUCO").text(parseFloat(newUCOBalance).toFixed(2));
    $("#toBalanceUSD").text(UCOPrice * newUCOBalance)
  } catch (e) {
    console.error(e.message || e);
    $("#error")
      .text(`An error occured: ${e.message || e}`)
      .show();
  }
}

async function sendDeployRequest(
  secretDigestHex,
  recipientAddress,
  amount,
  ethereumContractAddress,
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
      const { archethicWithdrawTransaction } = r
      console.log(`Archethic's withdraw transaction ${archethicWithdrawTransaction}`)
    })
}

async function deployHTLC(
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

  await contract.deployTransaction.wait();
  console.log("HTLC contract deployed at " + contract.address);

  return contract;
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

  await tx.wait()
  console.log(`${amount} UCO transfered`);
}

const byteToHex = [];
for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, "0");
  byteToHex.push(hexOctet);
}

function uint8ArrayToHex(bytes) {
  const buff = new Uint8Array(bytes);
  const hexOctets = new Array(buff.length);

  for (let i = 0; i < buff.length; ++i) {
    hexOctets[i] = byteToHex[buff[i]];
  }

  return hexOctets.join("");
}

async function getConfig(ethChainId) {
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
        UCOPrice: r.UCOPrice
      };
    });
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

async function handleResponse(response) {
  return new Promise(function (resolve, reject) {
    if (response.status >= 200 && response.status <= 299) {
      response.json().then(resolve);
    } else {
      response
        .json()
        .then(reject)
        .catch(() => reject(response.statusText));
    }
  });
}

async function getArchethicBalance(address) {
   return fetch(`/balances/archethic/${address}`)
    .then(handleResponse)
    .then((r) => {
      return r.balance
    });
}