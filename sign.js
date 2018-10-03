function parseSignature(signature) {
  var r = signature.substring(0, 64);
  var s = signature.substring(64, 128);
  var v = signature.substring(128, 130);

  return {
      r: "0x" + r,
      s: "0x" + s,
      v: parseInt(v, 16)
  }
}

function genSolidityVerifier(signature, signer) {
	return solidityCode.replace("<SIGR>", signature.r)
	  .replace("<SIGS>", signature.s)
    .replace("<SIGV>", signature.v)
    .replace("<SIGNER>", signer);
}

window.onload = function (e) {
  var res = document.getElementById("response");
  res.style.display = "none";

  // force the user to unlock their MetaMask
  if (web3.eth.accounts[0] == null) {
    alert("Please unlock MetaMask first");
  }

  var signBtn = document.getElementById("signBtn");
  signBtn.onclick = function(e) {
    if (web3.eth.accounts[0] == null) {
      return;
    }

    const domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
    ];



    const identity = [
      { name: "action", type: "string" },
      { name: "nonce", type: "uint256" },
      { name: "wallet", type: "address" }
    ];

    const domainData = {
      name: "Zinc",
      version: "1",
      chainId: parseInt(web3.version.network, 10),
      verifyingContract: "0x1C56346CD2A2Bf3202F771f50d3D14a367B48070",
      salt: "0x7fea5b30300bd02ca3e22c7837f297a642201dca2185ee2408c2db05f12b94e3"
    };

    var message = {
      action: "sign up",
      nonce: 42,
      wallet: web3.eth.accounts[0]
    };
    
    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        Identity: identity
      },
      domain: domainData,
      primaryType: "Identity",
      message: message
    });

    const signer = web3.eth.accounts[0];

    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData_v3",
        params: [data, signer],
        from: signer
      }, 
      function(err, result) {
        if (err || result.error) {
          return console.error(result);
        }

        const signature = parseSignature(result.result.substring(2));

        res.style.display = "block"
        res.value = genSolidityVerifier(signature, signer);
      }
    );
  };
}
