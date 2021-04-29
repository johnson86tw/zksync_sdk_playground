const ethers = require("ethers");
const zksync = require("zksync");
require("dotenv").config();

// transfer 0.001 ETH from wallet to wallet2

const privateKey = process.env.ZKSYNC_DEV_PRIVATE_KEY;
const privateKey2 = process.env.ZKSYNC_DEV2_PRIVATE_KEY;

const main = async () => {
  const syncProvider = await zksync.getDefaultProvider("rinkeby");
  const ethersProvider = ethers.getDefaultProvider("rinkeby");

  // wallet
  const ethWallet = new ethers.Wallet(privateKey, ethersProvider);
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  // wallet2
  const ethWallet2 = new ethers.Wallet(privateKey2, ethersProvider);
  const syncWallet2 = await zksync.Wallet.fromEthSigner(
    ethWallet2,
    syncProvider
  );

  const amount = zksync.utils.closestPackableTransactionAmount(
    ethers.utils.parseEther("0.001")
  );

  const transfer = await syncWallet.syncTransfer({
    to: syncWallet2.address(),
    token: "ETH",
    amount,
  });

  console.log("tracking transfer status...");
  const transferReceipt = await transfer.awaitReceipt();

  console.log("transfer receipt: ", transferReceipt);

  const committedETHBalance = await syncWallet.getBalance("ETH");
  console.log(
    "wallet 1 committed balance: ",
    ethers.utils.formatEther(committedETHBalance)
  );

  const committedETHBalance2 = await syncWallet2.getBalance("ETH");
  console.log(
    "wallet 2 committed balance: ",
    ethers.utils.formatEther(committedETHBalance2)
  );
};

main();
