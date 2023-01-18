(()=>{window.onload=async function(){if(typeof window.ethereum<"u")console.log("MetaMask is installed!");else throw"No ethereum provider is installed"};$("#connectMetamaskBtn").on("click",async()=>{try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),provider=new ethers.providers.Web3Provider(window.ethereum),await provider.send("eth_requestAccounts",[]),await F(provider)}catch(e){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#error").text(`An error occured: ${e.message||e}`).show()}});var A,r;async function F(e){let{chainId:t}=await e.getNetwork(),n=e.getSigner(),a;switch(t){case 80001:a="Polygon-logo.svg",r="Polygon",$("#fromChain").text(r),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:a="Polygon-logo.svg",r="Polygon",$("#fromChain").text(r),$("#fromNetworkLabel").text("Polygon"),$("#toNetworkLabel").text("Archethic");break;case 97:a="BSC-logo.svg",r="Binance",$("#fromChain").text(r),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:a="BSC-logo.svg",r="Binance",$("#fromChain").text(r),$("#fromNetworkLabel").text("BSC"),$("#toNetworkLabel").text("Archethic");break;case 5:a="Ethereum-logo.svg",r="Ethereum",$("#fromChain").text(r),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:a="Ethereum-logo.svg",r="Ethereum",$("#fromChain").text(r),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:a="Ethereum-logo.svg",fromChain="Ethereum",$("#fromChain").text(r),$("#fromNetworkLabel").text("Ethereum"),$("#toNetworkLabel").text("Archethic");break}$("#sourceChainImg").attr("src",`assets/images/bc-logos/${a}`);let{archethicEndpoint:o,unirisTokenAddress:c,recipientEthereum:h,sufficientFunds:d,UCOPrice:m,sourceChainExplorer:i,bridgeAddress:k}=await j(t);$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#main").hide(),$("#swapForm").show();let p=20/m;if($("#nbTokensToSwap").attr("max",p),A=`${o}/explorer/transaction`,$("#ucoPrice").text(`1 UCO = ${m.toFixed(5)}$`).show(),$("#swapBalanceUSD").text(0),!d){$("#error").text("An error occured: Bridge has insuffficient funds. Please retry later");return}console.log("Archethic endpoint: ",o);let x=await n.getAddress(),u=await H(c,e),C=await u.balanceOf(x),s=ethers.utils.formatUnits(C,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(s).toFixed(8))),$("#maxUCOValue").text(Math.min(s,20)),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((s*m).toFixed(5))),$("#recipientAddress").on("change",async l=>{let f=await T($(l.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(f).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((m*f).toFixed(5))),$("#btnSwap").show()}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("change",l=>{let w=$(l.target).val();$("#swapBalanceUSD").text((w*m).toFixed(5))}),$("#swapForm").on("submit",async l=>{if(l.preventDefault(),!l.target.checkValidity())return;$("#btnSwap").hide();let w=$("#recipientAddress").val();await O(n,u,h,w,t,archethic,m,i,k)})}async function H(e,t){let n=await _();return new ethers.Contract(e,n,t)}async function O(e,t,n,a,o,c,h,d,m){let i=$("#nbTokensToSwap").val();if(await T(m)<=i*1e9){$("#error").text("An error occured: Bridge has insuffficient funds. Please retry later");return}$("#steps").show(),$("#txSummary").hide();let p=new Uint8Array(32);crypto.getRandomValues(p);let x=L(p),u=await crypto.subtle.digest("SHA-256",p);u=new Uint8Array(u);let C=L(u);$("#ethDeploymentStep").addClass("is-active");try{let s=await I(n,t.address,i,u,e,7200);$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary").show();let l=s.address;$("#txSummary1Label").html(`Contract address on ${r}: <a href="${d}/address/${s.address}" target="_blank">${s.address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active");let w=await M(i,l,t,e);console.log(`${i} UCO transfered`),$("#txSummary2Label").html(`Provision UCO: <a href="${d}/tx/${w.transactionHash}" target="_blank">${w.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),$("#archethicDeploymentStep").addClass("is-active");let f=await E(C,a,i,l,o);console.log("Contract address on Archethic",f),$("#txSummary3Label").html(`Contract address on Archethic : <a href="${A}/${f}" target="_blank">${f}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),$("#swapStep").addClass("is-active");let g=await D(s,e,x);console.log(`Ethereum's withdraw transaction - ${g.transactionHash}`),$("#txSummary4Label").html(`${r} swap: <a href="${d}/tx/${g.transactionHash}" target="_blank">${g.transactionHash}</a>`),$("#txSummary4").show();let U=await e.getAddress(),N=await t.balanceOf(U),b=ethers.utils.formatUnits(N,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(b).toFixed(2))),$("#maxUCOValue").text(Math.min(b,20)),$("#fromBalanceUSD").text(b*h);let S=await P(f,l,g.transactionHash,x,o);console.log(`Archethic's withdraw transaction ${S}`),$("#txSummary5Label").html(`Archethic swap : <a href="${A}/${S}" target="_blank">${S}</a>`),$("#txSummary5").show(),$("#swapStep").removeClass("is-active"),console.log("Token swap finish");let B=await T(a)/1e8;$("#toBalanceUCO").text(parseFloat(B).toFixed(2)),$("#toBalanceUSD").text(h*B),$("#txSummary").show()}catch(s){console.error(s.message||s),$("#error").text(`An error occured: ${s.message||s}`).show()}}async function E(e,t,n,a,o){let c=new Date;c.setSeconds(c.getSeconds()+1e4);let h=Math.floor(c/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:e,recipientAddress:t,amount:n*1e8,endTime:h,ethereumContractAddress:a,ethereumChainId:o})}).then(y).then(d=>d.contractAddress)}async function D(e,t,n){return await(await(await e.connect(t)).withdraw(`0x${n}`,{gasLimit:1e7})).wait()}async function P(e,t,n,a,o){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:e,ethereumContractAddress:t,ethereumWithdrawTransaction:n,secret:a,ethereumChainId:o})}).then(y).then(c=>{let{archethicWithdrawTransaction:h}=c;return h})}async function I(e,t,n,a,o,c){let{abi:h,bytecode:d}=await W(),i=await new ethers.ContractFactory(h,d,o).deploy(e,t,ethers.utils.parseUnits(n,18),a,c,{gasLimit:1e6});return await i.deployTransaction.wait(),console.log("HTLC contract deployed at "+i.address),i}async function M(e,t,n,a){return await(await n.connect(a).transfer(t,ethers.utils.parseUnits(e,18))).wait()}var v=[];for(let e=0;e<=255;++e){let t=e.toString(16).padStart(2,"0");v.push(t)}function L(e){let t=new Uint8Array(e),n=new Array(t.length);for(let a=0;a<t.length;++a)n[a]=v[t[a]];return n.join("")}async function j(e){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:e})}).then(y).then(t=>{if(t.status!="ok")throw t.status;return{archethicEndpoint:t.archethicEndpoint,unirisTokenAddress:t.unirisTokenAddress,recipientEthereum:t.recipientEthereum,sufficientFunds:t.sufficientFunds,UCOPrice:t.UCOPrice,sourceChainExplorer:t.sourceChainExplorer,bridgeAddress:t.bridgeAddress}})}async function _(){return await(await fetch("uco_abi.json")).json()}async function W(){let t=await(await fetch("HTLC.json")).json();return{abi:t.abi,bytecode:t.bytecode}}async function y(e){return new Promise(function(t,n){e.status>=200&&e.status<=299?e.json().then(t):e.json().then(n).catch(()=>n(e.statusText))})}async function T(e){return fetch(`/balances/archethic/${e}`).then(y).then(t=>t.balance)}})();
//# sourceMappingURL=app.js.map
