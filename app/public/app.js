(()=>{function B(){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#main").hide(),$("#swapForm").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),V(),$("#error").text(""),$("#btnSwap").prop("disabled",!0),$("#btnSwap").text("Transfer"),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),v()}function A(){$("#btnSwap").hide(),$("#btnSwapSpinner").prop("disabled",!0),$("#btnSwapSpinner").text("Transfering"),$("#btnSwapSpinner").show()}function V(){$("#txSummary1Label").text(""),$("#txSummary1").hide(),$("#txSummary2Label").text(""),$("#txSummary2").hide(),$("#txSummary3Label").text(""),$("#txSummary3").hide(),$("#txSummary4Label").text(""),$("#txSummary4").hide(),$("#txSummary5Label").text(""),$("#txSummary5").hide()}function v(){$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#swapStep").removeClass("is-active"),$("#swapStep").removeClass("is-failed")}async function u(e){return new Promise(function(t,a){e.status>=200&&e.status<=299?e.json().then(t):e.json().then(a).catch(()=>a(e.statusText))})}var H=[];for(let e=0;e<=255;++e){let t=e.toString(16).padStart(2,"0");H.push(t)}function k(e){let t=new Uint8Array(e),a=new Array(t.length);for(let r=0;r<t.length;++r)a[r]=H[t[r]];return a.join("")}function L(e){switch($("#btnSwap").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),console.error(e.message||e),$("#error").text(`${e.message||e}`).show(),step){case 1:$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").addClass("is-failed");break;case 2:$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").addClass("is-failed");break;case 3:$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").addClass("is-failed");break;case 4:$("#swapStep").removeClass("is-active"),$("#swapStep").addClass("is-failed");break;default:break}}function I(e){switch(e){case 80001:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Polygon"),$("#toNetworkLabel").text("Archethic");break;case 97:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC"),$("#toNetworkLabel").text("Archethic");break;case 5:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum"),$("#toNetworkLabel").text("Archethic");break}return $("#sourceChainImg").attr("src",`assets/images/bc-logos/${sourceChainLogo}`),fromChainName}async function O(e){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:e})}).then(u).then(t=>{if(t.status!="ok")throw t.status;return{archethicEndpoint:t.archethicEndpoint,unirisTokenAddress:t.unirisTokenAddress,recipientEthereum:t.recipientEthereum,sufficientFunds:t.sufficientFunds,UCOPrice:t.UCOPrice,sourceChainExplorer:t.sourceChainExplorer,bridgeAddress:t.bridgeAddress}})}async function D(e,t){let a=await K();return new ethers.Contract(e,a,t)}async function U(e,t){let{abi:a}=await M();return new ethers.Contract(e,a,t)}async function F(e,t,a,r,c,o){let{abi:s,bytecode:i}=await M(),d=await new ethers.ContractFactory(s,i,c).deploy(e,t,ethers.utils.parseUnits(a,18),r,o,{gasLimit:1e6});return await d.deployTransaction.wait(),console.log("HTLC contract deployed at "+d.address),d}async function q(e,t,a,r){return await(await a.connect(r).transfer(t,ethers.utils.parseUnits(e,18))).wait()}async function P(e){let{HTLC_Contract:t,amount:a,unirisContract:r,signer:c,sourceChainExplorer:o}=e;$("#ethTransferStep").addClass("is-active");let s=await q(a,t.address,r,c);localStorage.setItem("transferStep","transferedERC20");let i=localStorage.getItem("pendingTransfer"),h=JSON.parse(i);return h.erc20transferAddress=s.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(h)),console.log(`${a} UCO transfered`),$("#txSummary2Label").html(`Provision UCO: <a href="${o}/tx/${s.transactionHash}" target="_blank">${s.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),e.erc20transferAddress=s.transactionHash,e}async function _(e){let{HTLC_Contract:t,amount:a,secretDigestHex:r,recipientArchethic:c,ethChainId:o,toChainExplorer:s}=e;$("#archethicDeploymentStep").addClass("is-active"),step=3;let i=await G(r,c,a,t.address,o);localStorage.setItem("transferStep","deployedArchethicContract");let h=localStorage.getItem("pendingTransfer"),d=JSON.parse(h);return d.archethicContractAddress=i,localStorage.setItem("pendingTransfer",JSON.stringify(d)),console.log("Contract address on Archethic",i),$("#txSummary3Label").html(`Contract address on Archethic : <a href="${s}/${i}" target="_blank">${i}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),e.archethicContractAddress=i,e}async function J(e){let{HTLC_Contract:t,signer:a,secretHex:r,unirisContract:c,UCOPrice:o,sourceChainExplorer:s}=e,i=await X(t,a,r);localStorage.setItem("transferStep","withdrawEthContract");let h=localStorage.getItem("pendingTransfer"),d=JSON.parse(h);d.withdrawEthereumAddress=i.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(d)),console.log(`Ethereum's withdraw transaction - ${i.transactionHash}`),$("#txSummary4Label").html(`${fromChainName} swap: <a href="${s}/tx/${i.transactionHash}" target="_blank">${i.transactionHash}</a>`),$("#txSummary4").show();let g=await a.getAddress(),p=await c.balanceOf(g),f=ethers.utils.formatUnits(p,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(f).toFixed(2)));let m=20/o;return $("#maxUCOValue").text(Math.min(f/o,m).toFixed(5)),$("#fromBalanceUSD").text(f*o),e.withdrawEthereumAddress=i.transactionHash,e}async function R({archethicContractAddress:e,HTLC_Contract:t,withdrawEthereumAddress:a,secretHex:r,ethChainId:c,toChainExplorer:o}){console.log(e);let s=await z(e,t.address,a,r,c);localStorage.setItem("transferStep","withdrawArchethicContract"),console.log(`Archethic's withdraw transaction ${s}`),$("#txSummary5Label").html(`Archethic swap : <a href="${o}/${s}" target="_blank">${s}</a>`),$("#txSummary5").show()}async function G(e,t,a,r,c){let o=new Date;o.setSeconds(o.getSeconds()+1e4);let s=Math.floor(o/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:e,recipientAddress:t,amount:a*1e8,endTime:s,ethereumContractAddress:r,ethereumChainId:c})}).then(u).then(i=>i.contractAddress)}async function X(e,t,a){return await(await(await e.connect(t)).withdraw(`0x${a}`,{gasLimit:1e7})).wait()}async function z(e,t,a,r,c){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:e,ethereumContractAddress:t,ethereumWithdrawTransaction:a,secret:r,ethereumChainId:c})}).then(u).then(o=>{let{archethicWithdrawTransaction:s}=o;return s})}async function K(){return await(await fetch("uco_abi.json")).json()}async function M(){let t=await(await fetch("HTLC.json")).json();return{abi:t.abi,bytecode:t.bytecode}}async function C(e){return fetch(`/balances/archethic/${e}`).then(u).then(t=>t.balance)}window.onload=async function(){if(localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),typeof window.ethereum<"u")console.log("MetaMask is installed!");else throw"No ethereum provider is installed"};$("#connectMetamaskBtn").on("click",async()=>{try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),provider=new ethers.providers.Web3Provider(window.ethereum),await provider.send("eth_requestAccounts",[]),await Y(provider)}catch(e){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#error").text(`${e.message||e}`).show()}});var b,Q,N;async function Y(e){let{chainId:t}=await e.getNetwork(),a=e.getSigner(),r=I(t);console.log(r);let{archethicEndpoint:c,unirisTokenAddress:o,recipientEthereum:s,sufficientFunds:i,UCOPrice:h,sourceChainExplorer:d,bridgeAddress:g}=await O(t);B();let p=20/h;if($("#nbTokensToSwap").attr("max",p),b=`${c}/explorer/transaction`,$("#ucoPrice").text(`1 UCO = ${h.toFixed(5)}$`).show(),$("#swapBalanceUSD").text(0),!i){$("#error").text("Bridge has insuffficient funds. Please retry later...");return}console.log("Archethic endpoint: ",c);let f=await a.getAddress(),m=await D(o,e),x=await m.balanceOf(f),l=ethers.utils.formatUnits(x,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(l).toFixed(8))),$("#maxUCOValue").text(Math.min(l/h,p).toFixed(5)),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((l*h).toFixed(5))),$("#recipientAddress").on("change",async n=>{let T=await C($(n.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(T).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((h*T).toFixed(5))),$("#btnSwap").prop("disabled",!1)}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("change",n=>{let w=$(n.target).val();$("#swapBalanceUSD").text((w*h).toFixed(5))});let y=localStorage.getItem("pendingTransfer");if(y){v(),$("#btnSwapSpinnerText").text("Loading previous transfer"),$("#btnSwapSpinner").show(),$("#btnSwap").hide();let n=JSON.parse(y),w={HTLC_Contract:await U(n.HTLC_Address,e),secretHex:n.secretHex,secretDigestHex:n.secretDigestHex,amount:n.amount,UCOPrice:h,ethChainId:t,recipientEthereum:s,recipientArchethic:n.recipientArchethic,unirisContract:m,signer:a,erc20transferAddress:n.erc20transferAddress,archethicContractAddress:n.archethicContractAddress,withdrawEthereumAddress:n.withdrawEthereumAddress,sourceChainExplorer:d,toChainExplorer:b};$("#recipientAddress").val(n.recipientArchethic),$("#nbTokensToSwap").val(n.amount);let E=await C(n.recipientArchethic)/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(E).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((h*E).toFixed(5))),$("#swapBalanceUSD").text((n.amount*h).toFixed(5)),$("#steps").show(),console.log(r),$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary1Label").html(`Contract address on ${r}: <a href="${d}/address/${n.HTLC_Address}" target="_blank">${n.HTLC_Address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active"),N=2,n.erc20transferAddress&&(N=3,$("#txSummary2Label").html(`Provision UCO: <a href="${d}/tx/${n.erc20transferAddress}" target="_blank">${n.erc20transferAddress}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),$("#archethicDeploymentStep").addClass("is-active")),n.archethicContractAddress&&(N=4,$("#txSummary3Label").html(`Contract address on Archethic : <a href="${b}/${n.archethicContractAddress}" target="_blank">${n.archethicContractAddress}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),$("#swapStep").addClass("is-active")),n.withdrawEthereumAddress&&($("#swapStep").removeClass("is-active"),$("#txSummary4Label").html(`${r} swap: <a href="${d}/tx/${n.withdrawEthereumAddress}" target="_blank">${n.withdrawEthereumAddress}</a>`),$("#txSummary4").show(),$("#swapStep").addClass("is-active")),$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),$("#swapForm").off(),$("#swapForm").on("submit",async j=>{j.preventDefault(),A();try{await S(localStorage.getItem("transferStep"),w)}catch(W){L(W)}});return}$("#swapForm").on("submit",async n=>{if(n.preventDefault(),!n.target.checkValidity())return;let w=$("#recipientAddress").val();await Z(a,m,s,w,t,h,d,g)})}async function Z(e,t,a,r,c,o,s,i){A();var h=0;let d=$("#nbTokensToSwap").val();if(await C(i)<=d*1e9){$("#error").text("Bridge has insuffficient funds. Please retry later...");return}$("#steps").show();let p=new Uint8Array(32);crypto.getRandomValues(p);let f=k(p),m=await crypto.subtle.digest("SHA-256",p);m=new Uint8Array(m);let x=k(m);$("#ethDeploymentStep").addClass("is-active"),h=1;try{let l=await F(a,t.address,d,m,e,7200);localStorage.setItem("pendingTransfer",JSON.stringify({HTLC_Address:l.address,secretHex:f,secretDigestHex:x,amount:d,recipientArchethic:r})),localStorage.setItem("transferStep","deployedEthContract"),$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary").show();let y=l.address;$("#txSummary1Label").html(`Contract address on ${Q}: <a href="${s}/address/${l.address}" target="_blank">${l.address}</a>`),$("#txSummary1").show(),await S("deployedEthContract",{HTLC_Contract:l,secretHex:f,secretDigestHex:x,amount:d,UCOPrice:o,ethChainId:c,recipientEthereum:a,recipientArchethic:r,unirisContract:t,signer:e,sourceChainExplorer:s,toChainExplorer:b})}catch(l){L(l)}}async function S(e,t){switch(e){case"deployedEthContract":return e=2,t=await P(t),await S("transferedERC20",t);case"transferedERC20":return e=3,t=await _(t),await S("deployedArchethicContract",t);case"deployedArchethicContract":return e=4,$("#swapStep").addClass("is-active"),t=await J(t),await S("withdrawEthContract",t);case"withdrawEthContract":await R(t),$("#swapStep").removeClass("is-active"),$("#btnSwapSpinner").hide(),$("#btnSwap").prop("disabled",!1),$("#btnSwap").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),console.log("Token swap finish"),localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),setTimeout(async()=>{let r=await C(t.recipientArchethic)/1e8;$("#toBalanceUCO").text(parseFloat(r).toFixed(2)),$("#toBalanceUSD").text(UCOPrice*r)},1e3);break}}})();
//# sourceMappingURL=app.js.map
