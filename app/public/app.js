(()=>{function E(){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#main").hide(),$("#swapForm").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),O(),$("#error").text(""),$("#btnSwap").prop("disabled",!0),$("#btnSwap").text("Transfer"),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),$("#btnSwapSpinnerText").hide(),I()}function D(){O(),k(),$("#steps").hide(),I(),$("#error").text("")}function k(){$("#btnSwap").hide(),$("#btnSwapSpinner").prop("disabled",!0),$("#btnSwapSpinner").show(),$("#btnSwapSpinnerText").show(),$("#workflow").show(),$("#close").hide()}function O(){$("#txSummary1Label").text(""),$("#txSummary1").hide(),$("#txSummary2Label").text(""),$("#txSummary2").hide(),$("#txSummary3Label").text(""),$("#txSummary3").hide(),$("#txSummary4Label").text(""),$("#txSummary4").hide(),$("#txSummary5Label").text(""),$("#txSummary5").hide(),$("#txSummary6Label").text(""),$("#txSummary6").hide()}function I(){$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#swapStep").removeClass("is-active"),$("#swapStep").removeClass("is-failed")}async function y(e){return new Promise(function(t,r){e.status>=200&&e.status<=299?e.json().then(t):e.json().then(r).catch(()=>r(e.statusText))})}var F=[];for(let e=0;e<=255;++e){let t=e.toString(16).padStart(2,"0");F.push(t)}function L(e){let t=new Uint8Array(e),r=new Array(t.length);for(let n=0;n<t.length;++n)r[n]=F[t[n]];return r.join("")}function H(e,t){switch($("#btnSwap").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),console.error(e.message||e),$("#error").text(`${e.message||e}`).show(),$("#close").show(),t){case 1:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").addClass("is-failed"),$("#archethicDeploymentStep").addClass("is-failed"),$("#swapStep").addClass("is-failed");break;case 2:$("#ethTransferStep").addClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed");break;case 4:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#swapStep").addClass("is-failed"),$("#swapStep").removeClass("is-active");break;default:break}}function U(e){switch(e){case 80001:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Polygon"),$("#toNetworkLabel").text("Archethic");break;case 97:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC"),$("#toNetworkLabel").text("Archethic");break;case 5:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum"),$("#toNetworkLabel").text("Archethic");break}return $("#sourceChainImg").attr("src",`assets/images/bc-logos/${sourceChainLogo}`),fromChainName}async function _(e,t){let r=await K();return new ethers.Contract(e,r,t)}async function P(e,t){let{abi:r}=await V();return new ethers.Contract(e,r,t)}async function J(e,t,r,n,i,c){let{abi:s,bytecode:o}=await V(),h=await new ethers.ContractFactory(s,o,i).deploy(e,t,ethers.utils.parseUnits(r,18),n,c,{gasLimit:1e6}),l=await h.deployTransaction.wait();return console.log(l),console.log("HTLC contract deployed at "+h.address),{contract:h,transaction:l}}async function q(e,t,r,n){return await(await r.connect(n).transfer(t,ethers.utils.parseUnits(e,18))).wait()}async function R(e){let{HTLC_Contract:t,amount:r,unirisContract:n,signer:i,sourceChainExplorer:c}=e;$("#ethTransferStep").addClass("is-active");let s=await q(r,t.address,n,i);localStorage.setItem("transferStep","transferedERC20");let o=localStorage.getItem("pendingTransfer"),a=JSON.parse(o);return a.erc20transferAddress=s.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(a)),console.log(`${r} UCO transfered`),$("#txSummary2Label").html(`Provision UCO: <a href="${c}/tx/${s.transactionHash}" target="_blank">${s.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),e.erc20transferAddress=s.transactionHash,e}async function M(e){let{HTLC_Contract:t,amount:r,secretDigestHex:n,recipientArchethic:i,ethChainId:c,toChainExplorer:s,HTLC_transaction:o}=e;$("#archethicDeploymentStep").addClass("is-active"),step=3;let a=await G(n,i,r,t.address,o.transactionHash,c);localStorage.setItem("transferStep","deployedArchethicContract");let h=localStorage.getItem("pendingTransfer"),l=JSON.parse(h);return l.archethicContractAddress=a,localStorage.setItem("pendingTransfer",JSON.stringify(l)),console.log("Contract address on Archethic",a),$("#txSummary3Label").html(`Contract address on Archethic: <a href="${s}/${a}" target="_blank">${a}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),e.archethicContractAddress=a,e}async function j(e){let{HTLC_Contract:t,signer:r,secretHex:n,unirisContract:i,UCOPrice:c,sourceChainExplorer:s}=e,o=await X(t,r,n);localStorage.setItem("transferStep","withdrawEthContract");let a=localStorage.getItem("pendingTransfer"),h=JSON.parse(a);h.withdrawEthereumAddress=o.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(h)),console.log(`Ethereum's withdraw transaction - ${o.transactionHash}`),$("#txSummary4Label").html(`${fromChainName} swap: <a href="${s}/tx/${o.transactionHash}" target="_blank">${o.transactionHash}</a>`),$("#txSummary4").show();let l=await r.getAddress(),w=await i.balanceOf(l),m=ethers.utils.formatUnits(w,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(m).toFixed(2)));let C=20/c;return $("#maxUCOValue").text(Math.min(m/c,C).toFixed(5)),$("#fromBalanceUSD").text((m*c).toFixed(5)),e.withdrawEthereumAddress=o.transactionHash,e}async function W({archethicContractAddress:e,HTLC_Contract:t,withdrawEthereumAddress:r,secretHex:n,ethChainId:i,toChainExplorer:c}){console.log(e);let{archethicWithdrawTransaction:s,archethicTransferTransaction:o}=await z(e,t.address,r,n,i);localStorage.setItem("transferStep","withdrawArchethicContract"),console.log(`Archethic's withdraw transaction ${s}`),console.log(`Archethic's transfer transaction ${o}`),$("#txSummary5Label").html(`Archethic swap: <a href="${c}/${s}" target="_blank">${s}</a>`),$("#txSummary5").show(),$("#txSummary6Label").html(`Archethic transfer: <a href="${c}/${o}" target="_blank">${o}</a>`),$("#txSummary6").show()}async function G(e,t,r,n,i,c){let s=new Date;s.setSeconds(s.getSeconds()+1e4);let o=Math.floor(s/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:e,recipientAddress:t,amount:r*1e8,endTime:o,ethereumContractAddress:n,ethereumContractTransaction:i,ethereumChainId:c})}).then(y).then(a=>a.contractAddress)}async function X(e,t,r){return await(await(await e.connect(t)).withdraw(`0x${r}`,{gasLimit:1e7})).wait()}async function z(e,t,r,n,i){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:e,ethereumContractAddress:t,ethereumWithdrawTransaction:r,secret:n,ethereumChainId:i})}).then(y).then(c=>{let{archethicWithdrawTransaction:s,archethicTransferTransaction:o}=c;return{archethicWithdrawTransaction:s,archethicTransferTransaction:o}})}async function K(){return await(await fetch("uco_abi.json")).json()}async function V(){let t=await(await fetch("HTLC.json")).json();return{abi:t.abi,bytecode:t.bytecode}}async function T(e){return fetch(`/balances/archethic/${e}`).then(y).then(t=>t.balance)}async function N(e){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:e})}).then(y).then(t=>{if(t.status!="ok")throw t.status;return{archethicEndpoint:t.archethicEndpoint,unirisTokenAddress:t.unirisTokenAddress,recipientEthereum:t.recipientEthereum,sufficientFunds:t.sufficientFunds,UCOPrice:t.UCOPrice,sourceChainExplorer:t.sourceChainExplorer,bridgeAddress:t.bridgeAddress}})}window.onload=async function(){if(typeof window.ethereum<"u")console.log("MetaMask is installed!");else throw"No ethereum provider is installed"};$("#connectMetamaskBtn").on("click",async()=>{try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),provider=new ethers.providers.Web3Provider(window.ethereum),await provider.send("eth_requestAccounts",[]),await Q(provider)}catch(e){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#connectionError").text(`${e.message||e}`).show()}});var B,x,u;async function Q(e){let{chainId:t}=await e.getNetwork(),r=e.getSigner(),n=U(t);console.log(n);let{archethicEndpoint:i,unirisTokenAddress:c,recipientEthereum:s,sufficientFunds:o,UCOPrice:a,sourceChainExplorer:h,bridgeAddress:l}=await N(t);u=a,E();let w=(20/a).toFixed(5);if($("#nbTokensToSwap").attr("max",w),B=`${i}/explorer/transaction`,$("#ucoPrice").text(`1 UCO = ${a.toFixed(5)}$`).show(),$("#swapBalanceUSD").text(0),!o){$("#error").text("Bridge has insuffficient funds. Please retry later...");return}console.log("Archethic endpoint: ",i);let m=await r.getAddress();m.length>4?accountStr=m.substring(0,5)+"..."+m.substring(m.length-3):accountStr=m,$("#accountName").html(`Account<br><a href="${h}/address/${m}" target="_blank">${accountStr}</a>`);let C=await _(c,e),g=await C.balanceOf(m),f=ethers.utils.formatUnits(g,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(f).toFixed(8))),$("#maxUCOValue").attr("value",Math.min(f,w).toFixed(5)),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((f*a).toFixed(5))),setInterval(async()=>{let{UCOPrice:d}=await N(t);if(d!=u){$("#ucoPrice").text(`1 UCO = ${d.toFixed(5)}$`).show();let S=(20/d).toFixed(5);$("#nbTokensToSwap").attr("max",S),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((f*d).toFixed(5))),$("#maxUCOValue").attr("value",Math.min(f,S).toFixed(5)),u=d}},5e3),$("#recipientAddress").on("change",async d=>{let v=await T($(d.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(v).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((u*v).toFixed(5))),$("#btnSwap").prop("disabled",!1)}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("input",d=>{let S=$(d.target).val();$("#swapBalanceUSD").text((S*u).toFixed(5))}),$("#maxButton").on("click",()=>{let d=$("#maxUCOValue").val();$("#nbTokensToSwap").val(d),$("#swapBalanceUSD").text((d*u).toFixed(5))}),$("#close").on("click",()=>{$("#workflow").hide()});let p=localStorage.getItem("pendingTransfer"),b;p&&(b=await Z(p,t,C,h,B,s,r,n)),$("#swapForm").on("submit",async d=>{if(d.preventDefault(),!d.target.checkValidity())return;if($("#error").text(""),b){k();try{await A(localStorage.getItem("transferStep"),b)}catch(v){H(v,x)}return}let S=$("#recipientAddress").val();await Y(r,C,s,S,t,a,h,l,n,f)})}async function Y(e,t,r,n,i,c,s,o,a,h){D(),x=0;let l=$("#nbTokensToSwap").val();if(h*1e18<l*1e18){$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),$("#error").text(`Insufficient UCO on ${a}`),$("#close").show();return}if(await T(o)<=l*1e8){$("#error").text("Bridge has insuffficient funds. Please retry later..."),$("#close").show();return}$("#steps").show();let m=new Uint8Array(32);crypto.getRandomValues(m);let C=L(m),g=await crypto.subtle.digest("SHA-256",m);g=new Uint8Array(g);let f=L(g);$("#ethDeploymentStep").addClass("is-active"),x=1;try{let{contract:p,transaction:b}=await J(r,t.address,l,g,e,7200);localStorage.setItem("pendingTransfer",JSON.stringify({HTLC_Address:p.address,secretHex:C,secretDigestHex:f,amount:l,recipientArchethic:n,HTLC_transaction:b})),localStorage.setItem("transferStep","deployedEthContract"),$("#ethDeploymentStep").removeClass("is-active");let d=p.address;$("#txSummary1Label").html(`Contract address on ${a}: <a href="${s}/address/${p.address}" target="_blank">${p.address}</a>`),$("#txSummary1").show(),await A("deployedEthContract",{HTLC_Contract:p,secretHex:C,secretDigestHex:f,amount:l,ethChainId:i,recipientEthereum:r,recipientArchethic:n,unirisContract:t,signer:e,sourceChainExplorer:s,toChainExplorer:B,HTLC_transaction:b})}catch(p){H(p,x)}}async function A(e,t){switch(e){case"deployedEthContract":return e=2,t=await R(t),await A("transferedERC20",t);case"transferedERC20":return e=3,t=await M(t),await A("deployedArchethicContract",t);case"deployedArchethicContract":return e=4,$("#swapStep").addClass("is-active"),t=await j(t),await A("withdrawEthContract",t);case"withdrawEthContract":await W(t),$("#swapStep").removeClass("is-active"),$("#btnSwapSpinner").hide(),$("#btnSwap").prop("disabled",!1),$("#btnSwap").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#close").show(),console.log("Token swap finish"),localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),setTimeout(async()=>{let n=await T(t.recipientArchethic)/1e8;$("#toBalanceUCO").text(parseFloat(n).toFixed(2)),$("#toBalanceUSD").text((u*n).toFixed(5))},2e3);break}}async function Z(e,t,r,n,i,c,s,o){$("#btnSwapSpinnerText").text("Loading previous transfer"),$("#btnSwapSpinner").show(),$("#btnSwap").hide();let a=JSON.parse(e),h={HTLC_Contract:await P(a.HTLC_Address,provider),HTLC_transaction:a.HTLC_transaction,secretHex:a.secretHex,secretDigestHex:a.secretDigestHex,amount:a.amount,ethChainId:t,recipientEthereum:c,recipientArchethic:a.recipientArchethic,unirisContract:r,signer:s,erc20transferAddress:a.erc20transferAddress,archethicContractAddress:a.archethicContractAddress,withdrawEthereumAddress:a.withdrawEthereumAddress,sourceChainExplorer:n,toChainExplorer:i};$("#recipientAddress").val(a.recipientArchethic),$("#nbTokensToSwap").val(a.amount);let w=await T(a.recipientArchethic)/1e8;switch($("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(w).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((u*w).toFixed(5))),$("#swapBalanceUSD").text((a.amount*u).toFixed(5)),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#txSummary1Label").html(`Contract address on ${o}: <a href="${n}/address/${a.HTLC_Address}" target="_blank">${a.HTLC_Address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active"),x=2,a.erc20transferAddress&&(x=3,$("#txSummary2Label").html(`Provision UCO: <a href="${n}/tx/${a.erc20transferAddress}" target="_blank">${a.erc20transferAddress}</a>`),$("#txSummary2").show()),a.archethicContractAddress&&(x=4,$("#txSummary3Label").html(`Contract address on Archethic: <a href="${i}/${a.archethicContractAddress}" target="_blank">${a.archethicContractAddress}</a>`),$("#txSummary3").show()),a.withdrawEthereumAddress&&($("#txSummary4Label").html(`${o} swap: <a href="${n}/tx/${a.withdrawEthereumAddress}" target="_blank">${a.withdrawEthereumAddress}</a>`),$("#txSummary4").show()),$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),x){case 2:$("#ethTransferStep").addClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-failed is-active"),$("#ethTransferStep").removeClass("is-failed is-active");break;case 4:$("#swapStep").addClass("is-active"),$("#swapStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;default:break}return $("#steps").show(),h}})();
//# sourceMappingURL=app.js.map
