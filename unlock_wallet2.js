const ethers = require("ethers");
const zksync = require("zksync");
require("dotenv").config();

const main = async () => {
  const privateKey = process.env.ZKSYNC_DEV2_PRIVATE_KEY;

  console.log("waiting for get zksync provider...");
  const syncProvider = await zksync.getDefaultProvider("rinkeby");
  const ethersProvider = ethers.getDefaultProvider("rinkeby");

  const ethWallet = new ethers.Wallet(privateKey, ethersProvider);

  console.log("waiting for derive zksync signer...");
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  console.log("waiting for unlocking zkSync account...");
  if (!(await syncWallet.isSigningKeySet())) {
    if ((await syncWallet.getAccountId()) == undefined) {
      throw new Error("Unknown account");
    }

    // As any other kind of transaction, `ChangePubKey` transaction requires fee.
    // User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
    // the lowest possible amount.
    const changePubkey = await syncWallet.setSigningKey({
      feeToken: "ETH",
      ethAuthType: "ECDSA",
    });

    // Wait until the tx is committed
    await changePubkey.awaitReceipt();
  } else {
    console.log("has been unlocked");
  }

  const committedETHBalance = await syncWallet.getBalance("ETH");
  console.log(
    "committed balance: ",
    ethers.utils.formatEther(committedETHBalance)
  );

  const verifiedETHBalance = await syncWallet.getBalance("ETH", "verified");
  console.log(
    "verified balance: ",
    ethers.utils.formatEther(verifiedETHBalance)
  );
};

main();
