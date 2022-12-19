window.onload = async function() {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
  } else {
    throw "No ethereum provider is installed";
  }
};

$("#connectMetamaskBtn").on('click', async () => {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  $("#main").hide()
  await startApp(provider);
})

async function startApp(provider) {
  $("#swapForm").show();

  const { _archethicEndpoint, unirisTokenAddress, recipientEthereum } = await getConfig();

  // console.log("Archethic endpoint: ", archethicEndpoint);
  // const archethic = new Archethic(archethicEndpoint)
  // await archethic.connect()

  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const account = await signer.getAddress();
  const unirisContract = await getERC20Contract(unirisTokenAddress, provider);

  const balance = await unirisContract.balanceOf(account);
  $("#ucoEthBalance").text(ethers.utils.formatUnits(balance, 18))

  // $("#recipientAddress").on("change", async () => {
  //   const archethicBalance = await getArchethicBalance(archethic, $(this).val())
  //   console.log(archethicBalance)
  // })


  $("#swapForm").on('submit', (e) => {
    e.preventDefault();
    if (!swapForm.checkValidity()) {
      return;
    }

    const recipientAddress = $("#recipientAddress").val();
    handleFormSubmit(signer, unirisContract, recipientEthereum, recipientAddress);
  })
}

async function getERC20Contract(unirisTokenAddress, provider) {
  const unirisTokenABI = await getUnirisTokenABI();
  return new ethers.Contract(unirisTokenAddress, unirisTokenABI, provider);
}

async function handleFormSubmit(signer, unirisContract, recipientEthereum, recipientArchethic) {
  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);

  const secretHex = uint8ArrayToHex(secret);

  let secretDigest = await crypto.subtle.digest("SHA-256", secret);
  secretDigest = new Uint8Array(secretDigest);

  const secretDigestHex = uint8ArrayToHex(secretDigest);

  const amount = $("#nbTokensToSwap").val();

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

    await transferTokensToHTLC(amount, HTLCAddress, unirisContract, signer)

    const contractAddress = await sendDeployRequest(
      secretDigestHex,
      recipientArchethic,
      amount,
      HTLCAddress
    );
    console.log("Contract address on Archethic", contractAddress);

    await sendWithdrawRequest(contractAddress, HTLCAddress, secretHex);
    console.log("Token swap finish");
  } catch (e) {
    console.error(e);
  }
}

async function sendDeployRequest(secretDigestHex, recipientAddress, amount, ethereumContractAddress) {
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
      ethereumContractAddress: ethereumContractAddress
    }),
  })
    .then((r) => r.json())
    .then((r) => r.contractAddress);
}

async function sendWithdrawRequest(archethicContractAddress, ethereumContractAddress, secret) {
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
    }),
  }).then((r) => r.json());
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
    hash, lockTime, { gasLimit: 1000000 }
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

async function getConfig() {
  return fetch("/status")
    .then((r) => r.json())
    .then((r) => {
      return {
        archethicEndpoint: r.archethicEndpoint,
        unirisTokenAddress: r.unirisTokenAddress,
        recipientEthereum: r.recipientEthereum
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

// async function getArchethicBalance(archethic, address) {

//   archethic.requestNode(async (endpoint) => {
//     const url = new URL("/api", endpoint);
//     const r = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//       body: JSON.stringify({
//         query: `
//           query {
//             balance(address: "${address}") {
//               uco
//             }
//           }
//         `
//       })
//     });
//     const res = await r.json();
//     if (res.data.balance && res.data.balance.uco) {
//       return res.data.balance.uco;
//     }
//     return 0;
//   })
// }
