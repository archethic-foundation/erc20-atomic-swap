(()=>{window.onload=async function(){if(typeof window.ethereum<"u")console.log("MetaMask is installed!");else throw"No ethereum provider is installed"};$("#connectMetamaskBtn").on("click",async()=>{try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),provider=new ethers.providers.Web3Provider(window.ethereum),await provider.send("eth_requestAccounts",[]),await D(provider)}catch(t){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#error").text(`${t.message||t}`).show()}});var A,r;async function D(t){let{chainId:e}=await t.getNetwork(),n=t.getSigner(),a;switch(e){case 80001:a="Polygon-logo.svg",r="Polygon",$("#fromChain").text(r),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:a="Polygon-logo.svg",r="Polygon",$("#fromChain").text(r),$("#fromNetworkLabel").text("Polygon"),$("#toNetworkLabel").text("Archethic");break;case 97:a="BSC-logo.svg",r="Binance",$("#fromChain").text(r),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:a="BSC-logo.svg",r="Binance",$("#fromChain").text(r),$("#fromNetworkLabel").text("BSC"),$("#toNetworkLabel").text("Archethic");break;case 5:a="Ethereum-logo.svg",r="Ethereum",$("#fromChain").text(r),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:a="Ethereum-logo.svg",r="Ethereum",$("#fromChain").text(r),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:a="Ethereum-logo.svg",fromChain="Ethereum",$("#fromChain").text(r),$("#fromNetworkLabel").text("Ethereum"),$("#toNetworkLabel").text("Archethic");break}$("#sourceChainImg").attr("src",`assets/images/bc-logos/${a}`);let{archethicEndpoint:o,unirisTokenAddress:c,recipientEthereum:i,sufficientFunds:l,UCOPrice:d,sourceChainExplorer:h,bridgeAddress:w}=await W(e);$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#main").hide(),$("#swapForm").show();let C=20/d;if($("#nbTokensToSwap").attr("max",C),A=`${o}/explorer/transaction`,$("#ucoPrice").text(`1 UCO = ${d.toFixed(5)}$`).show(),$("#swapBalanceUSD").text(0),!l){$("#error").text("Bridge has insuffficient funds. Please retry later...");return}console.log("Archethic endpoint: ",o);let u=await n.getAddress(),f=await E(c,t),p=await f.balanceOf(u),b=ethers.utils.formatUnits(p,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(b).toFixed(8))),$("#maxUCOValue").text(Math.min(b/d,C).toFixed(5)),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((b*d).toFixed(5))),$("#recipientAddress").on("change",async s=>{let x=await v($(s.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(x).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((d*x).toFixed(5))),$("#btnSwap").prop("disabled",!1)}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("change",s=>{let m=$(s.target).val();$("#swapBalanceUSD").text((m*d).toFixed(5))}),$("#swapForm").on("submit",async s=>{if(s.preventDefault(),!s.target.checkValidity())return;let m=$("#recipientAddress").val();await O(n,f,i,m,e,archethic,d,h,w)})}async function E(t,e){let n=await R();return new ethers.Contract(t,n,e)}async function O(t,e,n,a,o,c,i,l,d){var h=0;let w=$("#nbTokensToSwap").val();if($("#btnSwap").prop("disabled",!0),$("#nbTokensToSwap").prop("disabled",!0),$("#recipientAddress").prop("disabled",!0),$("#btnSwap").hide(),$("#btnSwapSpinner").show(),await v(d)<=w*1e9){$("#error").text("Bridge has insuffficient funds. Please retry later...");return}$("#steps").show(),$("#txSummary").hide();let u=new Uint8Array(32);crypto.getRandomValues(u);let f=L(u),p=await crypto.subtle.digest("SHA-256",u);p=new Uint8Array(p);let b=L(p);$("#ethDeploymentStep").addClass("is-active"),h=1;try{let s=await j(n,e.address,w,p,t,7200);$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary").show();let m=s.address;$("#txSummary1Label").html(`Contract address on ${r}: <a href="${l}/address/${s.address}" target="_blank">${s.address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active"),h=2;let x=await _(w,m,e,t);console.log(`${w} UCO transfered`),$("#txSummary2Label").html(`Provision UCO: <a href="${l}/tx/${x.transactionHash}" target="_blank">${x.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),$("#archethicDeploymentStep").addClass("is-active"),h=3;let y=await P(b,a,w,m,o);console.log("Contract address on Archethic",y),$("#txSummary3Label").html(`Contract address on Archethic : <a href="${A}/${y}" target="_blank">${y}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),$("#swapStep").addClass("is-active"),h=4;let S=await I(s,t,f);console.log(`Ethereum's withdraw transaction - ${S.transactionHash}`),$("#txSummary4Label").html(`${r} swap: <a href="${l}/tx/${S.transactionHash}" target="_blank">${S.transactionHash}</a>`),$("#txSummary4").show();let N=await t.getAddress(),U=await e.balanceOf(N),T=ethers.utils.formatUnits(U,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(T).toFixed(2)));let H=20/i;$("#maxUCOValue").text(Math.min(T/i,H).toFixed(5)),$("#fromBalanceUSD").text(T*i);let k=await M(y,m,S.transactionHash,f,o);console.log(`Archethic's withdraw transaction ${k}`),$("#txSummary5Label").html(`Archethic swap : <a href="${A}/${k}" target="_blank">${k}</a>`),$("#txSummary5").show(),$("#swapStep").removeClass("is-active"),console.log("Token swap finish");let B=await v(a)/1e8;$("#toBalanceUCO").text(parseFloat(B).toFixed(2)),$("#toBalanceUSD").text(i*B),$("#txSummary").show(),$("#btnSwap").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#btnSwap").show(),$("#btnSwapSpinner").hide()}catch(s){switch(console.error(s.message||s),$("#error").text(`${s.message||s}`).show(),$("#btnSwap").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),h){case 1:$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").addClass("is-failed");break;case 2:$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").addClass("is-failed");break;case 3:$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").addClass("is-failed");break;case 4:$("#swapStep").removeClass("is-active"),$("#swapStep").addClass("is-failed");break;default:break}}}async function P(t,e,n,a,o){let c=new Date;c.setSeconds(c.getSeconds()+1e4);let i=Math.floor(c/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:t,recipientAddress:e,amount:n*1e8,endTime:i,ethereumContractAddress:a,ethereumChainId:o})}).then(g).then(l=>l.contractAddress)}async function I(t,e,n){return await(await(await t.connect(e)).withdraw(`0x${n}`,{gasLimit:1e7})).wait()}async function M(t,e,n,a,o){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:t,ethereumContractAddress:e,ethereumWithdrawTransaction:n,secret:a,ethereumChainId:o})}).then(g).then(c=>{let{archethicWithdrawTransaction:i}=c;return i})}async function j(t,e,n,a,o,c){let{abi:i,bytecode:l}=await V(),h=await new ethers.ContractFactory(i,l,o).deploy(t,e,ethers.utils.parseUnits(n,18),a,c,{gasLimit:1e6});return await h.deployTransaction.wait(),console.log("HTLC contract deployed at "+h.address),h}async function _(t,e,n,a){return await(await n.connect(a).transfer(e,ethers.utils.parseUnits(t,18))).wait()}var F=[];for(let t=0;t<=255;++t){let e=t.toString(16).padStart(2,"0");F.push(e)}function L(t){let e=new Uint8Array(t),n=new Array(e.length);for(let a=0;a<e.length;++a)n[a]=F[e[a]];return n.join("")}async function W(t){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:t})}).then(g).then(e=>{if(e.status!="ok")throw e.status;return{archethicEndpoint:e.archethicEndpoint,unirisTokenAddress:e.unirisTokenAddress,recipientEthereum:e.recipientEthereum,sufficientFunds:e.sufficientFunds,UCOPrice:e.UCOPrice,sourceChainExplorer:e.sourceChainExplorer,bridgeAddress:e.bridgeAddress}})}async function R(){return await(await fetch("uco_abi.json")).json()}async function V(){let e=await(await fetch("HTLC.json")).json();return{abi:e.abi,bytecode:e.bytecode}}async function g(t){return new Promise(function(e,n){t.status>=200&&t.status<=299?t.json().then(e):t.json().then(n).catch(()=>n(t.statusText))})}async function v(t){return fetch(`/balances/archethic/${t}`).then(g).then(e=>e.balance)}})();
//# sourceMappingURL=app.js.map
