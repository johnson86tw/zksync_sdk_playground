const ethers = require("ethers");
const zksync = require("zksync");
require("dotenv").config();

// deposit 0.05 ETH from ethWallet to syncWallet

const privateKey = process.env.ZKSYNC_DEV_PRIVATE_KEY;

const main = async () => {
  // wallet(1)
  const syncProvider = await zksync.getDefaultProvider("rinkeby");
  const ethersProvider = ethers.getDefaultProvider("rinkeby");

  const ethWallet = new ethers.Wallet(privateKey, ethersProvider);
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  // deposit
  console.log("waiting for deposit...");
  const deposit = await syncWallet.depositToSyncFromEthereum({
    depositTo: syncWallet.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.05"),
  });

  // this line should wait a while
  console.log("waiting for receipt confirmation from zkSync operator...");
  const confirmation = await deposit.awaitReceipt();
  console.log("confirmation: ", confirmation);

  // Unlocking zkSync account
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

  // balance
  const committedETHBalance = await syncWallet.getBalance("ETH");
  console.log(
    "wallet committed: ",
    ethers.utils.formatEther(committedETHBalance)
  );

  const verifiedETHBalance = await syncWallet.getBalance("ETH", "verified");
  console.log("wallet verified", ethers.utils.formatEther(verifiedETHBalance));
};

main();
