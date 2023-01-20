(()=>{function B(){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#main").hide(),$("#swapForm").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),W(),$("#error").text(""),$("#btnSwap").prop("disabled",!0),$("#btnSwap").text("Transfer"),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),k()}function v(){$("#btnSwap").hide(),$("#btnSwapSpinner").prop("disabled",!0),$("#btnSwapSpinner").text("Transfering"),$("#btnSwapSpinner").show()}function W(){$("#txSummary1Label").text(""),$("#txSummary1").hide(),$("#txSummary2Label").text(""),$("#txSummary2").hide(),$("#txSummary3Label").text(""),$("#txSummary3").hide(),$("#txSummary4Label").text(""),$("#txSummary4").hide(),$("#txSummary5Label").text(""),$("#txSummary5").hide()}function k(){$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#swapStep").removeClass("is-active"),$("#swapStep").removeClass("is-failed")}async function u(e){return new Promise(function(t,a){e.status>=200&&e.status<=299?e.json().then(t):e.json().then(a).catch(()=>a(e.statusText))})}function L(e){let t=new Uint8Array(e),a=new Array(t.length);for(let n=0;n<t.length;++n)a[n]=byteToHex[t[n]];return a.join("")}function E(e){switch(e){case 80001:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Polygon"),$("#toNetworkLabel").text("Archethic");break;case 97:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC"),$("#toNetworkLabel").text("Archethic");break;case 5:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum"),$("#toNetworkLabel").text("Archethic");break}return $("#sourceChainImg").attr("src",`assets/images/bc-logos/${sourceChainLogo}`),fromChainName}async function H(e){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:e})}).then(u).then(t=>{if(t.status!="ok")throw t.status;return{archethicEndpoint:t.archethicEndpoint,unirisTokenAddress:t.unirisTokenAddress,recipientEthereum:t.recipientEthereum,sufficientFunds:t.sufficientFunds,UCOPrice:t.UCOPrice,sourceChainExplorer:t.sourceChainExplorer,bridgeAddress:t.bridgeAddress}})}async function O(e,t){let a=await z();return new ethers.Contract(e,a,t)}async function I(e,t){let{abi:a}=await J();return new ethers.Contract(e,a,t)}async function D(e,t,a,n,c,o){let{abi:s,bytecode:i}=await J(),d=await new ethers.ContractFactory(s,i,c).deploy(e,t,ethers.utils.parseUnits(a,18),n,o,{gasLimit:1e6});return await d.deployTransaction.wait(),console.log("HTLC contract deployed at "+d.address),d}async function V(e,t,a,n){return await(await a.connect(n).transfer(t,ethers.utils.parseUnits(e,18))).wait()}async function U(e){let{HTLC_Contract:t,amount:a,unirisContract:n,signer:c,sourceChainExplorer:o}=e;$("#ethTransferStep").addClass("is-active");let s=await V(a,t.address,n,c);localStorage.setItem("transferStep","transferedERC20");let i=localStorage.getItem("pendingTransfer"),h=JSON.parse(i);return h.erc20transferAddress=s.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(h)),console.log(`${a} UCO transfered`),$("#txSummary2Label").html(`Provision UCO: <a href="${o}/tx/${s.transactionHash}" target="_blank">${s.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),e.erc20transferAddress=s.transactionHash,e}async function F(e){let{HTLC_Contract:t,amount:a,secretDigestHex:n,recipientArchethic:c,ethChainId:o,toChainExplorer:s}=e;$("#archethicDeploymentStep").addClass("is-active"),step=3;let i=await q(n,c,a,t.address,o);localStorage.setItem("transferStep","deployedArchethicContract");let h=localStorage.getItem("pendingTransfer"),d=JSON.parse(h);return d.archethicContractAddress=i,localStorage.setItem("pendingTransfer",JSON.stringify(d)),console.log("Contract address on Archethic",i),$("#txSummary3Label").html(`Contract address on Archethic : <a href="${s}/${i}" target="_blank">${i}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),e.archethicContractAddress=i,e}async function P(e){let{HTLC_Contract:t,signer:a,secretHex:n,unirisContract:c,UCOPrice:o,sourceChainExplorer:s}=e,i=await G(t,a,n);localStorage.setItem("transferStep","withdrawEthContract");let h=localStorage.getItem("pendingTransfer"),d=JSON.parse(h);d.withdrawEthereumAddress=i.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(d)),console.log(`Ethereum's withdraw transaction - ${i.transactionHash}`),$("#txSummary4Label").html(`${fromChainName} swap: <a href="${s}/tx/${i.transactionHash}" target="_blank">${i.transactionHash}</a>`),$("#txSummary4").show();let g=await a.getAddress(),p=await c.balanceOf(g),f=ethers.utils.formatUnits(p,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(f).toFixed(2)));let m=20/o;return $("#maxUCOValue").text(Math.min(f/o,m).toFixed(5)),$("#fromBalanceUSD").text(f*o),e.withdrawEthereumAddress=i.transactionHash,e}async function _({archethicContractAddress:e,HTLC_Contract:t,withdrawEthereumAddress:a,secretHex:n,ethChainId:c,toChainExplorer:o}){console.log(e);let s=await X(e,t.address,a,n,c);localStorage.setItem("transferStep","withdrawArchethicContract"),console.log(`Archethic's withdraw transaction ${s}`),$("#txSummary5Label").html(`Archethic swap : <a href="${o}/${s}" target="_blank">${s}</a>`),$("#txSummary5").show()}async function q(e,t,a,n,c){let o=new Date;o.setSeconds(o.getSeconds()+1e4);let s=Math.floor(o/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:e,recipientAddress:t,amount:a*1e8,endTime:s,ethereumContractAddress:n,ethereumChainId:c})}).then(u).then(i=>i.contractAddress)}async function G(e,t,a){return await(await(await e.connect(t)).withdraw(`0x${a}`,{gasLimit:1e7})).wait()}async function X(e,t,a,n,c){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:e,ethereumContractAddress:t,ethereumWithdrawTransaction:a,secret:n,ethereumChainId:c})}).then(u).then(o=>{let{archethicWithdrawTransaction:s}=o;return s})}async function z(){return await(await fetch("uco_abi.json")).json()}async function J(){let t=await(await fetch("HTLC.json")).json();return{abi:t.abi,bytecode:t.bytecode}}async function C(e){return fetch(`/balances/archethic/${e}`).then(u).then(t=>t.balance)}window.onload=async function(){if(typeof window.ethereum<"u")console.log("MetaMask is installed!");else throw"No ethereum provider is installed"};$("#connectMetamaskBtn").on("click",async()=>{try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),provider=new ethers.providers.Web3Provider(window.ethereum),await provider.send("eth_requestAccounts",[]),await Q(provider)}catch(e){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#error").text(`${e.message||e}`).show()}});var b,K,y;async function Q(e){let{chainId:t}=await e.getNetwork(),a=e.getSigner(),n=E(t),{archethicEndpoint:c,unirisTokenAddress:o,recipientEthereum:s,sufficientFunds:i,UCOPrice:h,sourceChainExplorer:d,bridgeAddress:g}=await H(t);B();let p=20/h;if($("#nbTokensToSwap").attr("max",p),b=`${c}/explorer/transaction`,$("#ucoPrice").text(`1 UCO = ${h.toFixed(5)}$`).show(),$("#swapBalanceUSD").text(0),!i){$("#error").text("Bridge has insuffficient funds. Please retry later...");return}console.log("Archethic endpoint: ",c);let f=await a.getAddress(),m=await O(o,e),x=await m.balanceOf(f),l=ethers.utils.formatUnits(x,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(l).toFixed(8))),$("#maxUCOValue").text(Math.min(l/h,p).toFixed(5)),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((l*h).toFixed(5))),$("#recipientAddress").on("change",async r=>{let A=await C($(r.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(A).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((h*A).toFixed(5))),$("#btnSwap").prop("disabled",!1)}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("change",r=>{let w=$(r.target).val();$("#swapBalanceUSD").text((w*h).toFixed(5))});let T=localStorage.getItem("pendingTransfer");if(T){k(),$("#btnSwapSpinnerText").text("Loading previous transfer"),$("#btnSwapSpinner").show(),$("#btnSwap").hide();let r=JSON.parse(T),w={HTLC_Contract:await I(r.HTLC_Address,e),secretHex:r.secretHex,secretDigestHex:r.secretDigestHex,amount:r.amount,UCOPrice:h,ethChainId:t,recipientEthereum:s,recipientArchethic:r.recipientArchethic,unirisContract:m,signer:a,erc20transferAddress:r.erc20transferAddress,archethicContractAddress:r.archethicContractAddress,withdrawEthereumAddress:r.withdrawEthereumAddress,sourceChainExplorer:d,toChainExplorer:b};$("#recipientAddress").val(r.recipientArchethic),$("#nbTokensToSwap").val(r.amount);let N=await C(r.recipientArchethic)/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(N).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((h*N).toFixed(5))),$("#swapBalanceUSD").text((r.amount*h).toFixed(5)),$("#steps").show(),$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary1Label").html(`Contract address on ${n}: <a href="${d}/address/${r.HTLC_Address}" target="_blank">${r.HTLC_Address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active"),y=2,r.erc20transferAddress&&(y=3,$("#txSummary2Label").html(`Provision UCO: <a href="${d}/tx/${r.erc20transferAddress}" target="_blank">${r.erc20transferAddress}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),$("#archethicDeploymentStep").addClass("is-active")),r.archethicContractAddress&&(y=4,$("#txSummary3Label").html(`Contract address on Archethic : <a href="${b}/${r.archethicContractAddress}" target="_blank">${r.archethicContractAddress}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),$("#swapStep").addClass("is-active")),r.withdrawEthereumAddress&&($("#swapStep").removeClass("is-active"),$("#txSummary4Label").html(`${n} swap: <a href="${d}/tx/${r.withdrawEthereumAddress}" target="_blank">${r.withdrawEthereumAddress}</a>`),$("#txSummary4").show(),$("#swapStep").addClass("is-active")),$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),$("#swapForm").off(),$("#swapForm").on("submit",async M=>{M.preventDefault(),v();try{await S(localStorage.getItem("transferStep"),w)}catch(j){R(j)}});return}$("#swapForm").on("submit",async r=>{if(r.preventDefault(),!r.target.checkValidity())return;let w=$("#recipientAddress").val();await Y(a,m,s,w,t,h,d,g)})}async function Y(e,t,a,n,c,o,s,i){v();var h=0;let d=$("#nbTokensToSwap").val();if(await C(i)<=d*1e9){$("#error").text("Bridge has insuffficient funds. Please retry later...");return}$("#steps").show();let p=new Uint8Array(32);crypto.getRandomValues(p);let f=L(p),m=await crypto.subtle.digest("SHA-256",p);m=new Uint8Array(m);let x=L(m);$("#ethDeploymentStep").addClass("is-active"),h=1;try{let l=await D(a,t.address,d,m,e,7200);localStorage.setItem("pendingTransfer",JSON.stringify({HTLC_Address:l.address,secretHex:f,secretDigestHex:x,amount:d,recipientArchethic:n})),localStorage.setItem("transferStep","deployedEthContract"),$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary").show();let T=l.address;$("#txSummary1Label").html(`Contract address on ${K}: <a href="${s}/address/${l.address}" target="_blank">${l.address}</a>`),$("#txSummary1").show(),await S("deployedEthContract",{HTLC_Contract:l,secretHex:f,secretDigestHex:x,amount:d,UCOPrice:o,ethChainId:c,recipientEthereum:a,recipientArchethic:n,unirisContract:t,signer:e,sourceChainExplorer:s,toChainExplorer:b})}catch(l){R(l)}}async function S(e,t){switch(e){case"deployedEthContract":return e=2,t=await U(t),await S("transferedERC20",t);case"transferedERC20":return e=3,t=await F(t),await S("deployedArchethicContract",t);case"deployedArchethicContract":return e=4,$("#swapStep").addClass("is-active"),t=await P(t),await S("withdrawEthContract",t);case"withdrawEthContract":await _(t),$("#swapStep").removeClass("is-active"),$("#btnSwapSpinner").hide(),$("#btnSwap").prop("disabled",!1),$("#btnSwap").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),console.log("Token swap finish"),localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),setTimeout(async()=>{let n=await C(t.recipientArchethic)/1e8;$("#toBalanceUCO").text(parseFloat(n).toFixed(2)),$("#toBalanceUSD").text(UCOPrice*n)},1e3);break}}var Z=[];for(let e=0;e<=255;++e){let t=e.toString(16).padStart(2,"0");Z.push(t)}function R(e){switch($("#btnSwap").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),console.error(e.message||e),$("#error").text(`${e.message||e}`).show(),y){case 1:$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").addClass("is-failed");break;case 2:$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").addClass("is-failed");break;case 3:$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").addClass("is-failed");break;case 4:$("#swapStep").removeClass("is-active"),$("#swapStep").addClass("is-failed");break;default:break}}})();
//# sourceMappingURL=app.js.map
