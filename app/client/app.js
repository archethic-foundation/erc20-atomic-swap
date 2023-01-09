window.onload = async function () {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
  } else {
    throw "No ethereum provider is installed";
  }
};

$("#connectMetamaskBtn").on("click", async () => {

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    await startApp(provider);
  }
  catch (e) {
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
    case 137:
      sourceChainLogo = "Polygon-logo.svg";
      break;
    case 56:
      sourceChainLogo = "BSC-logo.svg";
      break;
    default:
      sourceChainLogo = "Ethereum-logo.svg";
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
  $("#fromBalanceUSD").text(`= ${UCOPrice}$`).show()
  $("#toBalanceUSD").text(`= 0.0$`).show()

  if (!sufficientFunds) {
    $("#error").text(
      "An error occured: Bridge has insuffficient funds. Please retry later"
    );
    return;
  }

  const archethic = new Archethic(archethicEndpoint);
  await archethic.connect();
  console.log("Archethic endpoint: ", archethicEndpoint);

  const account = await signer.getAddress();
  const unirisContract = await getERC20Contract(unirisTokenAddress, provider);


  const balance = await unirisContract.balanceOf(account);
  $("#ucoEthBalance").text(ethers.utils.formatUnits(balance, 18));

  $("#recipientAddress").on("change", async (e) => {
    const archethicBalance = await getLastTransactionBalance(
      archethic,
      $(e.target).val()
    );
    $("#ucoArchethicBalance").val(archethicBalance / 1e8);
    $("#toBalanceUSD").text(`= ${UCOPrice * (archethicBalance / 1e8)}`).show()
  });

  $("#nbTokenToSwap").on("change", (e) => {
    const amount = $(e.target).val()
    $("#fromBalanceUSD").text(`= ${amount * UCOPrice}`)
  })
  $("#btnSwap").show();

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
  archethic,
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
  $("#connectingStep").addClass("is-active");

  try {
    const HTLC_Contract = await deployHTLC(
      recipientEthereum,
      unirisContract.address,
      amount,
      secretDigest,
      signer,
      10000
    );

    const HTLCAddress = HTLC_Contract.address;

    await transferTokensToHTLC(amount, HTLCAddress, unirisContract, signer);

    const contractAddress = await sendDeployRequest(
      secretDigestHex,
      recipientArchethic,
      amount,
      HTLCAddress,
      ethChainId
    );
    console.log("Contract address on Archethic", contractAddress);

    $("#connectingStep").removeClass("is-active");
    $("#swapStep").addClass("is-active");

    await sendWithdrawRequest(
      contractAddress,
      HTLCAddress,
      secretHex,
      ethChainId
    );
    console.log("Token swap finish");

    $("#swapStep").removeClass("is-active");
    $("#endPhase").addClass("is-active");

    const archethicBalance = await getLastTransactionBalance(
      archethic,
      recipientArchethic
    );
    $("#ucoArchethicBalance").val(archethicBalance / 1e8);
    $("#toBalanceUSD").text(`= ${UCOPrice * (archethicBalance / 1e8)}`).show()
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

async function sendWithdrawRequest(
  archethicContractAddress,
  ethereumContractAddress,
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
      secret: secret,
      ethereumChainId: ethChainId,
    }),
  }).then(handleResponse);
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

  await unirisWithSigner.transfer(
    HTLCAddress,
    ethers.utils.parseUnits(amount, 18)
  );
  const filter = unirisContract.filters.Transfer(null, HTLCAddress);

  return new Promise((resolve, _reject) => {
    unirisContract.on(filter, (_from, _to, amount, _event) => {
      console.log(ethers.utils.formatUnits(amount, 18) + " UCO transfered");
      resolve();
    });
  });
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
  const r = await fetch("uco_ABI.json");
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

async function getArchethicBalance(archethic, address) {
  archethic.requestNode(async (endpoint) => {
    const url = new URL("/api", endpoint);
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            balance(address: "${address}") {
              uco
            }
          }
        `,
      }),
    });
    const res = await r.json();
    if (res.data.balance && res.data.balance.uco) {
      return res.data.balance.uco;
    }
    return 0;
  });
}

async function getLastTransactionBalance(archethic, address) {
  return archethic.requestNode(async (endpoint) => {
    const url = new URL("/api", endpoint);
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
            query {
              lastTransaction(address: "${address}") {
                 balance {
                   uco
                 }
              }
            }
          `,
      }),
    });
    const res = await r.json();

    if (
      res.errors &&
      res.errors.find((x) => x.message == "transaction_not_exists")
    ) {
      return await getInputs(archethic, address);
    }

    if (res.data.lastTransaction && res.data.lastTransaction.balance) {
      return res.data.lastTransaction.balance.uco;
    }

    return 0;
  });
}

async function getInputs(archethic, address) {
  return archethic.requestNode(async (endpoint) => {
    const url = new URL("/api", endpoint);
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
            query {
              transactionInputs(address: "${address}") {
                 type,
                 amount
              }
            }
          `,
      }),
    });
    const res = await r.json();
    if (res.data.transactionInputs && res.data.transactionInputs.length > 0) {
      return res.data.transactionInputs
        .filter((r) => r.type == "UCO")
        .reduce((acc, { amount: amount }) => acc + amount, 0);
    }
    return 0;
  });
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
