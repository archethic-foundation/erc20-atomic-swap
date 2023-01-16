(()=>{window.onload=async function(){if(typeof window.ethereum<"u")console.log("MetaMask is installed!");else throw"No ethereum provider is installed"};$("#connectMetamaskBtn").on("click",async()=>{try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),provider=new ethers.providers.Web3Provider(window.ethereum),await provider.send("eth_requestAccounts",[]),await U(provider),$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show()}catch(e){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#error").text(`An error occured: ${e.message||e}`).show()}});var C;async function U(e){let{chainId:t}=await e.getNetwork(),n=e.getSigner(),a;switch(t){case 80001:a="Polygon-logo.svg",$("#fromChain").text("Polygon"),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:a="Polygon-logo.svg",$("#fromChain").text("Polygon"),$("#fromNetworkLabel").text("Polygon"),$("#toNetworkLabel").text("Archethic");break;case 97:a="BSC-logo.svg",$("#fromChain").text("Binance"),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:a="BSC-logo.svg",$("#fromChain").text("Binance"),$("#fromNetworkLabel").text("BSC"),$("#toNetworkLabel").text("Archethic");break;case 5:a="Ethereum-logo.svg",$("#fromChain").text("Ethereum"),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:a="Ethereum-logo.svg",$("#fromChain").text("Ethereum"),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:a="Ethereum-logo.svg",$("#fromChain").text("Ethereum"),$("#fromNetworkLabel").text("Ethereum"),$("#toNetworkLabel").text("Archethic");break}$("#main").hide(),$("#swapForm").show();let{archethicEndpoint:r,unirisTokenAddress:s,recipientEthereum:i,sufficientFunds:d,UCOPrice:l,sourceChainExplorer:c,bridgeAddress:A}=await j(t),f=20/l;if($("#nbTokensToSwap").attr("max",f),C=`${r}/explorer/transaction`,$("#sourceChainImg").attr("src",`assets/images/bc-logos/${a}`),$("#ucoPrice").text(`1 UCO = ${l}$`).show(),$("#swapBalanceUSD").text(0),!d){$("#error").text("An error occured: Bridge has insuffficient funds. Please retry later");return}console.log("Archethic endpoint: ",r);let p=await n.getAddress(),m=await F(s,e),y=await m.balanceOf(p),o=ethers.utils.formatUnits(y,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(o).toFixed(8))),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((o*l).toFixed(2))),$("#recipientAddress").on("change",async h=>{let w=await S($(h.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(w).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((l*w).toFixed(2))),$("#btnSwap").show()}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("change",h=>{let u=$(h.target).val();$("#swapBalanceUSD").text((u*l).toFixed(2))}),$("#swapForm").on("submit",async h=>{if(h.preventDefault(),!h.target.checkValidity())return;$("#btnSwap").hide();let u=$("#recipientAddress").val();await H(n,m,i,u,t,archethic,l,c,A)})}async function F(e,t){let n=await M();return new ethers.Contract(e,n,t)}async function H(e,t,n,a,r,s,i,d,l){let c=$("#nbTokensToSwap").val();if(await S(l)<=c*1e9){$("#error").text("An error occured: Bridge has insuffficient funds. Please retry later");return}$("#steps").show(),$("#txSummary").hide();let f=new Uint8Array(32);crypto.getRandomValues(f);let p=B(f),m=await crypto.subtle.digest("SHA-256",f);m=new Uint8Array(m);let y=B(m);$("#ethDeploymentStep").addClass("is-active");try{let o=await P(n,t.address,c,m,e,7200);$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary").show();let h=o.address;$("#txSummary1Label").html(`Contract address on Ethereum: <a href="${d}/address/${o.address}" target="_blank">${o.address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active");let u=await I(c,h,t,e);console.log(`${c} UCO transfered`),$("#txSummary2Label").html(`Provision UCO: <a href="${d}/tx/${u.transactionHash}" target="_blank">${u.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),$("#archethicDeploymentStep").addClass("is-active");let w=await E(y,a,c,h,r);console.log("Contract address on Archethic",w),$("#txSummary3Label").html(`Contract address on Archethic : <a href="${C}/${w}" target="_blank">${w}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),$("#swapStep").addClass("is-active");let x=await O(o,e,p);console.log(`Ethereum's withdraw transaction - ${x.transactionHash}`),$("#txSummary4Label").html(`Ethereum swap: <a href="${d}/tx/${x.transactionHash}" target="_blank">${x.transactionHash}</a>`),$("#txSummary4").show();let v=await e.getAddress(),N=await t.balanceOf(v),T=ethers.utils.formatUnits(N,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(T).toFixed(2))),$("#fromBalanceUSD").text(T*i);let b=await D(w,h,x.transactionHash,p,r);console.log(`Archethic's withdraw transaction ${b}`),$("#txSummary5Label").html(`Archethic swap : <a href="${C}/${b}" target="_blank">${b}</a>`),$("#txSummary5").show(),$("#swapStep").removeClass("is-active"),console.log("Token swap finish");let k=await S(a)/1e8;$("#toBalanceUCO").text(parseFloat(k).toFixed(2)),$("#toBalanceUSD").text(i*k),$("#txSummary").show()}catch(o){console.error(o.message||o),$("#error").text(`An error occured: ${o.message||o}`).show()}}async function E(e,t,n,a,r){let s=new Date;s.setSeconds(s.getSeconds()+1e4);let i=Math.floor(s/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:e,recipientAddress:t,amount:n*1e8,endTime:i,ethereumContractAddress:a,ethereumChainId:r})}).then(g).then(d=>d.contractAddress)}async function O(e,t,n){return await(await(await e.connect(t)).withdraw(`0x${n}`,{gasLimit:1e7})).wait()}async function D(e,t,n,a,r){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:e,ethereumContractAddress:t,ethereumWithdrawTransaction:n,secret:a,ethereumChainId:r})}).then(g).then(s=>{let{archethicWithdrawTransaction:i}=s;return i})}async function P(e,t,n,a,r,s){let{abi:i,bytecode:d}=await _(),c=await new ethers.ContractFactory(i,d,r).deploy(e,t,ethers.utils.parseUnits(n,18),a,s,{gasLimit:1e6});return await c.deployTransaction.wait(),console.log("HTLC contract deployed at "+c.address),c}async function I(e,t,n,a){return await(await n.connect(a).transfer(t,ethers.utils.parseUnits(e,18))).wait()}var L=[];for(let e=0;e<=255;++e){let t=e.toString(16).padStart(2,"0");L.push(t)}function B(e){let t=new Uint8Array(e),n=new Array(t.length);for(let a=0;a<t.length;++a)n[a]=L[t[a]];return n.join("")}async function j(e){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:e})}).then(g).then(t=>{if(t.status!="ok")throw t.status;return{archethicEndpoint:t.archethicEndpoint,unirisTokenAddress:t.unirisTokenAddress,recipientEthereum:t.recipientEthereum,sufficientFunds:t.sufficientFunds,UCOPrice:t.UCOPrice,sourceChainExplorer:t.sourceChainExplorer,bridgeAddress:t.bridgeAddress}})}async function M(){return await(await fetch("uco_abi.json")).json()}async function _(){let t=await(await fetch("HTLC.json")).json();return{abi:t.abi,bytecode:t.bytecode}}async function g(e){return new Promise(function(t,n){e.status>=200&&e.status<=299?e.json().then(t):e.json().then(n).catch(()=>n(e.statusText))})}async function S(e){return fetch(`/balances/archethic/${e}`).then(g).then(t=>t.balance)}})();
//# sourceMappingURL=app.js.map
